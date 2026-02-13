from fastapi import APIRouter, HTTPException, status
from app.database import database
from app.models.user import UserInDB
from app.schemas.user import UserCreate, UserResponse
from app.utils.security import get_password_hash
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    try:
        print(f"📥 Registering: {user.email}") # Terminal mein print hoga

        # 1. Check karo user pehle se hai ya nahi
        existing_user = await database["users"].find_one({
            "$or": [{"email": user.email}, {"registration_number": user.registration_number}]
        })
        
        if existing_user:
            raise HTTPException(
                status_code=400, 
                detail="Student already registered with this Email or Registration Number"
            )

        # 2. Password Hash karo
        hashed_password = get_password_hash(user.password)

        # 3. Data Taiyar karo
        user_data = UserInDB(
            registration_number=user.registration_number,
            full_name=user.full_name,
            email=user.email,
            mobile_number=user.mobile_number,
            hashed_password=hashed_password,
            created_at=datetime.now()
        )

        # --- FIX IS HERE (Ye line sabse important hai) ---
        # Data ko dictionary mein badlo
        user_dict = user_data.model_dump(by_alias=True, exclude=["id"])
        
        # Agar _id None hai, toh usse hata do (MongoDB khud bana lega)
        if "_id" in user_dict and user_dict["_id"] is None:
            user_dict.pop("_id")
        # -------------------------------------------------

        # 4. Save karo
        new_user = await database["users"].insert_one(user_dict)
        print(f"✅ Success! User ID: {new_user.inserted_id}")

        # 5. Response Return karo
        return {
            **user.model_dump(), 
            "wallet_balance": 0.0, 
            "role": "student"
        }

    except Exception as e:
        # Agar ab bhi error aaya toh terminal mein saaf dikhega
        print(f"🔥 ERROR in Register: {str(e)}") 
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")