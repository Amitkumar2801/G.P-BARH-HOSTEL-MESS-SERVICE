# backend/auth_service.py
import os
import time
import secrets
import smtplib
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

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "gp_barh_hostel_super_secure_jwt_production_secret_key_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 Hours default

SMTP_SERVER = os.getenv("SMTP_HOST") or os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_USER") or os.getenv("SMTP_EMAIL", "gpbarhhostel@gmail.com")
# Free 16-character App Password from Google Account Security
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD") or os.getenv("SMTP_APP_PASSWORD", "")

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
# Structure: { email_lower: { "otp": str, "purpose": str, "expires_at": float, "verified": bool } }
_otp_store: Dict[str, Dict[str, Any]] = {}

# Anti-Spam Rate Limiting: 60-second cooldown per target email/identifier
_otp_rate_limits: Dict[str, float] = {}

# Consecutive Failed Attempts Lockout: 3 failed attempts -> 15-minute lock
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
    """
    Records a failed OTP attempt. Locks the identifier for 15 minutes (900s)
    after 3 consecutive failed attempts. Returns remaining attempts before lockout.
    """
    key = email.strip().lower()
    now = time.time()
    fail_data = _otp_failures.get(key, {"count": 0, "locked_until": 0})
    if fail_data.get("locked_until", 0) <= now:
        # Reset if prior lock has elapsed
        if fail_data.get("locked_until", 0) > 0:
            fail_data["count"] = 0
            fail_data["locked_until"] = 0

    fail_data["count"] += 1
    if fail_data["count"] >= 3:
        fail_data["locked_until"] = now + 900 # 15 minutes lockout
        _otp_failures[key] = fail_data
        return 0

    _otp_failures[key] = fail_data
    return 3 - fail_data["count"]

def clear_otp_failures(email: str):
    """Clears failed attempts counter upon successful verification."""
    key = email.strip().lower()
    _otp_failures.pop(key, None)

def store_otp(email: str, otp: str, purpose: str = "SIGNUP", ttl_seconds: int = 300):
    """Store 6-digit OTP with 5-minute (300s) expiry window."""
    clean_expired_otps()
    key = email.strip().lower()
    _otp_store[key] = {
        "otp": str(otp).strip(),
        "purpose": purpose.strip().upper(),
        "expires_at": time.time() + ttl_seconds,
        "verified": False,
        "created_at": time.time()
    }

def verify_otp_code(email: str, otp: str, purpose: str = "SIGNUP", consume: bool = True) -> bool:
    """
    Validate 6-digit OTP against in-memory TTL store.
    Tracks failed attempts and locks identifier for 15 minutes after 3 failures.
    If consume=True, deletes OTP immediately from cache for single-use security.
    """
    clean_expired_otps()
    key = email.strip().lower()

    # Check if locked out
    is_locked, _ = check_otp_attempt_lockout(key)
    if is_locked:
        return False

    record = _otp_store.get(key)
    if not record:
        record_otp_failure(key)
        return False

    if record.get("expires_at", 0) < time.time():
        _otp_store.pop(key, None)
        record_otp_failure(key)
        return False

    if record.get("purpose", "") != purpose.strip().upper():
        record_otp_failure(key)
        return False

    if record.get("otp", "") != str(otp).strip():
        record_otp_failure(key)
        return False

    # Successful match: clear failure counts
    clear_otp_failures(key)

    if consume:
        # Immediate single-use invalidation
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
    attachments to pass Gmail DKIM authentication and avoid spam blocking.
    Official college avatar icon is provided natively by the sender Google Account.
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
        action_title = "Password Reset Request (पासवर्ड रीसेट अनुरोध)"
        salutation = "Dear Student / User,"
        purpose_explanation = "We received a request to <strong>reset the password</strong> for your Govt. Polytechnic Barh Hostel &amp; Mess Portal account. Use the single-use 6-digit OTP below to proceed with setting a new password:"
        security_note = "This Password Reset OTP is strictly confidential. Govt. Polytechnic Barh authorities will never ask for your code."
        warning_note = "If you did NOT request a password reset, please ignore this email or notify the warden office immediately. Valid for strictly 5 minutes."
        text_purpose = "PURPOSE: PASSWORD RESET OTP (पासवर्ड रीसेट कोड)"
        text_instruction = "We received a request to reset the password for your Govt. Polytechnic Barh Hostel & Mess Portal account. Use the 6-digit OTP below to set your new password:"
    else:
        subject = f"[Create Account OTP] Govt. Polytechnic Barh: {otp}"
        header_sub = "HOSTEL &amp; MESS MANAGEMENT SYSTEM • REGISTRATION VERIFICATION"
        badge_text = "📝 CREATE ACCOUNT OTP • नया खाता पंजीकरण"
        badge_bg = "#eff6ff"
        badge_border = "#bfdbfe"
        badge_color = "#1e40af"
        action_title = "Official Account Registration (नया खाता पंजीकरण)"
        salutation = "Dear Applicant / Administrator,"
        purpose_explanation = "Thank you for registering on the Govt. Polytechnic Barh Hostel &amp; Mess Portal! Use the single-use 6-digit OTP below to verify your email address and <strong>complete your official account creation</strong>:"
        security_note = "This Account Creation OTP is strictly confidential. Govt. Polytechnic Barh authorities will never ask for your code."
        warning_note = "This OTP confirms your official account creation. Valid for strictly 5 minutes. Do not forward or share this code with anyone."
        text_purpose = "PURPOSE: CREATE ACCOUNT OTP (नया खाता पंजीकरण कोड)"
        text_instruction = "Thank you for registering on the Govt. Polytechnic Barh Hostel & Mess Portal. Use the 6-digit OTP below to verify your email and complete your new account creation:"

    html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f1f5f9" style="background-color: #f1f5f9; padding: 32px 12px; margin: 0; width: 100%;">
    <tr>
      <td align="center" valign="top">
        <!-- MAIN CONTAINER (Max 580px) -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
          
          <!-- 1. CLEAN INSTITUTIONAL HEADER (Zero Attachments, Pure HTML/CSS) -->
          <tr>
            <td align="center" bgcolor="#800000" style="background: #800000; border-radius: 12px 12px 0 0; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; font-family: sans-serif;">Government Polytechnic, Barh</h1>
              <p style="color: #fde047; font-size: 12px; font-weight: 700; margin: 6px 0 0 0; letter-spacing: 0.8px;">{header_sub}</p>
            </td>
          </tr>

          <!-- 2. REFINED BODY UI/UX -->
          <tr>
            <td style="padding: 30px 28px 24px 28px; text-align: left; background-color: #ffffff;">
              
              <!-- Distinct Purpose Badge (Create Account vs Reset Password) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 16px auto;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: {badge_bg}; border: 1px solid {badge_border}; border-radius: 20px; padding: 7px 20px; font-size: 13px; font-weight: 800; color: {badge_color}; letter-spacing: 0.3px; font-family: sans-serif;">
                      {badge_text}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action Title & Greeting -->
              <h2 style="color: #0f172a; font-size: 16.5px; font-weight: 800; margin: 0 0 8px 0; text-align: center; font-family: sans-serif;">
                {action_title}
              </h2>
              <p style="color: #0f172a; font-size: 14.5px; font-weight: 700; margin: 16px 0 6px 0; font-family: sans-serif;">
                {salutation}
              </p>
              <p style="color: #475569; font-size: 13.5px; margin: 0 0 22px 0; line-height: 1.6; font-family: sans-serif;">
                {purpose_explanation}
              </p>

              <!-- CRISP 6-DIGIT OTP CONTAINER -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 20px auto; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                <tr>
                  <td align="center" style="padding: 16px 36px;">
                    <span style="color: #800000; font-size: 34px; font-weight: 800; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; display: inline-block;">
                      {otp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- NEAT SECURITY CALLOUT BOX -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 14px 18px; text-align: center;">
                    <div style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 12px; border-radius: 6px; margin-bottom: 6px; font-family: sans-serif;">
                      🔒 Security PIN • Single-use only
                    </div>
                    <div style="color: #991b1b; font-size: 12.5px; font-weight: 600; line-height: 1.5; font-family: sans-serif;">
                      {security_note}
                    </div>
                    <div style="color: #b91c1c; font-size: 11.5px; margin-top: 4px; font-family: sans-serif;">
                      {warning_note}
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- 3. INSTITUTIONAL OFFICIAL FOOTER -->
          <tr>
            <td align="center" bgcolor="#f8fafc" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 22px 20px; text-align: center; font-family: sans-serif;">
              <div style="font-size: 12px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                Chief Warden Office • Central Hostel &amp; Dining Administration
              </div>
              <div style="font-size: 11.5px; color: #475569; margin-bottom: 6px;">
                Govt. Polytechnic Barh Campus, NH-31, Barh, Patna - 803213
              </div>
              <div style="font-size: 11px; color: #64748b; padding-top: 6px; border-top: 1px dashed #cbd5e1; margin-top: 6px;">
                For issues regarding seat allotment, contact: <a href="mailto:gpbarhhostel@gmail.com" style="color: #800000; font-weight: 700; text-decoration: underline;">gpbarhhostel@gmail.com</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

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
    print(f"\n[OTP DISPATCH] >>> Target: {to_email} | Purpose: {clean_purpose} | OTP: {otp} <<<\n", flush=True)

    # Attempt SMTP transmission if password/credentials are configured
    clean_smtp_pass = (SMTP_PASSWORD or "").replace(" ", "").strip()
    if clean_smtp_pass:
        try:
            # Strictly lightweight MIME alternative (Plain Text + HTML) - Zero file attachments
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Govt. Polytechnic Barh <{SMTP_EMAIL}>"
            msg["To"] = to_email
            msg["Reply-To"] = SMTP_EMAIL

            # Attach plain text version first, then HTML version (standard RFC 2046)
            msg.attach(MIMEText(text_content, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            if SMTP_PORT == 465:
                with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=30) as server:
                    server.login(SMTP_EMAIL, clean_smtp_pass)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30) as server:
                    server.starttls()
                    server.login(SMTP_EMAIL, clean_smtp_pass)
                    server.send_message(msg)

            return {
                "success": True,
                "message": f"Institutional verification email dispatched successfully to {to_email} via Gmail SMTP."
            }
        except Exception as e:
            print(f"[SMTP Warning] Could not dispatch real email via Gmail SMTP: {e}", flush=True)
            return {
                "success": True,
                "message": f"OTP generated and logged to console for {to_email} (SMTP note: {str(e)})."
            }

    return {
        "success": True,
        "message": f"OTP generated successfully for {to_email}. (Logged to server console in dev mode)."
    }
