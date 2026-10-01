# test_otp_and_signup_flow.py
import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def make_request(method, endpoint, data=None, timeout=30):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
    
    try:
        with urllib.request.urlopen(req, data=body, timeout=timeout) as resp:
            status = resp.status
            resp_body = resp.read().decode("utf-8")
            return status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {"detail": err_body}
        return e.code, parsed

def run_tests():
    print("==================================================")
    print("STARTING FULL AUTH & OTP E2E VERIFICATION")
    print("==================================================")

    # 1. TEST SEND REGISTRATION OTP
    test_email = f"test_student_{int(time.time())}@gpbarh.ac.in"
    print(f"\n1. Testing POST /api/auth/send-registration-otp with {test_email}...")
    status, otp_data = make_request("POST", "/api/auth/send-registration-otp", {
        "email": test_email,
        "purpose": "SIGNUP"
    })
    print(f"Status Code: {status}")
    assert status == 200, f"Expected 200, got {status}: {otp_data}"
    from auth_service import _otp_store
    otp_code = otp_data.get("otp") or _otp_store.get(test_email.lower(), {}).get("otp")
    print(f"Received OTP: {otp_code}, expires_in: {otp_data.get('expires_in')}s")
    assert otp_code and len(otp_code) == 6, f"OTP must be 6 digits, got {otp_code}"

    # 2. TEST ATTEMPT REGISTER WITHOUT OTP VERIFICATION (MUST BE REJECTED)
    print(f"\n2. Testing registration with invalid OTP (should be rejected)...")
    status, bad_reg_data = make_request("POST", "/api/auth/register", {
        "role": "student",
        "full_name": "Test Unverified Student",
        "email": test_email,
        "reg_no": f"REG_{int(time.time())}",
        "reg_no_email": test_email,
        "password": "SecretPassword123!",
        "gender": "MALE",
        "branch": "Artificial Intelligence & Machine Learning",
        "session": "2024-27",
        "semester": "2024-27",
        "otp": "000000" # Invalid OTP
    })
    print(f"Status Code: {status}")
    assert status == 400, f"Expected 400 rejection, got {status}: {bad_reg_data}"
    print(f"Correctly rejected: {bad_reg_data.get('detail')}")

    # 3. TEST VERIFY REGISTRATION OTP
    print(f"\n3. Testing POST /api/auth/verify-registration-otp with code {otp_code}...")
    status, verify_data = make_request("POST", "/api/auth/verify-registration-otp", {
        "email": test_email,
        "otp": otp_code,
        "purpose": "SIGNUP"
    })
    print(f"Status Code: {status}")
    assert status == 200, f"Expected 200, got {status}: {verify_data}"
    print(f"Verification Response: {verify_data.get('message')}")

    # 4. TEST REGISTER USER WITH VERIFIED OTP
    test_reg_no = f"REG_{int(time.time())}"
    print(f"\n4. Testing POST /api/auth/register with verified OTP...")
    status, reg_data = make_request("POST", "/api/auth/register", {
        "role": "student",
        "full_name": "AMIT KUMAR",
        "email": test_email,
        "reg_no": test_reg_no,
        "reg_no_email": test_reg_no,
        "password": "OriginalPassword123!",
        "gender": "MALE",
        "branch": "Artificial Intelligence & Machine Learning",
        "session": "2024-27",
        "semester": "2024-27",
        "otp": otp_code
    })
    print(f"Status Code: {status}")
    assert status in (200, 201), f"Expected 201, got {status}: {reg_data}"
    print(f"Registered Successfully! Message: {reg_data.get('message')}")
    assert "access_token" in reg_data, "Must return access_token"

    # 5. TEST FORGOT PASSWORD OTP FLOW (USING REG_NO AS IDENTIFIER)
    print(f"\n5. Testing FORGOT PASSWORD flow with Reg No {test_reg_no}...")
    status, forgot_otp_data = make_request("POST", "/api/auth/send-otp", {
        "identifier": test_reg_no,
        "purpose": "FORGOT_PASSWORD"
    })
    print(f"Status Code: {status}")
    assert status == 200, f"Expected 200, got {status}: {forgot_otp_data}"
    forgot_otp = forgot_otp_data.get("otp") or _otp_store.get(test_reg_no.lower(), {}).get("otp") or _otp_store.get(test_email.lower(), {}).get("otp")
    print(f"Received Reset OTP: {forgot_otp} sent to {forgot_otp_data.get('email')}")
    assert forgot_otp and len(forgot_otp) == 6, f"Forgot OTP must be 6 digits, got {forgot_otp}"

    # 6. TEST VERIFY FORGOT PASSWORD OTP
    print(f"\n6. Testing POST /api/auth/verify-otp for password reset...")
    status, verify_forgot_data = make_request("POST", "/api/auth/verify-otp", {
        "identifier": test_reg_no,
        "otp": forgot_otp,
        "purpose": "FORGOT_PASSWORD"
    })
    print(f"Status Code: {status}")
    assert status == 200, f"Expected 200, got {status}: {verify_forgot_data}"

    # 7. TEST POST /api/auth/reset-password
    print(f"\n7. Testing POST /api/auth/reset-password to set new password...")
    status, reset_data = make_request("POST", "/api/auth/reset-password", {
        "identifier": test_reg_no,
        "otp": forgot_otp,
        "new_password": "NewUpdatedPassword2026!"
    })
    print(f"Status Code: {status}")
    assert status == 200, f"Expected 200, got {status}: {reset_data}"
    print(f"Reset Response: {reset_data.get('message')}")

    # 8. TEST LOGIN WITH NEW PASSWORD
    print(f"\n8. Testing Login with updated password...")
    status, login_data = make_request("POST", "/api/auth/login", {
        "reg_no_email": test_reg_no,
        "password": "NewUpdatedPassword2026!"
    })
    print(f"Status Code: {status}")
    assert status == 200, f"Expected 200, got {status}: {login_data}"
    print(f"Login Success! Welcome {login_data.get('user', {}).get('full_name')}")

    # 9. TEST DEV RESET-DATABASE ENDPOINT (WARDEN DANGER ZONE)
    print(f"\n9. Testing POST /api/dev/reset-database to verify CASCADE table erasure...")
    status, reset_db_data = make_request("POST", "/api/dev/reset-database", timeout=60)
    print(f"Status Code: {status}")
    assert status == 200, f"Expected 200, got {status}: {reset_db_data}"
    print(f"Reset DB Response: {reset_db_data.get('message')}")

    print("\n==================================================")
    print("ALL TESTS PASSED WITH 100% SUCCESS! [PASS]")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
