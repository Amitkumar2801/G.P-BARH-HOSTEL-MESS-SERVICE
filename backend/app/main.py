from fastapi import FastAPI
from app.database import db
from app.routes import auth  # Naya Registration route import kiya

app = FastAPI()

# Registration route ko server se jod diya
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.get("/")
def read_root():
    return {"Status": "Server is Running 🚀", "Developer": "Amit Kumar"}

@app.get("/test-db")
async def test_db():
    try:
        collections = await db.list_collection_names()
        return {"Message": "Database Connected Successfully! ✅", "Collections": collections}
    except Exception as e:
        return {"Message": "Database Connection Failed! ❌", "Error": str(e)}