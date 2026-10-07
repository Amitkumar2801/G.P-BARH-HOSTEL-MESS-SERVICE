import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load env variables from backend .env
load_dotenv()

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST") or os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_HOST = SMTP_HOST.strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER") or os.getenv("EMAIL_HOST_USER") or os.getenv("GMAIL_USER") or "gpbarhhostel@gmail.com"
SMTP_USER = SMTP_USER.strip()
# Remove any accidental whitespace inside the 16-character Google App Password
raw_password = os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_HOST_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD") or "utqbtzbwvpkcbtjp"
SMTP_PASSWORD = raw_password.replace(" ", "").strip()

def send_real_email_otp(to_email: str, otp_code: str, purpose: str = "Verification") -> bool:
    """
    Sends a real 6-digit OTP via Gmail SMTP.
    Raises explicit exceptions on authentication or network failures.
    """
    to_email = to_email.strip().lower()
    logger.info(f"Initiating Gmail SMTP dispatch to: {to_email} via {SMTP_HOST}:{SMTP_PORT} using sender: {SMTP_USER}")

    subject = f"GP Barh Hostel & Mess Portal - Your {purpose} OTP: {otp_code}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #800000; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #800000; margin: 0;">राजकीय पॉलिटेक्निक, बाढ़</h2>
            <p style="color: #4a5568; margin: 4px 0 0 0; font-size: 14px;">Government Polytechnic, Barh - Hostel & Mess System</p>
        </div>
        <p style="color: #2d3748; font-size: 15px;">Hello,</p>
        <p style="color: #2d3748; font-size: 15px;">Your verification code for <strong>{purpose}</strong> is:</p>
        <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #800000; background: #fff5f5; padding: 12px 28px; border-radius: 8px; border: 2px dashed #800000;">
                {otp_code}
            </span>
        </div>
        <p style="color: #718096; font-size: 13px;">This code is valid for 10 minutes. If you did not request this OTP, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
        <p style="color: #a0aec0; font-size: 11px; text-align: center;">Official Digital Portal &copy; 2026 Government Polytechnic Barh, Patna, Bihar.</p>
    </div>
    """

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"GP Barh Hostel Portal <{SMTP_USER}>"
    message["To"] = to_email
    message.attach(MIMEText(html_content, "html"))

    try:
        # Port 587 uses STARTTLS; Port 465 uses SSL
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=25) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, [to_email], message.as_string())
        else:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=25) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, [to_email], message.as_string())

        logger.info(f"SUCCESS: Real OTP {otp_code} delivered via Gmail SMTP to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError as auth_err:
        logger.error(f"CRITICAL SMTP AUTH FAILURE: Gmail credentials rejected: {auth_err}")
        raise RuntimeError(f"Gmail SMTP Auth Failed. Check App Password ({SMTP_USER}): {auth_err}")
    except Exception as exc:
        logger.error(f"CRITICAL SMTP SEND FAILURE to {to_email}: {exc}")
        raise RuntimeError(f"SMTP Dispatch Error: {str(exc)}")


def send_email_otp(to_email: str, otp_code: str, purpose: str = "Verification") -> dict:
    """Wrapper that calls send_real_email_otp and returns status dict."""
    send_real_email_otp(to_email=to_email, otp_code=otp_code, purpose=purpose)
    return {
        "success": True,
        "message": f"OTP sent successfully to {to_email}",
        "recipient": to_email,
        "purpose": purpose
    }
