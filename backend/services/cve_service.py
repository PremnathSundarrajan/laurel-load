# services/cve_service.py
import requests
import re

# NVD base url
NVD_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0"


def fetch_cves(keyword: str, max_results: int = 5):
    """
    Fetch CVEs from NVD using keyword search and return list of normalized CVE dicts.
    Each returned dict will try to include:
    { "id": ..., "description": ..., "metrics": ..., "references": [...], "raw": <raw cve obj> }
    """
    params = {"keywordSearch": keyword, "resultsPerPage": max_results}
    try:
        resp = requests.get(NVD_BASE, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        out = []
        for item in data.get("vulnerabilities", []):
            cve = item.get("cve", {})
            descriptions = cve.get("descriptions", [])
            desc = ""
            if descriptions:
                # pick first english description
                for d in descriptions:
                    if d.get("lang", "").lower() == "en":
                        desc = d.get("value", "")
                        break
                if not desc:
                    desc = descriptions[0].get("value", "")

            metrics = cve.get("metrics", {})  # contains cvssMetrics if present
            references = [ref.get("url") for ref in cve.get("references", [])]

            out.append({
                "id": cve.get("id"),
                "description": desc,
                "metrics": metrics,
                "references": references,
                "raw": cve
            })
        return out
    except Exception as e:
        return [{"error": f"Failed to fetch CVEs: {str(e)}"}]


def extract_cvss_from_cve(cve_entry: dict) -> float | None:
    """
    Try to extract a CVSS score (v3 if available, else v2) from the NVD metrics structure.
    Returns float or None.
    """
    if not isinstance(cve_entry, dict):
        return None

    metrics = cve_entry.get("metrics", {}) or {}

    # Common NVD fields:
    # metrics may contain "cvssMetricV31", "cvssMetricV30", "cvssMetricV2"
    for key in ("cvssMetricV31", "cvssMetricV30", "cvssMetricV2"):
        v = metrics.get(key)
        if v:
            # v may be a list
            if isinstance(v, list) and len(v) > 0:
                item = v[0]
                cvss = item.get("cvssData", {}).get("baseScore") or item.get("baseScore")
                try:
                    return float(cvss)
                except Exception:
                    pass
            elif isinstance(v, dict):
                cvss = v.get("cvssData", {}).get("baseScore") or v.get("baseScore")
                try:
                    return float(cvss)
                except Exception:
                    pass

    # fallback: attempt to find numeric score in description text (rare)
    desc = cve_entry.get("description", "") or ""
    m = re.search(r"CVSS\sv3.*?([\d\.]{1,4})", desc, re.I)
    if m:
        try:
            return float(m.group(1))
        except Exception:
            pass

    return None


def map_cvss_to_severity(score: float | None) -> str:
    """
    Map numeric CVSS to severity label.
    (CVSS v3 mapping)
    """
    if score is None:
        return "Unknown"
    try:
        s = float(score)
    except Exception:
        return "Unknown"

    if s >= 9.0:
        return "Critical"
    if s >= 7.0:
        return "High"
    if s >= 4.0:
        return "Medium"
    if s >= 0.1:
        return "Low"
    return "None"
