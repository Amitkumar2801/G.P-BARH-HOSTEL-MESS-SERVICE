# backend/app/services/__init__.py
from .email_service import send_real_email_otp, send_email_otp

__all__ = ["send_real_email_otp", "send_email_otp"]
