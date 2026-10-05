from fastapi import APIRouter, HTTPException
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import StudentCreate, StudentResponse, StudentLogin
from app.database import student_collection
from passlib.context import CryptContext
import jwt
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

# .env se secret code uthana
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 🎟️ NAYA FUNCTION: Digital Pass (Token) Banane ke liye
def create_access_token(data: dict):
    to_encode = data.copy()
    # Token 1 ghante (60 minutes) ke baad expire ho jayega
    expire = datetime.now(timezone.utc) + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    # Token pe stamp lagana
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def _check_collection():
    if student_collection is None:
        raise HTTPException(
            status_code=503,
            detail="MongoDB service is not configured (MONGO_URI missing). Please use standard PostgreSQL/SQLite API."
        )

@router.post("/register", response_model=StudentResponse)
async def register_student(student: StudentCreate):
    _check_collection()
    existing_user = await student_collection.find_one({"email": student.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Ye email pehle se register hai bhai!")

    hashed_password = get_password_hash(student.password)

    student_data = {
        "name": student.name,
        "email": student.email,
        "password": hashed_password,
        "registration_number": student.registration_number,
        "role": "student"
    }

    await student_collection.insert_one(student_data)
    return student_data

@router.post("/login")
async def login_student(student: StudentLogin):
    _check_collection()
    db_student = await student_collection.find_one({"email": student.email})
    if not db_student:
        raise HTTPException(status_code=404, detail="Bhai, is email se koi account nahi mila!")

    if not verify_password(student.password, db_student["password"]):
        raise HTTPException(status_code=400, detail="Password galat hai bhai!")

    # 🎟️ Agar password sahi hai, toh naya Token banao!
    access_token = create_access_token(data={"sub": db_student["email"]})

    # Ab hum normal message ki jagah token bhejenge
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "student_name": db_student["name"]
    }


# 🛡️ Darbaan (Guard) ka setup
security = HTTPBearer()


# Ye function Token ko check karega ki asli hai ya nakli
async def get_current_student(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Token ko open karke dekhna ki kis student ka hai
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token mein email nahi mila bhai!")
        return email
    except Exception:
        raise HTTPException(status_code=401, detail="Nakli ya Expire ho chuka Token! Darwaza band! ❌")


# 🔒 Naya LOCKED Rasta (Sirf Token walo ke liye)
@router.get("/profile")
async def student_profile(email: str = Depends(get_current_student)):
    _check_collection()
    # Database se us email ka data uthana
    db_student = await student_collection.find_one({"email": email})

    # Password hata kar baaki details dikhana
    return {
        "message": "Welcome to your safe profile! 🛡️",
        "name": db_student["name"],
        "email": db_student["email"],
        "registration_number": db_student["registration_number"]
    }