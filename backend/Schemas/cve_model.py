from utils.db import db
from datetime import datetime

cves = db["cves"]

class CVERecord:
    @staticmethod
    def save_scan(ip: str, result: dict):
        """
        Save CVE scan results.
        result: {"service_name": [cve_list], ...}
        """
        for service, cve_list in result.items():
            document = {
                "ip": ip,
                "service": service,
                "cves": cve_list,
                "timestamp": datetime.utcnow()
            }
            cves.insert_one(document)

    @staticmethod
    def get_by_ip(ip: str):
        results = list(cves.find({"ip": ip}).sort("timestamp", -1))
        for r in results:
            r["_id"] = str(r["_id"])
        return results

    @staticmethod
    def get_by_service(service: str):
        results = list(cves.find({"service": service}).sort("timestamp", -1))
        for r in results:
            r["_id"] = str(r["_id"])
        return results
