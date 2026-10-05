import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger("app.database")
load_dotenv()

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
        print("Database Config Notice: MONGO_URI not configured. Motor client in standby mode.")
except ImportError as err:
    print(f"Database Config Warning: 'motor' library not installed ({err}). MongoDB client in standby mode.")
except Exception as err:
    print(f"Database Config Warning: Could not initialize Motor MongoDB client: {err}")