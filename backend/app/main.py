from fastapi import FastAPI
from app.database import check_db_connection

app = FastAPI(
    title="GP Barh Hostel & Mess Service",
    description="Developed by Amit Kumar (AI/ML Dept)",
    version="1.0.0"
)

# Server start hone par ye chalega
@app.on_event("startup")
async def startup_db_check():
    await check_db_connection()

@app.get("/")
def read_root():
    return {
        "Project": "GP Barh Hostel & Mess Service",
        "Developer": "Amit Kumar",
        "Status": "Server Live & Database Connecting... 🚀"
    }