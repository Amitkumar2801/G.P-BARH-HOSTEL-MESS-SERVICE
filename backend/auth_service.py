# backend/auth_service.py
import os
import sys
import time
import secrets
import smtplib
import logging
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

try:
    import jwt
except ImportError:
    from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

# Ensure backend directory is in sys.path and load environment variables from .env
_backend_dir = Path(__file__).resolve().parent
_root_dir = _backend_dir.parent
if _backend_dir.joinpath(".env").exists():
    load_dotenv(_backend_dir.joinpath(".env"))
elif _root_dir.joinpath(".env").exists():
    load_dotenv(_root_dir.joinpath(".env"))
else:
    load_dotenv()

logger = logging.getLogger("auth_service")

SECRET_KEY = os.getenv("SECRET_KEY", "gp_barh_hostel_super_secure_jwt_production_secret_key_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 Hours default

def get_smtp_config():
    """Dynamically resolve SMTP credentials from environment with full alias fallback."""
    smtp_server = os.getenv("SMTP_HOST") or os.getenv("EMAIL_HOST") or os.getenv("SMTP_SERVER") or os.getenv("MAIL_SERVER") or "smtp.gmail.com"
    smtp_port = int(os.getenv("SMTP_PORT") or os.getenv("EMAIL_PORT") or os.getenv("MAIL_PORT") or "587")
    smtp_user = (
        os.getenv("SMTP_USER") or 
        os.getenv("EMAIL_HOST_USER") or 
        os.getenv("SMTP_EMAIL") or 
        os.getenv("MAIL_USERNAME") or 
        "gpbarhhostel@gmail.com"
    ).strip()
    smtp_pass = (
        os.getenv("SMTP_PASSWORD") or 
        os.getenv("EMAIL_HOST_PASSWORD") or 
        os.getenv("GMAIL_APP_PASSWORD") or 
        os.getenv("SMTP_APP_PASSWORD") or 
        os.getenv("MAIL_PASSWORD") or 
        ""
    ).replace(" ", "").strip()
    return smtp_server, smtp_port, smtp_user, smtp_pass

import bcrypt
import re

# --------------------------------------------------------------------------
# PASSLIB-COMPATIBLE BCRYPT CRYPTCONTEXT (UNIFIED VIA APP.CORE.SECURITY)
# --------------------------------------------------------------------------
from app.core.security import (
    CryptContext,
    pwd_context,
    get_password_hash,
    verify_password,
    PASSWORD_REGEX,
    validate_password_complexity,
)

# JWT Token Generator & Verifier
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate signed JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

# --------------------------------------------------------------------------
# IN-MEMORY TTL OTP STORE WITH RATE LIMITING & SECURITY LOCKOUT
# --------------------------------------------------------------------------
_otp_store: Dict[str, Dict[str, Any]] = {}
_otp_rate_limits: Dict[str, float] = {}
_otp_failures: Dict[str, Dict[str, Any]] = {}

def clean_expired_otps():
    """Remove expired OTPs from in-memory cache."""
    now = time.time()
    expired_keys = [k for k, v in _otp_store.items() if v.get("expires_at", 0) < now]
    for k in expired_keys:
        _otp_store.pop(k, None)

def generate_numeric_otp(length: int = 6) -> str:
    """Generate a secure numeric 6-digit OTP code."""
    min_val = 10 ** (length - 1)
    max_val = (10 ** length) - 1
    return str(secrets.randbelow(max_val - min_val + 1) + min_val)

def check_otp_dispatch_rate_limit(email: str, cooldown_seconds: int = 60) -> tuple[bool, int]:
    """
    Enforces a 60-second cooldown between OTP requests for the same email/identifier.
    Returns (is_allowed, seconds_remaining).
    """
    key = email.strip().lower()
    now = time.time()
    last_sent = _otp_rate_limits.get(key, 0)
    elapsed = now - last_sent
    if elapsed < cooldown_seconds:
        return False, int(cooldown_seconds - elapsed)
    return True, 0

def record_otp_dispatch(email: str):
    """Record dispatch timestamp for rate limiting."""
    key = email.strip().lower()
    _otp_rate_limits[key] = time.time()

def check_otp_attempt_lockout(email: str) -> tuple[bool, int]:
    """
    Checks if email/identifier is locked out due to >= 3 consecutive failed verification attempts.
    Returns (is_locked, minutes_remaining).
    """
    key = email.strip().lower()
    now = time.time()
    fail_data = _otp_failures.get(key)
    if fail_data and fail_data.get("locked_until", 0) > now:
        mins = int((fail_data["locked_until"] - now) / 60) + 1
        return True, mins
    return False, 0

def record_otp_failure(email: str) -> int:
    """Record a failed OTP attempt and apply a 15-minute lockout if threshold >= 3 is reached."""
    key = email.strip().lower()
    now = time.time()
    if key not in _otp_failures:
        _otp_failures[key] = {"count": 0, "locked_until": 0}
    _otp_failures[key]["count"] += 1
    if _otp_failures[key]["count"] >= 3:
        _otp_failures[key]["locked_until"] = now + (15 * 60) # 15 minutes lockout
    return _otp_failures[key]["count"]

def clear_otp_failures(email: str):
    """Reset failed attempts upon successful verification."""
    key = email.strip().lower()
    _otp_failures.pop(key, None)

def store_otp(email: str, otp: str, purpose: str = "SIGNUP", ttl_seconds: int = 300):
    """Store OTP in in-memory cache with expiration timestamp (5 minutes)."""
    clean_expired_otps()
    key = email.strip().lower()
    _otp_store[key] = {
        "otp": str(otp).strip(),
        "purpose": purpose.strip().upper(),
        "expires_at": time.time() + ttl_seconds,
        "verified": False
    }

def verify_otp_code(email: str, otp: str, purpose: str = "SIGNUP", consume: bool = True) -> bool:
    """Validate 6-digit numeric OTP code."""
    clean_expired_otps()
    key = email.strip().lower()
    record = _otp_store.get(key)
    if not record:
        record_otp_failure(key)
        return False
    if record.get("expires_at", 0) < time.time():
        _otp_store.pop(key, None)
        record_otp_failure(key)
        return False
    if record.get("purpose") != purpose.strip().upper():
        record_otp_failure(key)
        return False
    if str(record.get("otp")).strip() != str(otp).strip():
        record_otp_failure(key)
        return False

    clear_otp_failures(key)
    if consume:
        _otp_store.pop(key, None)
    else:
        record["verified"] = True
    return True

def is_otp_pre_verified(email: str, purpose: str = "SIGNUP") -> bool:
    """Check if OTP was already validated in a prior step for this session."""
    key = email.strip().lower()
    record = _otp_store.get(key)
    if record and record.get("verified") and record.get("purpose") == purpose.strip().upper():
        if record.get("expires_at", 0) >= time.time():
            return True
    return False

def invalidate_otp(email: str):
    """Irreversibly delete OTP from cache immediately upon action completion."""
    key = email.strip().lower()
    _otp_store.pop(key, None)

def get_stored_otp(email: str, purpose: str = "SIGNUP") -> Optional[str]:
    """Retrieve currently active OTP for verification or testing."""
    clean_expired_otps()
    key = email.strip().lower()
    record = _otp_store.get(key)
    if record and record.get("expires_at", 0) >= time.time():
        if record.get("purpose") == purpose.strip().upper():
            return record.get("otp")
    return None

# --------------------------------------------------------------------------
# FREE GMAIL SMTP EMAIL DISPATCHER (smtplib & email.mime - Zero Attachments)
# --------------------------------------------------------------------------
def send_email_otp(to_email: str, otp: str, purpose: str = "SIGNUP") -> Dict[str, Any]:
    """
    Sends 6-digit OTP using Python's built-in smtplib to Gmail SMTP.
    Strictly lightweight MIME alternative (Plain Text + HTML) with zero file
    attachments to pass Gmail DKIM authentication and deliver directly to Inbox.
    """
    clean_purpose = purpose.strip().upper()
    is_reset = clean_purpose in ("FORGOT_PASSWORD", "RESET_PASSWORD")

    if is_reset:
        subject = f"[Password Reset OTP] Govt. Polytechnic Barh: {otp}"
        header_sub = "HOSTEL &amp; MESS MANAGEMENT SYSTEM • PASSWORD RECOVERY"
        badge_text = "🔑 PASSWORD RESET OTP • पासवर्ड रीसेट"
        badge_bg = "#fef3c7"
        badge_border = "#fcd34d"
        badge_color = "#92400e"
        text_purpose = "PURPOSE: PASSWORD RESET OTP (पासवर्ड रीसेट कोड)"
        text_instruction = "We received a request to reset the password for your Govt. Polytechnic Barh Hostel & Mess Portal account. Use the 6-digit OTP below to set your new password:"
        security_note = "This Password Reset OTP is strictly confidential. Govt. Polytechnic Barh authorities will never ask for your code."
        warning_note = "If you did NOT request a password reset, please ignore this email or notify the warden office immediately. Valid for strictly 5 minutes."
    else:
        subject = f"[Create Account OTP] Govt. Polytechnic Barh: {otp}"
        header_sub = "HOSTEL &amp; MESS MANAGEMENT SYSTEM • REGISTRATION VERIFICATION"
        badge_text = "📝 CREATE ACCOUNT OTP • नया खाता पंजीकरण"
        badge_bg = "#eff6ff"
        badge_border = "#bfdbfe"
        badge_color = "#1e40af"
        text_purpose = "PURPOSE: CREATE ACCOUNT OTP (नया खाता पंजीकरण कोड)"
        text_instruction = "Thank you for registering on the Govt. Polytechnic Barh Hostel & Mess Portal. Use the 6-digit OTP below to verify your email and complete your new account creation:"
        security_note = "This Account Creation OTP is strictly confidential. Govt. Polytechnic Barh authorities will never ask for your code."
        warning_note = "This OTP confirms your official account creation. Valid for strictly 5 minutes. Do not forward or share this code with anyone."

    html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f1f5f9" style="background-color: #f1f5f9; padding: 32px 12px; margin: 0; width: 100%;">
    <tr>
      <td align="center" valign="top">
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
          <tr>
            <td align="center" bgcolor="#800000" style="background: #800000; border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; font-family: sans-serif;">Government Polytechnic, Barh</h1>
              <p style="color: #fde047; font-size: 12px; font-weight: 700; margin: 6px 0 0 0; letter-spacing: 0.8px;">{header_sub}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 28px 24px 28px; text-align: left; background-color: #ffffff;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 16px auto;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: {badge_bg}; border: 1px solid {badge_border}; border-radius: 20px; padding: 7px 20px; font-size: 13px; font-weight: 800; color: {badge_color}; letter-spacing: 0.3px; font-family: sans-serif;">
                      {badge_text}
                    </div>
                  </td>
                </tr>
              </table>
              <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">{text_instruction}</p>
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <div style="background-color: #f8fafc; border: 2px dashed #94a3b8; border-radius: 12px; padding: 18px 24px; display: inline-block;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #800000;">{otp}</span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 16px 0 0 0; text-align: center;">
                ⏳ <strong>Validity:</strong> 5 minutes • Single use only<br/>
                🔒 {security_note}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" bgcolor="#f8fafc" style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0; font-family: sans-serif;">
                Govt. Polytechnic Barh Campus, NH-31, Barh, Patna - 803213<br/>
                Official Institutional Portal • Bihar State
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    text_content = f"""Government Polytechnic, Barh
{header_sub.replace('&amp;', '&')}
======================================================
{text_purpose}

OFFICIAL 6-DIGIT OTP: {otp}

{text_instruction}

🔒 Security PIN • Single-use only
{security_note}
{warning_note}

------------------------------------------------------
Chief Warden Office • Central Hostel & Dining Administration
Govt. Polytechnic Barh Campus, NH-31, Barh, Patna - 803213
For issues regarding seat allotment, contact: gpbarhhostel@gmail.com
======================================================
"""

    # Always log for local development and auditing
    logger.info(f"[OTP DISPATCH] >>> Target: {to_email} | Purpose: {clean_purpose} | OTP: {otp} <<<")
    print(f"\n[OTP DISPATCH] >>> Target: {to_email} | Purpose: {clean_purpose} | OTP: {otp} <<<\n", flush=True)

    smtp_server, smtp_port, smtp_user, clean_smtp_pass = get_smtp_config()

    if not clean_smtp_pass:
        err_msg = "SMTP_PASSWORD is missing in server environment. Please set Gmail App Password in .env."
        logger.error(f"[SMTP Error] {err_msg}")
        raise RuntimeError(err_msg)

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Govt. Polytechnic Barh <{smtp_user}>"
        msg["To"] = to_email
        msg["Reply-To"] = smtp_user

        msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=25) as server:
                server.login(smtp_user, clean_smtp_pass)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_server, smtp_port, timeout=25) as server:
                server.starttls()
                server.login(smtp_user, clean_smtp_pass)
                server.send_message(msg)

        logger.info(f"OTP successfully dispatched via Gmail SMTP to {to_email}")
        return {
            "success": True,
            "message": f"Institutional verification email dispatched successfully to {to_email} via Gmail SMTP."
        }
    except Exception as e:
        logger.error(f"Gmail SMTP Dispatch Error to {to_email}: {str(e)}")
        raise RuntimeError(f"Gmail SMTP transmission error: {str(e)}")
