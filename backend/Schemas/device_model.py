# Schemas/device_model.py
from utils.db import db
from datetime import datetime, timezone

devices = db["devices"]

class DeviceRecord:
    @staticmethod
    def upsert_by_ip(ip: str, data: dict):
        now = datetime.now(timezone.utc)
        result = devices.update_one(
            {"network_info.ip": ip},
            {"$set": data, "$setOnInsert": {"created_at": now}},
            upsert=True
        )
        doc = devices.find_one({"network_info.ip": ip})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    @staticmethod
    def get_by_ip(ip: str):
        doc = devices.find_one({"network_info.ip": ip})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    @staticmethod
    def list_all():
        docs = list(devices.find({}))
        for d in docs:
            d["_id"] = str(d["_id"])
        return docs
