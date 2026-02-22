import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# .env file se database ka link (MONGO_URI) uthana
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# MongoDB se connect karna
client = AsyncIOMotorClient(MONGO_URI)
db = client.gp_barh_hostel

# Database table (collection) ka reference
student_collection = db.get_collection("students")

print("Database Config Loaded! 🟢")