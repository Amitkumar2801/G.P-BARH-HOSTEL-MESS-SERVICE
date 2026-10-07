import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = (os.getenv("SMTP_USER") or os.getenv("EMAIL_HOST_USER") or "gpbarhhostel@gmail.com").strip()
SMTP_PASSWORD = (os.getenv("SMTP_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD") or "utqbtzbwvpkcbtjp").replace(" ", "").strip()

def send_instant_otp_email(to_email: str, otp_code: str, purpose: str = "Verification") -> bool:
    target = to_email.strip().lower()
    subject = f"GP Barh Hostel Portal - OTP: {otp_code}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f7fafc; padding: 20px;">
      <div style="max-width: 480px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px;">
        <h2 style="color: #800000; text-align: center; margin: 0 0 10px 0;">राजकीय पॉलिटेक्निक, बाढ़</h2>
        <p style="text-align: center; color: #4a5568; margin: 0 0 18px 0; font-size: 13px;">Hostel & Mess Management System</p>
        <p style="color: #2d3748; font-size: 14px;">Your verification code for <strong>{purpose}</strong> is:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #800000; background: #fff5f5; padding: 10px 24px; border: 2px dashed #800000; border-radius: 8px; display: inline-block;">
            {otp_code}
          </span>
        </div>
        <p style="color: #718096; font-size: 12px; text-align: center;">Valid for 10 minutes. Do not share this OTP.</p>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"GP Barh Hostel <{SMTP_USER}>"
    msg["To"] = target
    msg["Reply-To"] = SMTP_USER
    msg.attach(MIMEText(html, "html"))

    try:
        # Direct SSL on Port 465 (Eliminates STARTTLS hang)
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT if SMTP_PORT == 465 else 465, timeout=12) as server:
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, [target], msg.as_string())
        logger.info(f"[DISPATCHED] Real OTP {otp_code} successfully sent to {target}")
        return True
    except Exception as exc:
        logger.error(f"[FAILED] SMTP Error sending to {target}: {str(exc)}")
        # Fallback to port 587 STARTTLS if 465 is blocked by network
        try:
            with smtplib.SMTP(SMTP_HOST, 587, timeout=12) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, [target], msg.as_string())
            logger.info(f"[DISPATCHED via 587 fallback] Real OTP {otp_code} successfully sent to {target}")
            return True
        except Exception as fallback_exc:
            logger.error(f"[FAILED FALLBACK] SMTP Error sending to {target}: {str(fallback_exc)}")
            raise RuntimeError(f"Email delivery failed: {str(exc)}")


def send_real_email_otp(to_email: str, otp_code: str, purpose: str = "Verification") -> bool:
    return send_instant_otp_email(to_email, otp_code, purpose)

def send_email_otp(to_email: str, otp_code: str, purpose: str = "Verification") -> dict:
    send_instant_otp_email(to_email, otp_code, purpose)
    return {"success": True, "message": f"OTP sent to {to_email}", "recipient": to_email, "purpose": purpose}
