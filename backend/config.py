# backend/config.py
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# -----------------------
# MongoDB Configuration
# -----------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/laurel")

# -----------------------
# JWT Configuration
# -----------------------
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
JWT_ALGO = os.getenv("JWT_ALGO", "HS256")
JWT_EXP_SECONDS = int(os.getenv("JWT_EXP_SECONDS", 3600))  # 1 hour default

# -----------------------
# Other Configs
# -----------------------
DEBUG = os.getenv("DEBUG", "True") == "True"
