import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.email_service import send_real_email_otp, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD

def test_dispatch():
    print("=" * 60)
    print("TESTING REAL GMAIL SMTP OTP DISPATCH")
    print("=" * 60)
    print(f"SMTP Server: {SMTP_HOST}:{SMTP_PORT}")
    print(f"Sender Email: {SMTP_USER}")
    print(f"App Password Length: {len(SMTP_PASSWORD)} chars (hidden)")
    
    test_target = SMTP_USER  # send test verification OTP to official hostel inbox
    test_otp = "852963"
    
    print(f"\nSending test OTP ({test_otp}) to: {test_target}...")
    try:
        success = send_real_email_otp(to_email=test_target, otp_code=test_otp, purpose="Test Verification")
        if success:
            print("\n[SUCCESS] Real OTP delivered successfully via Gmail SMTP!")
            return True
        else:
            print("\n[FAILED] SMTP returned False.")
            return False
    except Exception as e:
        print(f"\n[ERROR] SMTP Dispatch Failed: {e}")
        return False

if __name__ == "__main__":
    test_dispatch()
