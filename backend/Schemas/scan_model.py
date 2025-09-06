# models/scan_model.py
from utils.db import db
from datetime import datetime, timezone

class ScanResult:
    collection = db["scans"]

    @staticmethod
    def save_result(scan_type, data):
        """Save scan results in DB"""
        doc = {
            "scan_type": scan_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc)
        }
        ScanResult.collection.insert_one(doc)

    @staticmethod
    def get_results(scan_type=None):
        """Retrieve scan results"""
        query = {}
        if scan_type:
            query["scan_type"] = scan_type
        return list(ScanResult.collection.find(query, {"_id": 0}))
