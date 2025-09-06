# services/scan_service.py
import time
from datetime import datetime, timezone
from services.scanner.port_scanner import discover_hosts, is_iot_device, scan_ports, os_fingerprint
from services.scanner.version_detector import detect_version
from services.scanner.vuln_scanner import vuln_scan
from services.cve_service import fetch_cves, extract_cvss_from_cve, map_cvss_to_severity
from services.device_service import upsert_device_from_scan
from Schemas.scan_model import ScanResult

# In-memory cache (you had this pattern previously)
discovered_devices = {
    "alive_hosts": [],
    "iot_hosts": []
}


def run_discovery(subnet: str) -> dict:
    """
    Discover alive hosts and mark IoT-like hosts.
    Returns dict with lists of hosts and iot_hosts.
    """
    hosts = discover_hosts(subnet)
    iot_hosts = [h for h in hosts if is_iot_device(h)]

    discovered_devices["alive_hosts"] = hosts
    discovered_devices["iot_hosts"] = iot_hosts

    return {
        "subnet": subnet,
        "alive_hosts": hosts,
        "iot_hosts": iot_hosts,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


def run_port_scan_all() -> list:
    """
    Scan open ports for all discovered IoT hosts.
    Returns a list of {ip, open_ports, suspicious_flag}
    """
    results = []
    for ip in discovered_devices.get("iot_hosts", []):
        ports = scan_ports(ip)
        # Decide suspicious heuristic: e.g., if high-risk ports (22,3389) open
        suspicious = False
        high_risk_ports = {22, 23, 3389, 445, 5900}
        for p in ports:
            try:
                if int(p.get("port", 0)) in high_risk_ports:
                    suspicious = True
                    break
            except Exception:
                pass

        entry = {"ip": ip, "open_ports": ports, "suspicious": suspicious}
        results.append(entry)

        # Save each intermediate port result for traceability
        ScanResult.save_result("ports_single", entry)

    return results


def run_version_and_cve_all() -> list:
    """
    For each discovered IoT host:
    - run version detection (via HTTP headers / endpoints / nmap fallback)
    - run vuln_scan (nmap scripts)
    - fetch CVEs for detected services and extract CVSS
    - compute severity per CVE and per-host (max_cvss)
    - upsert device in DB with computed data
    """
    results = []
    iot_hosts = discovered_devices.get("iot_hosts", [])

    for ip in iot_hosts:
        record = {"ip": ip, "timestamp": datetime.now(timezone.utc).isoformat()}

        # 1) Version detection: try typical ports (80,443) then fallback
        version_info = None
        for port_candidate in (80, 443):
            try:
                version_info = detect_version(ip, port_candidate)
            except Exception:
                version_info = version_info or None
            if version_info:
                break

        record["version_info"] = version_info

        # 2) Run vuln_scan (nmap --script vuln)
        vuln_result = vuln_scan(ip)
        record["vuln_scan"] = vuln_result

        # 3) Build a list of detected service keywords for CVE fetch.
        services_keywords = set()
        # if vuln_scan returns scripts or outputs, use script names as keywords
        for v in vuln_result.get("vulnerabilities", []):
            s = v.get("script") or v.get("output") or v.get("protocol")
            if s:
                services_keywords.add(s)

        # additionally use detected version_info.product or vendor as keyword
        if version_info:
            if version_info.get("product"):
                services_keywords.add(version_info.get("product"))
            if version_info.get("vendor"):
                services_keywords.add(version_info.get("vendor"))

        # 4) Fetch CVEs for each keyword and extract cvss
        cve_results = {}
        max_cvss = 0.0
        for kw in services_keywords:
            try:
                cves = fetch_cves(kw, max_results=8)
            except Exception:
                cves = [{"error": f"Failed to fetch CVEs for {kw}"}]

            # Normalize returned cves: ensure each entry has 'cvss' float and 'severity'
            enriched = []
            for c in cves:
                if not isinstance(c, dict):
                    continue
                if "error" in c:
                    enriched.append(c)
                    continue

                # Try to extract a numeric CVSS value from available fields
                cvss = extract_cvss_from_cve(c) or 0.0
                severity = map_cvss_to_severity(cvss)
                enriched.append({**c, "cvss": cvss, "severity": severity})

                if isinstance(cvss, (int, float)) and cvss > max_cvss:
                    max_cvss = float(cvss)

            cve_results[kw] = enriched

        record["cve_results"] = cve_results
        record["max_cvss"] = max_cvss

        # 5) Build a summary risk score (we will compute properly in device_service)
        # but include in record for visibility
        record["summary"] = {
            "max_cvss": max_cvss,
            "detected_services_count": len(services_keywords),
            "vuln_count": len(vuln_result.get("vulnerabilities", []))
        }

        results.append(record)

        # Save CVE scan to DB (uses your CVERecord.save_scan)
        # CVERecord.save_scan(ip, cve_results)
        ScanResult.save_result("version_cve_single", record)

        # Upsert device into DB with all collected info (device_service does compute risk)
        try:
            upsert_device_from_scan(
                ip=ip,
                network_info={"ip": ip},
                firmware=(version_info.get("version") if version_info else None),
                open_ports=vuln_result.get("vulnerabilities", []),  # vuln_scan includes port entries
                cve_results=cve_results,
                suspicious=False  # we'll compute suspicious properly inside upsert
            )
        except Exception as e:
            # Do not fail entire loop on DB error; log inside result
            record["db_error"] = str(e)

    return results


def run_os_fingerprint_all() -> list:
    """
    Run OS fingerprinting on discovered IoT hosts and save results.
    """
    results = []
    for ip in discovered_devices.get("iot_hosts", []):
        try:
            os_info = os_fingerprint(ip)
        except Exception:
            os_info = []
        entry = {"ip": ip, "os_fingerprint": os_info}
        results.append(entry)
        ScanResult.save_result("os_single", entry)

        # Also update device last_scan with os info
        try:
            upsert_device_from_scan(
                ip=ip,
                network_info={"ip": ip},
                firmware=None,
                open_ports=[],
                cve_results={},
                suspicious=False,
                os_fingerprint=os_info
            )
        except Exception:
            pass

    return results
