from pydantic import BaseModel, EmailStr, Field, ConfigDict, BeforeValidator
from typing import Optional, Annotated
from datetime import datetime
from bson import ObjectId

# --- Pydantic V2 Fix for ObjectId ---
# Ye naya tarika hai MongoDB ID ko handle karne ka
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserInDB(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    registration_number: str
    full_name: str
    email: EmailStr
    mobile_number: str
    hashed_password: str
    role: str = "student"     
    wallet_balance: float = 0.0
    hostel_room: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)

    # Naya Config Setup (V2 Compatible)
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )