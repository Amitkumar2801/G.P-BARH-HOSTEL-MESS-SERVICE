import requests
import json
import time
from database import SessionLocal
from models import User
from auth_service import (
    get_password_hash,
    verify_password,
    store_otp,
    verify_otp_code,
    invalidate_otp,
    get_stored_otp,
    validate_password_complexity,
    check_otp_attempt_lockout,
    record_otp_failure,
    clear_otp_failures
)

BASE_URL = "http://127.0.0.1:8000"

TEST_REG = "9998887771"
TEST_EMAIL = "test.hardening@gpbarh.ac.in"
INITIAL_PASS = "InitialPass@2026"
NEW_PASS = "UpgradedPass#2026"

def setup_test_user():
    db = SessionLocal()
    try:
        # Clean up any previous test record
        db.query(User).filter((User.reg_no == TEST_REG) | (User.email == TEST_EMAIL)).delete()
        db.commit()

        # Create fresh test user
        hashed = get_password_hash(INITIAL_PASS)
        user = User(
            full_name="Hardening Test Student",
            reg_no=TEST_REG,
            email=TEST_EMAIL,
            reg_no_email=TEST_REG,
            password=hashed,
            role="student",
            branch="Computer Science & Engineering",
            semester="4th Semester"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"[SETUP] Created test user: {user.reg_no} / {user.email}")
        return user.id
    finally:
        db.close()

def cleanup_test_user():
    db = SessionLocal()
    try:
        db.query(User).filter((User.reg_no == TEST_REG) | (User.email == TEST_EMAIL)).delete()
        db.commit()
        print(f"[TEARDOWN] Cleaned up test user: {TEST_REG}")
    finally:
        db.close()

def run_tests():
    user_id = setup_test_user()
    try:
        print("\n=== STEP 1: Login with Initial Password ===")
        login_res = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"reg_no_email": TEST_REG, "password": INITIAL_PASS}
        )
        print(f"Login status: {login_res.status_code}")
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        data = login_res.json()
        token = data.get("access_token")
        assert token, "No access token in login response"
        print("PASS: Logged in successfully and received JWT access token.")

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        print("\n=== STEP 2: Test PUT /api/auth/change-password with WRONG current password ===")
        bad_res = requests.put(
            f"{BASE_URL}/api/auth/change-password",
            headers=headers,
            json={
                "current_password": "WrongPassword!999",
                "new_password": NEW_PASS
            }
        )
        print(f"Bad password status: {bad_res.status_code}, response: {bad_res.text}")
        assert bad_res.status_code == 400, f"Expected 400, got {bad_res.status_code}"
        assert "Current password does not match our records." in bad_res.json().get("detail", "")
        print("PASS: Exactly returned HTTP 400 with 'Current password does not match our records.'")

        print("\n=== STEP 3: Test PUT /api/auth/change-password with WEAK new password ===")
        weak_res = requests.put(
            f"{BASE_URL}/api/auth/change-password",
            headers=headers,
            json={
                "current_password": INITIAL_PASS,
                "new_password": "weak"
            }
        )
        print(f"Weak password status: {weak_res.status_code}, response: {weak_res.text}")
        assert weak_res.status_code == 400
        print("PASS: Password complexity rules enforced for weak inputs.")

        print("\n=== STEP 4: Test PUT /api/auth/change-password with VALID credentials ===")
        good_res = requests.put(
            f"{BASE_URL}/api/auth/change-password",
            headers=headers,
            json={
                "current_password": INITIAL_PASS,
                "new_password": NEW_PASS
            }
        )
        print(f"Good change status: {good_res.status_code}, response: {good_res.text}")
        assert good_res.status_code == 200
        res_json = good_res.json()
        assert res_json.get("message") == "Password updated successfully. Please log in again."
        print("PASS: Successfully received: 'Password updated successfully. Please log in again.'")

        print("\n=== STEP 5: Verify Neon PostgreSQL DB record updated with new hash ===")
        db = SessionLocal()
        try:
            db_u = db.query(User).filter(User.id == user_id).first()
            assert db_u is not None
            assert verify_password(NEW_PASS, db_u.password) is True
            assert verify_password(INITIAL_PASS, db_u.password) is False
            print("PASS: Neon PostgreSQL user.hashed_password persistently matches NEW_PASS.")
        finally:
            db.close()

        print("\n=== STEP 6: Verify OLD password rejected on login ===")
        old_login = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"reg_no_email": TEST_REG, "password": INITIAL_PASS}
        )
        print(f"Old login status: {old_login.status_code}")
        assert old_login.status_code == 401
        print("PASS: Old password rejected with HTTP 401.")

        print("\n=== STEP 7: Verify NEW password succeeds on login ===")
        new_login = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"reg_no_email": TEST_REG, "password": NEW_PASS}
        )
        print(f"New login status: {new_login.status_code}")
        assert new_login.status_code == 200
        print("PASS: New password successfully authenticates and issues new JWT!")

        print("\n=== STEP 8: Anti-Spam Rate Limiting (60-second cooldown) ===")
        rate_email = f"rate_limit_{int(time.time())}@gpbarh.ac.in"
        req1 = requests.post(f"{BASE_URL}/api/auth/send-otp", json={"email": rate_email, "purpose": "SIGNUP"})
        print(f"OTP 1 status: {req1.status_code}")
        assert req1.status_code == 200

        # Immediate follow-up request within 60s
        req2 = requests.post(f"{BASE_URL}/api/auth/send-otp", json={"email": rate_email, "purpose": "SIGNUP"})
        print(f"OTP 2 status: {req2.status_code}, response: {req2.text}")
        assert req2.status_code == 429
        assert "Please wait" in req2.text
        print("PASS: 60-second cooldown rate limiting verified via HTTP 429.")

        print("\n=== STEP 9: Anti-Brute-Force Lockout (3 invalid attempts -> 15 min lock) ===")
        lockout_email = f"lockout_{int(time.time())}@gpbarh.ac.in"
        req_lock = requests.post(f"{BASE_URL}/api/auth/send-otp", json={"email": lockout_email, "purpose": "SIGNUP"})
        assert req_lock.status_code == 200

        for attempt in range(1, 4):
            fail_res = requests.post(
                f"{BASE_URL}/api/auth/verify-otp",
                json={"email": lockout_email, "otp": f"00000{attempt}", "purpose": "SIGNUP"}
            )
            print(f"Failed attempt {attempt}: status {fail_res.status_code}")
            assert fail_res.status_code in (400, 429)

        # 4th attempt must be locked out (HTTP 429)
        lock_res = requests.post(
            f"{BASE_URL}/api/auth/verify-otp",
            json={"email": lockout_email, "otp": "999999", "purpose": "SIGNUP"}
        )
        print(f"4th attempt status: {lock_res.status_code}, response: {lock_res.text}")
        assert lock_res.status_code == 429
        assert "Security Alert" in lock_res.text or "locked" in lock_res.text
        print("PASS: 15-minute brute-force lockout verified via HTTP 429.")

        print("\n=== STEP 10: Single-Use OTP Invalidation & Immediate Cache Purge ===")
        otp_test_target = "singleuse.test@gpbarh.ac.in"
        store_otp(otp_test_target, "784123", purpose="FORGOT_PASSWORD", ttl_seconds=300)
        assert get_stored_otp(otp_test_target, purpose="FORGOT_PASSWORD") == "784123"
        print("Stored active OTP: 784123")

        # First verification with consume=True (standard single-use completion)
        v1 = verify_otp_code(otp_test_target, "784123", purpose="FORGOT_PASSWORD", consume=True)
        assert v1 is True
        print("First verification: SUCCESS (consumed)")

        # Verify cache is immediately purged
        assert get_stored_otp(otp_test_target, purpose="FORGOT_PASSWORD") is None
        print("Cache check: OTP record was immediately deleted")

        # Second verification (replay attack) MUST fail
        v2 = verify_otp_code(otp_test_target, "784123", purpose="FORGOT_PASSWORD", consume=True)
        assert v2 is False
        print("PASS: Single-use OTP replay blocked. Record does not exist.")

        print("\n=== STEP 11: Password Complexity Enforcement ===")
        valid_p, _ = validate_password_complexity("ValidPass123!")
        assert valid_p is True
        too_short, err1 = validate_password_complexity("Short1!")
        assert too_short is False
        no_num, err2 = validate_password_complexity("NoNumbersHere!")
        assert no_num is False
        no_sym, err3 = validate_password_complexity("NoSymbols12345")
        assert no_sym is False
        print("PASS: Password complexity regex strictly enforces: 8+ length, numbers, and symbols.")

        print("\n=======================================================")
        print(">>> ALL 11 SECURITY & HARDENING TESTS PASSED 100%! <<<")
        print("=======================================================")

    finally:
        cleanup_test_user()

if __name__ == "__main__":
    run_tests()
