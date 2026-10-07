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

    # Format official timestamp in Indian Standard Time (IST - UTC+5:30)
    try:
        ist_now = datetime.now(timezone(timedelta(hours=5, minutes=30)))
        issued_at_str = ist_now.strftime("%d %b %Y, %I:%M %p IST")
    except Exception:
        issued_at_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

    # Generate individual digit HTML tiles for clean, modern verification display
    clean_otp = str(otp).strip()
    digit_cells = "".join([
        f'<td width="46" height="56" align="center" valign="middle" style="width: 46px; height: 56px; background-color: #ffffff; border: 2px solid #cbd5e1; border-radius: 10px; font-family: \'Courier New\', Courier, monospace; font-size: 30px; font-weight: 900; color: #800000; text-align: center; line-height: 56px; box-shadow: 0 2px 5px rgba(0,0,0,0.06);">{d}</td>'
        for d in clean_otp
    ])

    if is_reset:
        subject = f"[Password Reset OTP] Govt. Polytechnic Barh: {otp}"
        header_sub = "HOSTEL &amp; MESS MANAGEMENT SYSTEM • PASSWORD RECOVERY"
        badge_text = "🔑 PASSWORD RESET VERIFICATION • पासवर्ड रीसेट सत्यापन"
        badge_bg = "#fef3c7"
        badge_border = "#f59e0b"
        badge_color = "#92400e"
        text_purpose = "PURPOSE: PASSWORD RESET OTP (पासवर्ड रीसेट कोड)"
        text_instruction = "A request was submitted to reset your account password for the Govt. Polytechnic Barh Hostel & Mess Portal. Use the official 6-digit verification code below to authenticate your request and set your new password:"
        security_note = "This Password Reset OTP is strictly confidential. Govt. Polytechnic Barh authorities will never ask for your code."
        warning_note = "If you did NOT request a password reset, your account credentials may be exposed. Please notify the warden office or hostel administration immediately."
    else:
        subject = f"[Create Account OTP] Govt. Polytechnic Barh: {otp}"
        header_sub = "HOSTEL &amp; MESS MANAGEMENT SYSTEM • REGISTRATION VERIFICATION"
        badge_text = "🎓 NEW STUDENT ONBOARDING • नया खाता पंजीकरण सत्यापन"
        badge_bg = "#eff6ff"
        badge_border = "#3b82f6"
        badge_color = "#1e40af"
        text_purpose = "PURPOSE: CREATE ACCOUNT OTP (नया खाता पंजीकरण कोड)"
        text_instruction = "Thank you for registering on the Govt. Polytechnic Barh Official Hostel & Mess Management Portal. Use the 6-digit verification code below to confirm your registered email address and activate your student portal profile:"
        security_note = "This Account Creation OTP is strictly confidential. Govt. Polytechnic Barh authorities will never ask for your code."
        warning_note = "This OTP confirms your official account identity. Valid for strictly 10 minutes. Do not forward or share this code with anyone."

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
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 12px 30px rgba(0,0,0,0.08);">
          <!-- Top Gold Institutional Accent Bar -->
          <tr>
            <td bgcolor="#eab308" style="background-color: #eab308; height: 4px; line-height: 4px; font-size: 4px; padding: 0;">&nbsp;</td>
          </tr>
          <!-- Official Institutional Header -->
          <tr>
            <td align="center" bgcolor="#7a0c0c" style="background: #7a0c0c; padding: 26px 20px 22px 20px; text-align: center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 10px auto;">
                <tr>
                  <td align="center" style="width: 44px; height: 44px; background-color: #ffffff; border-radius: 50%; font-size: 22px; line-height: 44px; text-align: center; box-shadow: 0 3px 8px rgba(0,0,0,0.25);">
                    🏛️
                  </td>
                </tr>
              </table>
              <div style="color: #fef08a; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Government of Bihar • Dept. of Science &amp; Technology
              </div>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; line-height: 1.25; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                राजकीय पॉलिटेक्निक, बाढ़
              </h1>
              <div style="color: #f8fafc; font-size: 14.5px; font-weight: 600; margin-top: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Government Polytechnic, Barh (Patna)
              </div>
              <div style="margin-top: 12px;">
                <span style="display: inline-block; background-color: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 4px 14px; color: #fef08a; font-size: 10.5px; font-weight: 700; letter-spacing: 0.6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  {header_sub}
                </span>
              </div>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 26px 20px 26px; text-align: left; background-color: #ffffff;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 0 16px 0;">
                <tr>
                  <td style="background-color: {badge_bg}; border: 1px solid {badge_border}; border-radius: 6px; padding: 6px 14px;">
                    <span style="font-size: 11.5px; font-weight: 800; color: {badge_color}; letter-spacing: 0.4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      {badge_text}
                    </span>
                  </td>
                </tr>
              </table>
              <p style="color: #0f172a; font-size: 14.5px; font-weight: 700; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Dear Student / Resident,
              </p>
              <p style="color: #334155; font-size: 13.5px; line-height: 1.6; margin: 0 0 18px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                {text_instruction}
              </p>
              <!-- HERO OTP PANEL WITH INDIVIDUAL DIGIT TILES -->
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 14px; margin: 18px 0; text-align: center;">
                <tr>
                  <td align="center">
                    <div style="color: #64748b; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      OFFICIAL 6-DIGIT VERIFICATION CODE
                    </div>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="6" align="center" style="margin: 0 auto;">
                      <tr>
                        {digit_cells}
                      </tr>
                    </table>
                    <div style="margin-top: 14px; font-size: 12px; color: #475569; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      <span style="color: #b91c1c; font-weight: 800;">⏱️ Valid for 10 Minutes</span>
                      &nbsp;•&nbsp; Single-use security code &nbsp;•&nbsp; Strictly confidential
                    </div>
                  </td>
                </tr>
              </table>
              <!-- OFFICIAL DISPATCH CREDENTIALS TABLE -->
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; margin: 18px 0; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow: hidden;">
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td colspan="2" style="padding: 8px 14px; font-weight: 700; color: #334155; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.8px;">
                    📋 Official Verification Details
                  </td>
                </tr>
                <tr>
                  <td style="padding: 9px 14px; color: #64748b; font-weight: 600; width: 36%; border-bottom: 1px solid #f1f5f9;">Registered Recipient:</td>
                  <td style="padding: 9px 14px; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9;">{to_email}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 14px; color: #64748b; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Issuing Authority:</td>
                  <td style="padding: 9px 14px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">Office of the Chief Hostel Warden, GP Barh</td>
                </tr>
                <tr>
                  <td style="padding: 9px 14px; color: #64748b; font-weight: 600;">Time of Generation:</td>
                  <td style="padding: 9px 14px; color: #0f172a; font-weight: 600;">{issued_at_str}</td>
                </tr>
              </table>
              <!-- SECURITY ADVISORY CALLOUT -->
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 12px 14px; margin: 18px 0;">
                <tr>
                  <td>
                    <div style="color: #92400e; font-size: 12px; font-weight: 800; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      🔒 Security Advisory / सुरक्षा दिशा-निर्देश:
                    </div>
                    <div style="color: #78350f; font-size: 11.5px; line-height: 1.55; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      • {security_note}<br/>
                      • Govt. Polytechnic Barh staff, wardens, or mess officials will <strong>never</strong> ask you for your password or OTP.<br/>
                      • {warning_note}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Institutional Official Footer -->
          <tr>
            <td align="center" bgcolor="#0f172a" style="background-color: #0f172a; padding: 22px 24px; text-align: center; border-radius: 0 0 14px 14px;">
              <p style="color: #f8fafc; font-size: 12px; font-weight: 700; margin: 0 0 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.5px;">
                GOVERNMENT POLYTECHNIC, BARH (PATNA)
              </p>
              <p style="color: #cbd5e1; font-size: 11px; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                राजकीय पॉलिटेक्निक, बाढ़ • तकनीकी शिक्षा विभाग, बिहार सरकार
              </p>
              <p style="color: #94a3b8; font-size: 10.5px; line-height: 1.5; margin: 0 0 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Campus: NH-31, Near Railway Station, Barh, Patna - 803213, Bihar<br/>
                Approved by AICTE, New Delhi • Affiliated to SBTE, Bihar<br/>
                Support Helpdesk: <a href="mailto:gpbarhhostel@gmail.com" style="color: #38bdf8; text-decoration: none; font-weight: 600;">gpbarhhostel@gmail.com</a>
              </p>
              <div style="height: 1px; background-color: #334155; margin: 10px auto; max-width: 320px;"></div>
              <p style="color: #64748b; font-size: 10px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.4;">
                This is an official automated institutional notification. Please do not reply directly to this email.<br/>
                © 2026 GP Barh Hostel &amp; Mess Management System. All Rights Reserved.
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

Generated At: {issued_at_str}
Recipient: {to_email}

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
        from email.utils import formatdate
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = smtp_user
        msg["To"] = to_email
        msg["Reply-To"] = smtp_user
        msg["Date"] = formatdate(localtime=True)

        msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        # Fast connection: try 587 first, fallback to 465
        try:
            with smtplib.SMTP(smtp_server, 587, timeout=8) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, clean_smtp_pass)
                server.send_message(msg)
        except Exception as e587:
            logger.warning(f"Port 587 dispatch failed: {e587}. Trying 465...")
            with smtplib.SMTP_SSL(smtp_server, 465, timeout=8) as server:
                server.login(smtp_user, clean_smtp_pass)
                server.send_message(msg)

        logger.info(f"[SMTP Success] Institutional verification email dispatched to {to_email}")
        return {
            "success": True,
            "message": f"OTP successfully dispatched to {to_email}",
            "recipient": to_email,
            "purpose": clean_purpose
        }
    except Exception as e:
        err = f"Failed to send email to {to_email}: {str(e)}"
        logger.error(f"[SMTP Failure] {err}", exc_info=True)
        return {
            "success": False,
            "message": err,
            "recipient": to_email,
            "purpose": clean_purpose
        }


def send_email_otp_real(recipient_email: str, otp_code: str, purpose: str = "Registration"):
    return send_email_otp(to_email=recipient_email, otp=otp_code, purpose=purpose)


def send_real_email_otp(to_email: str, otp_code: str, purpose: str = "Verification") -> bool:
    res = send_email_otp(to_email=to_email, otp=otp_code, purpose=purpose)
    return bool(res.get("success", False))


def send_instant_otp_email(to_email: str, otp_code: str, purpose: str = "Verification") -> bool:
    """
    High-speed instant OTP email dispatcher using official institutional template.
    """
    res = send_email_otp(to_email=to_email, otp=otp_code, purpose=purpose)
    return bool(res.get("success", False))





