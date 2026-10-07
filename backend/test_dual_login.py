import sys
from pathlib import Path
_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from fastapi.testclient import TestClient
import main
from database import SessionLocal
import models
from auth_service import get_password_hash

client = TestClient(main.app)

def test_dual_login():
    db = SessionLocal()
    try:
        # Create or update a test student
        test_student = db.query(models.User).filter(models.User.reg_no == "TEST1554424049").first()
        if not test_student:
            test_student = models.User(
                full_name="Dual Login Test Student",
                reg_no="TEST1554424049",
                reg_no_email="duallogin@gpbarh.ac.in",
                email="duallogin@gpbarh.ac.in",
                password=get_password_hash("Password@123"),
                hashed_password=get_password_hash("Password@123"),
                role="student",
                gender="MALE",
                branch="Computer Science",
                profile_completed=True
            )
            db.add(test_student)
        else:
            test_student.password = get_password_hash("Password@123")
            test_student.hashed_password = get_password_hash("Password@123")
            test_student.email = "duallogin@gpbarh.ac.in"
            test_student.reg_no = "TEST1554424049"
        db.commit()
    finally:
        db.close()

    print("--- 1. Testing Dual Login by Registration Number ---")
    res_reg = client.post("/api/auth/login", json={
        "identifier": "TEST1554424049",
        "password": "Password@123"
    })
    print(f"Status: {res_reg.status_code}")
    assert res_reg.status_code == 200, f"Failed reg login: {res_reg.text}"
    data_reg = res_reg.json()
    assert data_reg.get("access_token") is not None
    assert data_reg.get("user", {}).get("reg_no") == "TEST1554424049"
    print("SUCCESS: Logged in via Registration Number!")

    print("\n--- 2. Testing Dual Login by Email ---")
    res_email = client.post("/api/auth/login", json={
        "identifier": "duallogin@gpbarh.ac.in",
        "password": "Password@123"
    })
    print(f"Status: {res_email.status_code}")
    assert res_email.status_code == 200, f"Failed email login: {res_email.text}"
    data_email = res_email.json()
    assert data_email.get("access_token") is not None
    assert data_email.get("user", {}).get("email") == "duallogin@gpbarh.ac.in"
    print("SUCCESS: Logged in via Email!")

    print("\n--- 3. Testing Warden Login by Email ---")
    res_warden = client.post("/api/auth/login", json={
        "identifier": "warden@gpbarh.ac.in",
        "password": "SANAMIT"
    })
    print(f"Status: {res_warden.status_code}")
    assert res_warden.status_code == 200, f"Failed warden login: {res_warden.text}"
    print("SUCCESS: Logged in Warden via Email!")

    print("\n--- 4. Testing Invalid Password (Should return 401) ---")
    res_invalid = client.post("/api/auth/login", json={
        "identifier": "TEST1554424049",
        "password": "WrongPassword999"
    })
    print(f"Status: {res_invalid.status_code}")
    assert res_invalid.status_code == 401
    assert "Invalid Credentials" in res_invalid.json().get("detail", "")
    print("SUCCESS: Rejected invalid credentials with 401!")

    print("\n=== ALL DUAL LOGIN TESTS PASSED PERFECTLY ===")

if __name__ == "__main__":
    test_dual_login()
