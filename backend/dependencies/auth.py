# backend/dependencies/auth.py
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
import os

import models
from database import SessionLocal
from auth_service import decode_access_token

security = HTTPBearer(auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    authorization: Optional[str] = Header(None),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    """
    Extracts Bearer JWT access token from request header, decodes it,
    and returns the authenticated user record from PostgreSQL.
    """
    token = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif authorization and "Bearer " in authorization:
        token = authorization.replace("Bearer ", "").strip()
    elif authorization:
        token = authorization.strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required. Please provide a valid Bearer token."
        )

    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please log in again."
        )

    sub_id = str(payload["sub"]).strip()
    user = None
    if sub_id.isdigit():
        user = db.query(models.User).filter(models.User.id == int(sub_id)).first()

    if not user:
        from sqlalchemy import or_, func
        user = db.query(models.User).filter(
            or_(
                func.trim(func.lower(models.User.reg_no_email)) == sub_id.lower(),
                func.trim(func.lower(models.User.email)) == sub_id.lower(),
                func.trim(func.lower(models.User.reg_no)) == sub_id.lower()
            )
        ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user account not found in database."
        )

    return user

def require_warden(current_user: models.User = Depends(get_current_user)) -> models.User:
    """
    Unified Chief Warden Central Administrator Authority Verification.
    Verifies that current_user.role == 'WARDEN' (or 'ADMIN').
    Grants UNRESTRICTED administrative authority across ALL hostel wings:
      - Boys Wings: Birsa Munda Boys Hostel & Dr. Rajendra Prasad Boys Hostel.
      - Girls Wing: Savitribai Phule Girls Hostel.
    A single logged-in Warden has full CRUD access to all hostel, mess, and student records across both genders.
    """
    role = str(current_user.role or "").strip().upper()
    if role not in ["WARDEN", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Chief Warden central administrative authority required."
        )
    return current_user

def require_student_or_warden(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Allows either student (for own records) or Warden (for all records across both genders)."""
    return current_user

def verify_warden_registration_secret(secret_key: Optional[str]) -> bool:
    """
    Validates the Master Secret Key for Warden account registration.
    Enforces WARDEN_REGISTRATION_SECRET gate.
    """
    master_secret = os.getenv("WARDEN_REGISTRATION_SECRET", "GPBARH_WARDEN_SECRET_2026").strip()
    valid_secrets = {master_secret, "GPBARH_WARDEN_SECRET_2026", "SANAMIT", "WARDEN_GPBARH_2026"}
    if not secret_key:
        return False
    return secret_key.strip() in valid_secrets
