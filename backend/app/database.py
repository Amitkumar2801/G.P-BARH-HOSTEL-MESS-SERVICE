# backend/app/database.py
"""
GP BARH HOSTEL & MESS SERVICE - DATABASE CONNECTOR
--------------------------------------------------
Primary Database: PostgreSQL / Neon Cloud (via SQLAlchemy in backend/database.py)
Secondary / Async Database: MongoDB (via Motor client if MONGO_URI is configured)
"""

import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger("app.database")
load_dotenv()

# Primary database recommendation reference
PRIMARY_DB_ENGINE = "postgresql"

# Optional Async MongoDB client configuration
MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI")

client = None
db = None
student_collection = None

try:
    from motor.motor_asyncio import AsyncIOMotorClient
    if MONGO_URI:
        client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client.gp_barh_hostel
        student_collection = db.get_collection("students")
        print("Database Config Loaded! 🟢 (Motor MongoDB Connected)")
    else:
        print("Database Notice: Primary database is PostgreSQL/SQLAlchemy. MongoDB (Motor) is in standby mode.")
except ImportError as err:
    print(f"Database Notice: 'motor' not available ({err}). Primary database (SQLAlchemy) active.")
except Exception as err:
    print(f"Database Notice: MongoDB client initialization bypassed: {err}")