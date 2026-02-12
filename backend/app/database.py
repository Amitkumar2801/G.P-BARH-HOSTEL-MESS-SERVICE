import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# .env file se password padho
load_dotenv()
MONGO_URL = os.getenv("MONGO_URI")

# Database se connect karo
client = AsyncIOMotorClient(MONGO_URL)
database = client.gp_barh_hostel  # Database ka naam

# Check karne ke liye helper function
async def check_db_connection():
    try:
        await client.server_info()
        print("✅ MongoDB Connected Successfully!")
    except Exception as e:
        print(f"❌ Database Connection Failed: {e}")