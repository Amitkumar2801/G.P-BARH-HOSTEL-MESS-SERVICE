import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def send_instant_otp_email(to_email: str, otp_code: str, purpose: str = "Verification") -> bool:
    """
    High-speed instant OTP email dispatcher using official institutional template in auth_service.
    """
    from auth_service import send_email_otp
    res = send_email_otp(to_email=to_email, otp=otp_code, purpose=purpose)
    return bool(res.get("success", False))


def send_real_email_otp(to_email: str, otp_code: str, purpose: str = "Verification") -> bool:
    return send_instant_otp_email(to_email, otp_code, purpose)


def send_email_otp(to_email: str, otp_code: str, purpose: str = "Verification") -> dict:
    from auth_service import send_email_otp as _send
    return _send(to_email, otp_code, purpose)
