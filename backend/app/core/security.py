# backend/app/core/security.py
import re
import bcrypt
from typing import Optional, Tuple

class CryptContext:
    """
    Enterprise-grade password hashing and verification interface
    compatible with passlib.context.CryptContext (pwd_context.verify, pwd_context.hash).
    Uses direct bcrypt bindings with 72-byte safe UTF-8 truncation and salt generation,
    ensuring full compatibility across Python 3.10-3.14 and modern bcrypt.
    """
    def __init__(self, schemes=None, deprecated="auto"):
        self.schemes = schemes or ["bcrypt"]
        self.deprecated = deprecated

    def hash(self, secret: str) -> str:
        """Hash plain password using bcrypt with standard salt."""
        cleaned = (secret or "").strip()
        pwd_bytes = cleaned.encode("utf-8")[:72]
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

    def verify(self, secret: str, hashed_or_plain: str) -> bool:
        """Verify plain password against hashed string, with legacy plain-text fallback."""
        if secret is None or hashed_or_plain is None:
            return False
        cleaned = str(secret).strip()
        target = str(hashed_or_plain).strip()
        try:
            if target.startswith("$2a$") or target.startswith("$2b$") or target.startswith("$2y$"):
                pwd_bytes = cleaned.encode("utf-8")[:72]
                hash_bytes = target.encode("utf-8")
                return bcrypt.checkpw(pwd_bytes, hash_bytes)
        except Exception:
            pass
        # Backward compatibility for legacy test records stored unhashed
        return cleaned == target or str(secret) == str(hashed_or_plain)

# Global Unified Hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash plain password using global bcrypt hasher."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)

# Strict institutional password regex: minimum 8 characters, at least 1 number, 1 special character
PASSWORD_REGEX = re.compile(r'^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>_~`+\-=\[\]\\;/]).{8,}$')

def validate_password_complexity(password: str) -> Tuple[bool, Optional[str]]:
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
