# backend/utils/db.py
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/laurel")
client = MongoClient(MONGO_URI)

# Access the "laurel" database
db = client.get_database()

# Example: db.users, db.devices, etc.
