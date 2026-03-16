# backend/main.py
from fastapi import FastAPI
import models
from database import engine

# Engine start hote hi database mein saari tables (jaise Student) bana do
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to GP Barh Hostel API! 🚀", "status": "Database Connected & Tables Created!"}