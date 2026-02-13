from fastapi import APIRouter, HTTPException, status
from app.database import database
from app.models.user import UserInDB
from app.schemas.user import UserCreate, UserResponse
from app.utils.security import get_password_hash
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    # 1. Check karo ki kya user pehle se maujood hai? (Email ya Registration No.)
    existing_user = await database["users"].find_one({
        "$or": [{"email": user.email}, {"registration_number": user.registration_number}]
    })
    
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="Student already registered with this Email or Registration Number"
        )

    # 2. Password ko encrypt (Hash) karo
    hashed_password = get_password_hash(user.password)

    # 3. Database ke liye data taiyar karo
    user_data = UserInDB(
        registration_number=user.registration_number,
        full_name=user.full_name,
        email=user.email,
        mobile_number=user.mobile_number,
        hashed_password=hashed_password,
        created_at=datetime.now()
    )

    # 4. MongoDB mein save karo
    new_user = await database["users"].insert_one(user_data.dict(by_alias=True))
    
    # 5. Response wapas bhejo
    return {**user.dict(), "wallet_balance": 0.0, "role": "student"}