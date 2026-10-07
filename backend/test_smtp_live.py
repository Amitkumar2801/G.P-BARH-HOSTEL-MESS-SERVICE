import os
import smtplib
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

backend_env = Path(__file__).resolve().parent / ".env"
root_env = Path(__file__).resolve().parent.parent / ".env"
if backend_env.exists():
    load_dotenv(backend_env)
elif root_env.exists():
    load_dotenv(root_env)
else:
    load_dotenv()

smtp_server = os.getenv("SMTP_HOST") or os.getenv("EMAIL_HOST", "smtp.gmail.com")
smtp_port = int(os.getenv("SMTP_PORT") or os.getenv("EMAIL_PORT", "587"))
smtp_user = os.getenv("SMTP_USER") or os.getenv("EMAIL_HOST_USER") or os.getenv("SMTP_EMAIL", "gpbarhhostel@gmail.com")
smtp_pass = os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_HOST_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD", "")
clean_smtp_pass = smtp_pass.replace(" ", "").strip()

print(f"SMTP Server: {smtp_server}:{smtp_port}")
print(f"SMTP User: {smtp_user}")
print(f"SMTP Password Length: {len(clean_smtp_pass)} chars (Masked: {clean_smtp_pass[:3]}...{clean_smtp_pass[-3:] if len(clean_smtp_pass) > 6 else ''})")

if not clean_smtp_pass:
    print("ERROR: SMTP Password is empty!")
    exit(1)

try:
    print("Connecting to Gmail SMTP...")
    server = smtplib.SMTP(smtp_server, smtp_port, timeout=20)
    server.set_debuglevel(1)
    print("Sending STARTTLS...")
    server.starttls()
    print("Authenticating with Gmail...")
    server.login(smtp_user, clean_smtp_pass)
    print("Authentication SUCCESSFUL! 235 Authentication succeeded.")

    test_to = smtp_user
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "[Live Test] GP Barh Hostel SMTP Verification"
    msg["From"] = f"Govt. Polytechnic Barh <{smtp_user}>"
    msg["To"] = test_to
    msg.attach(MIMEText("Test email body: SMTP dispatch is working perfectly!", "plain"))

    print(f"Sending test email to {test_to}...")
    server.send_message(msg)
    server.quit()
    print("EMAIL SENT SUCCESSFULLY!")
except Exception as e:
    print(f"SMTP ERROR: {e}")
    exit(1)
