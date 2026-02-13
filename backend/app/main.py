from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import check_db_connection
from app.routes import auth  # <--- Ye Naya Import hai

app = FastAPI(
    title="GP Barh Hostel & Mess Service",
    description="Developed by Amit Kumar (AI/ML Dept)",
    version="1.0.0"
)

# CORS Settings (Frontend ke liye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup par DB connect karo
@app.on_event("startup")
async def startup_db_check():
    await check_db_connection()

# Routes ko connect karo
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"]) # <--- Ye Line Zaroori hai

@app.get("/")
def read_root():
    return {
        "Project": "GP Barh Hostel & Mess Service",
        "Developer": "Amit Kumar",
        "Status": "Server Live 🚀"
    }