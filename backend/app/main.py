# backend/app/main.py
import sys
from pathlib import Path

# Ensure backend directory is in sys.path so modules resolve correctly
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Import the primary, full-featured FastAPI application from main.py
try:
    import main as primary_backend
    app = primary_backend.app
except Exception as err:
    print(f"Notice: Delegating to standalone fallback FastAPI instance: {err}")
    from fastapi import FastAPI
    app = FastAPI(title="GP Barh Hostel & Mess Service (Standalone)")

# Optional legacy MongoDB route inclusion (if MongoDB is available)
try:
    from app.routes import auth as legacy_auth
    app.include_router(legacy_auth.router, prefix="/api/legacy-auth", tags=["Legacy Authentication"])
except Exception as err:
    pass

@app.get("/test-db", tags=["Health Check"])
async def test_db():
    try:
        from app.database import db
        if db is not None:
            collections = await db.list_collection_names()
            return {"Message": "MongoDB Connected Successfully! ✅", "Collections": collections}
        return {"Message": "MongoDB Standby (MONGO_URI not configured, primary PostgreSQL/SQLite active) ℹ️"}
    except Exception as e:
        return {"Message": "MongoDB Check Notice ℹ️", "Detail": str(e)}