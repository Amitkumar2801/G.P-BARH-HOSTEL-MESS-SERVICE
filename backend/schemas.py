# backend/schemas.py
from pydantic import BaseModel

# Ye bouncer check karega ki React se aane wala data theek hai ya nahi
class UserCreate(BaseModel):
    full_name: str
    reg_no_email: str
    password: str
    role: str = "student" # Default role student rahega

    # backend/schemas.py mein niche add karo:
    class UserLogin(BaseModel):
        reg_no_email: str
        password: str