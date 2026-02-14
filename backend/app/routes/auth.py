from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel 
from app.database import database
from app.models.user import UserInDB
from app.schemas.user import UserCreate, UserResponse
from app.utils.security import get_password_hash, verify_password # <--- Ye naya import hai
from datetime import datetime

router = APIRouter()

# --- Registration API (Jo pehle se thi) ---
@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    try:
        # Check if user exists
        existing_user = await database["users"].find_one({
            "$or": [{"email": user.email}, {"registration_number": user.registration_number}]
        })
        
        if existing_user:
            raise HTTPException(
                status_code=400, 
                detail="Student already registered with this Email or Registration Number"
            )

        hashed_password = get_password_hash(user.password)

        user_data = UserInDB(
            registration_number=user.registration_number,
            full_name=user.full_name,
            email=user.email,
            mobile_number=user.mobile_number,
            hashed_password=hashed_password,
            created_at=datetime.now()
        )

        user_dict = user_data.model_dump(by_alias=True, exclude=["id"])
        if "_id" in user_dict and user_dict["_id"] is None:
            user_dict.pop("_id")

        new_user = await database["users"].insert_one(user_dict)
        
        return {
            **user.model_dump(), 
            "wallet_balance": 0.0, 
            "role": "student"
        }

    except Exception as e:
        print(f"🔥 ERROR in Register: {str(e)}") 
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

# --- 👇 NAYA CODE: Login API Yahan Se Shuru Hai 👇 ---

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login_user(login_data: LoginRequest):
    print(f"🔑 Login Attempt: {login_data.email}")

    # 1. Email dhoondo database mein
    user = await database["users"].find_one({"email": login_data.email})
    
    if not user:
        print("❌ User nahi mila")
        raise HTTPException(status_code=400, detail="Incorrect Email or Password")

    # 2. Password match karo
    is_password_correct = verify_password(login_data.password, user["hashed_password"])
    
    if not is_password_correct:
        print("❌ Password galat hai")
        raise HTTPException(status_code=400, detail="Incorrect Email or Password")

    # 3. Agar sab sahi hai, toh Success bhejo
    print("✅ Login Successful!")
    return {
        "message": "Login Successful!",
        "user_name": user["full_name"],
        "registration_number": user["registration_number"],
        "wallet_balance": user["wallet_balance"],
        "role": user["role"]
    }