import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "gpbarhhostel@gmail.com").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "utqbtzbwvpkcbtjp").replace(" ", "").strip()

def send_real_email_otp(to_email: str, otp_code: str, purpose: str = "Verification") -> bool:
    target = to_email.strip().lower()
    subject = f"GP Barh Hostel & Mess Portal - {purpose} OTP: {otp_code}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #800000; text-align: center; margin: 0 0 10px 0;">राजकीय पॉलिटेक्निक, बाढ़</h2>
        <p style="text-align: center; color: #555; margin: 0 0 20px 0;">Government Polytechnic, Barh - Hostel & Mess System</p>
        <p>Hello,</p>
        <p>Your verification code for <strong>{purpose}</strong> is:</p>
        <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #800000; background: #fff5f5; padding: 10px 24px; border: 1px dashed #800000; border-radius: 6px; display: inline-block;">
                {otp_code}
            </span>
        </div>
        <p style="color: #666; font-size: 13px;">Valid for 10 minutes. Please do not share it with anyone.</p>
    </div>
    """
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"GP Barh Hostel <{SMTP_USER}>"
    msg["To"] = target
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=25) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, [target], msg.as_string())
        logger.info(f"SUCCESS: Real OTP dispatched to {target}")
        return True
    except Exception as exc:
        logger.error(f"SMTP Dispatch Error: {exc}")
        raise RuntimeError(f"SMTP Delivery Failed: {str(exc)}")
