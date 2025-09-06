# services/device_service.py
from Schemas.device_model import devices, DeviceRecord
from bson import ObjectId
from datetime import datetime, timezone
from typing import List, Dict

# Keep previous simple CRUD functions, but add an upsert helper to update after scans

def add_device(user_id, name, ip, device_type):
    new_device = {
        "user_id": user_id,
        "name": name,
        "ip": ip,
        "type": device_type,
        "created_at": datetime.now(timezone.utc)
    }
    result = devices.insert_one(new_device)
    return str(result.inserted_id)


def get_devices(user_id):
    device_list = list(devices.find({"user_id": user_id}, {"user_id": 0}))
    for device in device_list:
        device["_id"] = str(device["_id"])
    return device_list


def delete_device(user_id, device_id):
    result = devices.delete_one({"_id": ObjectId(device_id), "user_id": user_id})
    return result.deleted_count > 0


def update_device(user_id, device_id, update_data):
    result = devices.update_one(
        {"_id": ObjectId(device_id), "user_id": user_id},
        {"$set": update_data}
    )
    return result.modified_count > 0


# -------------------------
# New helper used by scan_service
# -------------------------
def compute_risk_score(max_cvss: float, open_ports_count: int, suspicious: bool) -> int:
    """
    Lightweight risk score:
      - base = max_cvss * 10 (score 0..100)
      - add open_ports_count * 2
      - add 15 if suspicious
    Final clamp to 0..100
    """
    try:
        score = int(round((max_cvss or 0.0) * 10))
    except Exception:
        score = 0
    score += open_ports_count * 2
    if suspicious:
        score += 15
    if score > 100:
        score = 100
    if score < 0:
        score = 0
    return score


def upsert_device_from_scan(ip: str,
                            network_info: dict,
                            firmware: str | None = None,
                            open_ports: List[dict] = None,
                            cve_results: dict = None,
                            suspicious: bool = False,
                            os_fingerprint: list = None):
    """
    Create or update device document keyed by IP.
    Writes fields:
      - device_id (object id string)
      - network_info (ip, mac if known)
      - firmware
      - risk_score
      - status
      - last_scan (timestamp)
      - open_ports (structured)
      - cve_summary (counts & max_cvss)
    """
    open_ports = open_ports or []
    cve_results = cve_results or {}

    # compute open_ports_count
    open_ports_count = 0
    # If vuln_scan 'vulnerabilities' list was passed, count distinct ports; else if open_ports is list of dicts with 'port'
    if isinstance(open_ports, list):
        counts = set()
        for p in open_ports:
            port = p.get("port") if isinstance(p, dict) else None
            if port:
                try:
                    counts.add(int(port))
                except Exception:
                    pass
        open_ports_count = len(counts)

    # compute max_cvss across cve_results
    max_cvss = 0.0
    vuln_count = 0
    for service, cves in (cve_results.items() if isinstance(cve_results, dict) else []):
        if isinstance(cves, list):
            vuln_count += len([c for c in cves if isinstance(c, dict) and c.get("id")])
            for c in cves:
                try:
                    cvss = c.get("cvss", 0.0) if isinstance(c, dict) else 0.0
                    if cvss and float(cvss) > max_cvss:
                        max_cvss = float(cvss)
                except Exception:
                    continue

    # suspicious flag could be overridden by open_ports presence of high risk ports
    high_risk_ports = {22, 23, 3389, 445, 5900}
    for p in open_ports:
        try:
            if int(p.get("port", 0)) in high_risk_ports:
                suspicious = True
                break
        except Exception:
            pass

    risk_score = compute_risk_score(max_cvss, open_ports_count, suspicious)

    status = "Active"
    if max_cvss >= 9.0:
        status = "Vulnerable - Critical"
    elif max_cvss >= 7.0:
        status = "Vulnerable - High"
    elif risk_score >= 50:
        status = "At Risk"

    # Prepare update document
    now = datetime.now(timezone.utc)
    update_doc = {
        "network_info": network_info or {"ip": ip},
        "firmware": firmware,
        "open_ports": open_ports,
        "cve_summary": {
            "max_cvss": max_cvss,
            "vuln_count": vuln_count,
            "details": cve_results
        },
        "risk_score": risk_score,
        "status": status,
        "suspicious": suspicious,
        "os_fingerprint": os_fingerprint or [],
        "last_scan": now
    }

    # Upsert by IP
    result = devices.update_one(
        {"network_info.ip": ip},
        {"$set": update_doc, "$setOnInsert": {"created_at": now}},
        upsert=True
    )

    # Return the resulting document (string id)
    doc = devices.find_one({"network_info.ip": ip})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc
