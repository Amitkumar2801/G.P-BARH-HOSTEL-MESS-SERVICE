from fastapi import APIRouter, HTTPException
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.user import StudentCreate, StudentResponse, StudentLogin
from app.database import student_collection
from app.core.security import pwd_context, get_password_hash, verify_password
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

try:
    import jwt
except ImportError:
    from jose import jwt

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "gp_barh_hostel_super_secure_jwt_production_secret_key_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

router = APIRouter()

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

import logging

logger = logging.getLogger(__name__)

@router.post("/send-otp")
@router.post("/send-otp/")
@router.post("/send-registration-otp")
@router.post("/send-registration-otp/")
async def send_otp(payload: dict):
    """POST endpoint for sending 6-digit registration / login OTP."""
    target_email = payload.get("email") or payload.get("identifier") or payload.get("target_email")
    if not target_email:
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
        allowed, cooldown_left = check_otp_dispatch_rate_limit(target_email, cooldown_seconds=60)
        if not allowed:
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {cooldown_left} seconds before requesting another verification code."
            )
        record_otp_dispatch(target_email)
        generated_otp = generate_numeric_otp(6)
        store_otp(target_email, generated_otp, purpose=purpose, ttl_seconds=300)

        # Dispatch email OTP with structured error handling
        try:
            import inspect
            dispatch_res = send_email_otp(target_email, generated_otp, purpose=purpose)
            if inspect.iscoroutine(dispatch_res):
                dispatch_res = await dispatch_res
            return {
                "success": True,
                "message": "OTP sent successfully to email",
                "email": target_email,
                "purpose": purpose,
                "expires_in": 300,
                "dispatch_status": dispatch_res.get("message") if isinstance(dispatch_res, dict) else "Dispatched"
            }
        except Exception as e:
            logger.error(f"SMTP Dispatch Error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to send email OTP: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SMTP Dispatch Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email OTP: {str(e)}")


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
    clean_email = student.email.lower().strip()
    clean_reg_no = (student.registration_number or student.registration_no or student.reg_no or "").strip()
    clean_password = student.password.strip()
    clean_name = student.name.strip()

    existing_user = await student_collection.find_one({
        "$or": [
            {"email": clean_email},
            {"registration_number": clean_reg_no} if clean_reg_no else {"email": clean_email}
        ]
    })
    if existing_user:
        raise HTTPException(status_code=400, detail="Ye email ya registration number pehle se register hai bhai!")

    hashed_password = get_password_hash(clean_password)

    student_data = {
        "name": clean_name,
        "email": clean_email,
        "password": hashed_password,
        "password_hash": hashed_password,
        "hashed_password": hashed_password,
        "registration_number": clean_reg_no,
        "registration_no": clean_reg_no,
        "reg_no": clean_reg_no,
        "role": "student"
    }

    await student_collection.insert_one(student_data)
    return student_data

@router.post("/login")
@router.post("/login/")
async def login_student(student: StudentLogin):
    _check_collection()
    raw_identifier = student.get_identifier() if hasattr(student, "get_identifier") else (
        student.identifier or student.email or student.registration_no or student.registration_number or student.reg_no or student.reg_no_email or ""
    ).strip()
    norm_email = raw_identifier.lower()
    clean_password = (student.password or "").strip()

    if not raw_identifier or not clean_password:
        raise HTTPException(
            status_code=400,
            detail="Identifier (Email or Registration Number) and password are required."
        )

    # Identifier normalization: check email OR registration number interchangeably
    db_student = await student_collection.find_one({
        "$or": [
            {"email": norm_email},
            {"registration_number": raw_identifier},
            {"registration_no": raw_identifier},
            {"reg_no": raw_identifier},
            {"reg_no_email": norm_email},
            {"reg_no_email": raw_identifier}
        ]
    })
    
    stored_hash = db_student.get("password") if db_student else (db_student.get("password_hash") or db_student.get("hashed_password") or "") if db_student else ""
    if not db_student or not verify_password(clean_password, stored_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid Credentials. Please check ID/Email and Password."
        )

    # 🎟️ Generate signed access token
    access_token = create_access_token(data={
        "sub": db_student.get("email") or raw_identifier,
        "registration_no": db_student.get("registration_number") or db_student.get("registration_no") or db_student.get("reg_no")
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "student_name": db_student.get("name") or db_student.get("full_name") or "Student",
        "email": db_student.get("email") or norm_email,
        "registration_no": db_student.get("registration_number") or db_student.get("registration_no") or db_student.get("reg_no") or raw_identifier
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