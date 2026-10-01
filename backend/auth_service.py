# backend/auth_service.py
import os
import time
import secrets
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import base64
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

import jwt
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
# PASSLIB-COMPATIBLE BCRYPT CRYPTCONTEXT WRAPPER
# --------------------------------------------------------------------------
class PwdContextWrapper:
    """
    Enterprise-grade password hashing and verification interface
    compatible with passlib.context.CryptContext (pwd_context.verify, pwd_context.hash).
    Uses direct bcrypt binding to bypass Python 3.14 / bcrypt 4.x __about__ deprecation.
    """
    def hash(self, secret: str) -> str:
        cleaned = (secret or "").strip()
        pwd_bytes = cleaned.encode("utf-8")[:72]
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

    def verify(self, secret: str, hashed_or_plain: str) -> bool:
        if not secret or not hashed_or_plain:
            return False
        cleaned = secret.strip()
        try:
            if hashed_or_plain.startswith("$2a$") or hashed_or_plain.startswith("$2b$") or hashed_or_plain.startswith("$2y$"):
                pwd_bytes = cleaned.encode("utf-8")[:72]
                hash_bytes = hashed_or_plain.encode("utf-8")
                return bcrypt.checkpw(pwd_bytes, hash_bytes)
        except Exception:
            pass
        # Backward compatibility for legacy test records stored unhashed
        return cleaned == hashed_or_plain

pwd_context = PwdContextWrapper()

def get_password_hash(password: str) -> str:
    """Hash plain password using bcrypt with standard salt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_or_plain: str) -> bool:
    """Verify plain password against hashed string, with legacy plain-text fallback."""
    return pwd_context.verify(plain_password, hashed_or_plain)

# Strict institutional password regex: minimum 8 characters, at least 1 number, 1 special character
PASSWORD_REGEX = re.compile(r'^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>_~`+\-=\[\]\\;/]).{8,}$')

def validate_password_complexity(password: str) -> tuple[bool, Optional[str]]:
    """
    Enforces strict enterprise password requirements:
    - Stripped whitespace
    - Minimum 8 characters
    - At least 1 number (0-9)
    - At least 1 special character (!@#$%^&* etc.)
    """
    cleaned = (password or "").strip()
    if len(cleaned) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r'[0-9]', cleaned):
        return False, "Password must include at least one numeric digit (0-9)."
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_~`+\-=\[\]\\;/]', cleaned):
        return False, "Password must include at least one special character (!@#$%^&* etc.)."
    return True, None

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
# FREE GMAIL SMTP EMAIL DISPATCHER (smtplib & email.mime)
# --------------------------------------------------------------------------
def get_logo_bytes() -> Optional[bytes]:
    """Retrieve official Govt. Polytechnic Barh institutional seal logo bytes."""
    search_dirs = [
        os.path.join(os.path.dirname(__file__), "logo.png"),
        os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "assets", "logo.png"),
        os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "assets", "logo.png.png"),
        os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "logo.png"),
    ]
    for p in search_dirs:
        norm_p = os.path.abspath(p)
        if os.path.exists(norm_p):
            try:
                with open(norm_p, "rb") as f:
                    return f.read()
            except Exception:
                continue
    return None

def send_email_otp(to_email: str, otp: str, purpose: str = "SIGNUP") -> Dict[str, Any]:
    """
    Sends 6-digit OTP using Python's built-in smtplib to Gmail SMTP
    formatted in a premium, government-grade institutional HTML template
    with prominent Govt. Polytechnic, Barh college logo and aesthetic.
    """
    clean_purpose = purpose.strip().upper()
    purpose_label = "Student Registration & Account Creation" if clean_purpose == "SIGNUP" else "Account Password Recovery"
    subject = f"Govt. Polytechnic Barh - Portal Verification Code: {otp}"

    # Permanent static public URL for Google / Gmail proxy rendering + optimized Base64 fallback
    static_public_logo = os.getenv("COLLEGE_LOGO_URL", "https://files.catbox.moe/8czd78.png")
    logo_bytes = get_logo_bytes()
    logo_base64 = ""
    if logo_bytes:
        try:
            from PIL import Image
            import io
            im = Image.open(io.BytesIO(logo_bytes))
            im.thumbnail((160, 160), Image.Resampling.LANCZOS)
            buf = io.BytesIO()
            im.save(buf, format="PNG", optimize=True)
            logo_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
        except Exception:
            logo_base64 = base64.b64encode(logo_bytes).decode("utf-8")

    # Priority: static public URL (optimal for Gmail desktop/mobile) -> inline base64 -> cid
    use_inline_base64 = os.getenv("USE_INLINE_BASE64_LOGO", "false").lower() == "true"
    if use_inline_base64 and logo_base64:
        logo_src = f"data:image/png;base64,{logo_base64}"
    elif static_public_logo:
        logo_src = static_public_logo
    elif logo_base64:
        logo_src = f"data:image/png;base64,{logo_base64}"
    else:
        logo_src = "cid:institution_logo"

    html_content = f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f1f5f9" style="background-color: #f1f5f9; padding: 24px 12px; margin: 0; width: 100%;">
    <tr>
      <td align="center" valign="top">
        <!-- MAIN CONTAINER (Max 580px) -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px rgba(0,0,0,0.06);">
          
          <!-- 1. HEADER BANNER (Official Deep Maroon #800000 with College Logo) -->
          <tr>
            <td align="center" bgcolor="#800000" style="background-color: #800000; padding: 28px 20px; text-align: center; border-bottom: 3px solid #facc15;">
              {'<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 8px auto;"><tr><td align="center"><img src="' + logo_src + '" alt="Govt. Polytechnic, Barh Logo" width="72" height="72" style="width: 72px; height: 72px; border-radius: 50%; border: 2px solid #ffffff; background: #ffffff; padding: 2px; margin-bottom: 8px; display: block; margin-left: auto; margin-right: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.25);" /></td></tr></table>' if logo_src else ''}
              
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.3;">
                राजकीय पॉलिटेक्निक, बाढ़
              </h1>
              <div style="font-size: 13px; font-weight: 600; color: #fde047; text-transform: uppercase; margin-top: 3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; letter-spacing: 0.8px;">
                Govt. Polytechnic, Barh • Patna, Bihar
              </div>
              <div style="font-size: 11px; color: #e2e8f0; margin-top: 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Department of Science, Technology &amp; Technical Education
              </div>
            </td>
          </tr>

          <!-- 2. REFINED BODY UI/UX -->
          <tr>
            <td style="padding: 28px 24px 20px 24px; text-align: left; background-color: #ffffff;">
              
              <!-- Clean Security Verification Badge -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 18px auto;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 20px; padding: 5px 16px; font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      🛡️ Official Security Verification
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Student Salutation -->
              <p style="color: #0f172a; font-size: 15px; font-weight: 700; margin: 0 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Dear Student / Applicant,
              </p>
              <p style="color: #475569; font-size: 13.5px; margin: 0 0 20px 0; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Use the single-use 6-digit authentication PIN below to complete your <strong>{purpose_label}</strong> on the official Govt. Polytechnic Barh portal:
              </p>

              <!-- MAIN 6-DIGIT OTP CONTAINER -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 18px auto; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                <tr>
                  <td align="center" style="padding: 16px 34px;">
                    <span style="color: #800000; font-size: 34px; font-weight: 800; letter-spacing: 10px; font-family: monospace; display: inline-block;">
                      {otp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- NEAT SECURITY CALLOUT BOX -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 14px 18px; text-align: center;">
                    <div style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; padding: 4px 12px; border-radius: 6px; margin-bottom: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      🔒 Security PIN • Single-use only
                    </div>
                    <div style="color: #991b1b; font-size: 12.5px; font-weight: 600; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      This OTP expires in strictly 5 minutes. Do not forward or share this code with anyone.
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- 3. INSTITUTIONAL OFFICIAL FOOTER -->
          <tr>
            <td align="center" bgcolor="#f8fafc" style="background-color: #f8fafc; border-top: 2px solid #e2e8f0; padding: 22px 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
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

    text_content = f"""राजकीय पॉलिटेक्निक, बाढ़ (GOVT. POLYTECHNIC, BARH)
Govt. Polytechnic, Barh • Patna, Bihar
Department of Science, Technology & Technical Education
======================================================
PURPOSE: {purpose_label}

OFFICIAL 6-DIGIT OTP: {otp}
🔒 Security PIN • Single-use only
This OTP expires in strictly 5 minutes. Do not forward or share this code with anyone.

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
            if logo_bytes:
                root_msg = MIMEMultipart("related")
                root_msg["Subject"] = subject
                root_msg["From"] = f"Govt. Polytechnic Barh <{SMTP_EMAIL}>"
                root_msg["To"] = to_email

                alt_part = MIMEMultipart("alternative")
                alt_part.attach(MIMEText(text_content, "plain", "utf-8"))
                alt_part.attach(MIMEText(html_content, "html", "utf-8"))
                root_msg.attach(alt_part)

                img_part = MIMEImage(logo_bytes, _subtype="png")
                img_part.add_header("Content-ID", "<institution_logo>")
                img_part.add_header("Content-Disposition", "inline", filename="logo.png")
                root_msg.attach(img_part)

                outgoing_msg = root_msg
            else:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"Govt. Polytechnic Barh <{SMTP_EMAIL}>"
                msg["To"] = to_email
                msg.attach(MIMEText(text_content, "plain", "utf-8"))
                msg.attach(MIMEText(html_content, "html", "utf-8"))
                outgoing_msg = msg

            if SMTP_PORT == 465:
                with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, timeout=30) as server:
                    server.login(SMTP_EMAIL, clean_smtp_pass)
                    server.send_message(outgoing_msg)
            else:
                with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30) as server:
                    server.starttls()
                    server.login(SMTP_EMAIL, clean_smtp_pass)
                    server.send_message(outgoing_msg)

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
