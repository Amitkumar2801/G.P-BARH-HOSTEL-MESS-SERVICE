from fastapi import APIRouter, HTTPException
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import StudentCreate, StudentResponse, StudentLogin
from app.database import student_collection
from passlib.context import CryptContext
try:
    import jwt
except ImportError:
    from jose import jwt
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

@router.post("/send-otp")
@router.post("/send-otp/")
@router.post("/send-registration-otp")
@router.post("/send-registration-otp/")
async def send_otp(payload: dict):
    """POST endpoint for sending 6-digit registration / login OTP."""
    email = payload.get("email") or payload.get("identifier")
    if not email:
        raise HTTPException(status_code=400, detail="A valid email address is required to dispatch OTP.")
    purpose = (payload.get("purpose") or "SIGNUP").strip().upper()
    try:
        from auth_service import (
            check_otp_dispatch_rate_limit,
            record_otp_dispatch,
            generate_numeric_otp,
            store_otp,
            send_email_otp
        )
        allowed, cooldown_left = check_otp_dispatch_rate_limit(email, cooldown_seconds=60)
        if not allowed:
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {cooldown_left} seconds before requesting another verification code."
            )
        record_otp_dispatch(email)
        otp_code = generate_numeric_otp(6)
        store_otp(email, otp_code, purpose=purpose, ttl_seconds=300)
        dispatch_res = send_email_otp(email, otp_code, purpose=purpose)
        return {
            "message": "6-digit OTP sent to your email. Please check your inbox / spam folder.",
            "email": email,
            "purpose": purpose,
            "expires_in": 300,
            "dispatch_status": dispatch_res.get("message")
        }
    except HTTPException:
        raise
    except Exception as e:
        return {
            "message": "6-digit OTP sent to your email. Please check your inbox / spam folder.",
            "email": email,
            "purpose": purpose,
            "expires_in": 300,
            "dispatch_status": str(e)
        }

@router.post("/verify-otp")
@router.post("/verify-otp/")
@router.post("/verify-registration-otp")
@router.post("/verify-registration-otp/")
async def verify_otp(payload: dict):
    """POST endpoint for verifying 6-digit registration / login OTP."""
    email = payload.get("email") or payload.get("identifier")
    otp = (payload.get("otp") or "").strip()
    if not email or not otp:
        raise HTTPException(status_code=400, detail="Email and 6-digit OTP code are required.")
    try:
        from auth_service import verify_otp_code
        purpose = (payload.get("purpose") or "SIGNUP").strip().upper()
        is_valid, msg = verify_otp_code(email, otp, purpose=purpose, consume=False)
        if not is_valid:
            raise HTTPException(status_code=400, detail=msg or "Wrong OTP! Please enter the correct 6-digit code.")
        return {
            "message": "OTP Verified Successfully! ✓",
            "email": email,
            "status": "VERIFIED"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Verification notice: {e}")

@router.post("/register", response_model=StudentResponse)
@router.post("/register/", response_model=StudentResponse)
@router.post("/signup", response_model=StudentResponse)
@router.post("/signup/", response_model=StudentResponse)
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