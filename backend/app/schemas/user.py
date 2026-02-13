from pydantic import BaseModel, EmailStr

# Jab koi Register karega, toh ye data bhejna padega
class UserCreate(BaseModel):
    registration_number: str
    full_name: str
    email: EmailStr
    mobile_number: str
    password: str

# Jab hum User ko wapas dikhayenge (Password chupa denge)
class UserResponse(BaseModel):
    registration_number: str
    full_name: str
    email: EmailStr
    wallet_balance: float
    role: str