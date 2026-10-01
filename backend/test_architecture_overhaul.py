# backend/test_architecture_overhaul.py
import requests
import models
from database import SessionLocal
from auth_service import store_otp

BASE_URL = "http://127.0.0.1:8000"

def test_full_architecture_flow():
    db = SessionLocal()
    try:
        print("[TEST 1] Cleaning up pre-existing test data...")
        test_email = "vivek_test_2026@gpbarh.ac.in"
        test_reg = "1554424099"

        existing_user = db.query(models.User).filter(models.User.reg_no == test_reg).first()
        if existing_user:
            db.query(models.MessAttendance).filter(models.MessAttendance.student_id == existing_user.id).delete()
            db.query(models.AllotmentRequest).filter(models.AllotmentRequest.student_id == existing_user.id).delete()
            db.query(models.User).filter(models.User.id == existing_user.id).delete()
            db.commit()

        # 1. Test Send OTP
        print("[TEST 2] Testing POST /api/auth/send-otp...")
        res_otp = requests.post(f"{BASE_URL}/api/auth/send-otp", json={"email": test_email, "purpose": "SIGNUP"})
        assert res_otp.status_code == 200, res_otp.text
        data_otp = res_otp.json()
        test_code = data_otp.get("otp")
        print("  -> OTP generated & dispatched:", data_otp.get("message"), f"(OTP: {test_code})")

        # 2. Test Verify OTP
        print("[TEST 3] Testing POST /api/auth/verify-otp...")
        res_ver = requests.post(f"{BASE_URL}/api/auth/verify-otp", json={"email": test_email, "otp": test_code, "purpose": "SIGNUP"})
        assert res_ver.status_code == 200, res_ver.text
        assert res_ver.json()["verified"] is True
        print("  -> OTP verified successfully!")

        # 3. Dynamic Signup with OTP & Hashed Password
        print("[TEST 4] Testing POST /api/auth/signup (Vivek Kumar)...")
        signup_payload = {
            "full_name": "Vivek Kumar",
            "reg_no_email": test_reg,
            "reg_no": test_reg,
            "email": test_email,
            "password": "vivek_secure_pass_2026",
            "role": "student",
            "gender": "MALE",
            "branch": "Artificial Intelligence & Machine Learning",
            "session": "2024-27",
            "semester": "2024-27",
            "otp": test_code
        }
        res_signup = requests.post(f"{BASE_URL}/api/auth/signup", json=signup_payload)
        assert res_signup.status_code == 201, res_signup.text
        signup_data = res_signup.json()
        assert "access_token" in signup_data
        assert signup_data["user"]["full_name"] == "Vivek Kumar"
        assert signup_data["user"]["room_number"] is None
        assert signup_data["user"]["bed_code"] is None
        assert signup_data["user"]["allotment_status"] == "NONE"
        token = signup_data["access_token"]
        student_id = signup_data["user"]["id"]
        print(f"  -> Student created: {signup_data['user']['full_name']} (ID: {student_id}, Room: {signup_data['user']['room_number']}, Allotment: {signup_data['user']['allotment_status']})")

        # 4. Dynamic Login
        print("[TEST 5] Testing POST /api/auth/login...")
        res_login = requests.post(f"{BASE_URL}/api/auth/login", json={"reg_no_email": test_reg, "password": "vivek_secure_pass_2026"})
        assert res_login.status_code == 200, res_login.text
        login_data = res_login.json()
        assert "access_token" in login_data
        assert login_data["user"]["full_name"] == "Vivek Kumar"
        token = login_data["access_token"]
        print("  -> Login successful, JWT access token received!")

        # 5. Dynamic Auth Session (/api/auth/me) with JWT
        print("[TEST 6] Testing GET /api/auth/me with Bearer token...")
        res_me = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res_me.status_code == 200, res_me.text
        me_data = res_me.json()
        assert me_data["full_name"] == "Vivek Kumar", f"Expected Vivek Kumar, got {me_data['full_name']}"
        assert me_data["reg_no"] == test_reg
        assert me_data["email"] == test_email
        assert "Amit" not in me_data["full_name"], "Amit Kumar fallback detected!"
        print("  -> CONFIRMED: GET /api/auth/me strictly returned Vivek Kumar!")

        # 6. Check Allotment Status Starts with NONE (Locked Tabs)
        print("[TEST 7] Testing GET /api/student/allotment-status...")
        res_status = requests.get(f"{BASE_URL}/api/student/allotment-status/{student_id}", headers={"Authorization": f"Bearer {token}"})
        assert res_status.status_code == 200
        assert res_status.json()["status"] == "NONE"
        assert res_status.json()["fee_unlocked"] is False
        print("  -> CONFIRMED: Initial allotment status is NONE (Features remain padlocked).")

        # 7. Change Password (/api/auth/change-password)
        print("[TEST 8] Testing PUT /api/auth/change-password...")
        res_chg_fail = requests.put(
            f"{BASE_URL}/api/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={"current_password": "wrong_password", "new_password": "vivek_new_pass_2026"}
        )
        assert res_chg_fail.status_code == 400
        print("  -> Wrong password rejected successfully (400).")

        res_chg_ok = requests.put(
            f"{BASE_URL}/api/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={"current_password": "vivek_secure_pass_2026", "new_password": "vivek_new_pass_2026"}
        )
        assert res_chg_ok.status_code == 200
        print("  -> Password changed successfully!")

        # Verify login with new password
        res_login_new = requests.post(f"{BASE_URL}/api/auth/login", json={"reg_no_email": test_reg, "password": "vivek_new_pass_2026"})
        assert res_login_new.status_code == 200
        print("  -> Login with new password succeeded!")

        # 8. Forgot Password Flow
        print("[TEST 9] Testing POST /api/auth/forgot-password...")
        res_f_otp = requests.post(f"{BASE_URL}/api/auth/send-otp", json={"email": test_email, "purpose": "FORGOT_PASSWORD"})
        assert res_f_otp.status_code == 200, res_f_otp.text
        forgot_otp = res_f_otp.json().get("otp")

        res_forgot = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": test_email,
            "otp": forgot_otp,
            "new_password": "vivek_reset_pass_2026"
        })
        assert res_forgot.status_code == 200
        print("  -> Password reset via OTP succeeded!")

        res_login_reset = requests.post(f"{BASE_URL}/api/auth/login", json={"reg_no_email": test_reg, "password": "vivek_reset_pass_2026"})
        assert res_login_reset.status_code == 200
        token = res_login_reset.json()["access_token"]
        print("  -> Login with reset password confirmed!")

        # 9. Mess Attendance Persistence & Duplicate Punch Prevention
        print("[TEST 10] Testing POST /api/mess/mark-attendance...")
        res_mess1 = requests.post(
            f"{BASE_URL}/api/mess/mark-attendance",
            headers={"Authorization": f"Bearer {token}"},
            json={"student_id": student_id, "meal_type": "BREAKFAST"}
        )
        assert res_mess1.status_code == 200, res_mess1.text
        mess1_data = res_mess1.json()
        assert mess1_data["meal_type"] == "BREAKFAST"
        assert mess1_data["status"] == "VERIFIED"
        print(f"  -> First breakfast punch recorded: Token {mess1_data['token_code']}")

        # Attempt Duplicate Punch for same meal on same day
        res_mess_dup = requests.post(
            f"{BASE_URL}/api/mess/mark-attendance",
            headers={"Authorization": f"Bearer {token}"},
            json={"student_id": student_id, "meal_type": "BREAKFAST"}
        )
        assert res_mess_dup.status_code == 400
        assert "already recorded" in res_mess_dup.json()["detail"].lower()
        print("  -> CONFIRMED: Duplicate punch prevented with 400 Bad Request!")

        # 10. Warden Batch Clearance & Year-Back Segregation
        print("[TEST 11] Testing Warden Batch Endpoints...")
        # Query batch
        res_batch = requests.get(f"{BASE_URL}/api/warden/students/by-batch?session=2024-27&hostel_type=ALL")
        assert res_batch.status_code == 200
        batch_students = res_batch.json()
        assert any(s["id"] == student_id for s in batch_students)
        print(f"  -> Batch 2024-27 fetched: {len(batch_students)} student(s) enrolled.")

        # Mark Vivek as Year-Back
        res_yb = requests.post(f"{BASE_URL}/api/warden/students/mark-year-back", json={"student_id": student_id, "is_year_back": True})
        assert res_yb.status_code == 200
        assert res_yb.json()["is_year_back"] is True
        print(f"  -> Student {student_id} successfully tagged as is_year_back=True!")

        # Test batch clearance with exclude_year_back = True (Vivek must be preserved!)
        res_clear = requests.delete(f"{BASE_URL}/api/warden/students/batch-clear?session=2024-27&exclude_year_back=true")
        assert res_clear.status_code == 200
        clear_data = res_clear.json()
        print("  -> Batch clearance response:", clear_data["message"])

        # Verify Vivek is STILL alive in database
        check_user = db.query(models.User).filter(models.User.id == student_id).first()
        assert check_user is not None
        assert check_user.full_name == "Vivek Kumar"
        print("  -> CONFIRMED: Vivek Kumar is safely preserved in database as Year-Back!")

        # Cleanup: clean up test user
        db.query(models.MessAttendance).filter(models.MessAttendance.student_id == student_id).delete()
        db.query(models.User).filter(models.User.id == student_id).delete()
        db.commit()

        print("\n========================================================")
        print(">>> ALL 11 ARCHITECTURAL BACKEND TESTS PASSED 100%! <<<")
        print("========================================================\n")

    finally:
        db.close()

if __name__ == "__main__":
    test_full_architecture_flow()
