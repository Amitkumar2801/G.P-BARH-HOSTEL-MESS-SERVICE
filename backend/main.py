from fastapi import FastAPI

# Engine start ho raha hai
app = FastAPI()

# Jab koi humari API ke main raste ("/") par aayega, toh ye message milega
@app.get("/")
def read_root():
    return {"message": "Welcome to GP Barh Hostel API! 🚀", "status": "Engine is Running!"}