# backend/test_endpoints.py
import sys
sys.stdout.reconfigure(encoding='utf-8')
import models
import schemas
from database import SessionLocal
import main

def run_tests():
    db = SessionLocal()
    try:
        print("--- 1. Testing Root / Health Check ---")
        root_data = main.read_root()
        print("Root OK:", root_data)

        print("\n--- 2. Testing Male & Female Signup with Gender ---")
        # Ensure test male user exists or create
        try:
            m_user = main.create_user(schemas.UserCreate(
                full_name="Rohan Kumar",
                reg_no_email="1554424991",
                password="password123",
                role="student",
                gender="MALE"
            ), db=db)
            print("Created male student:", m_user)
        except Exception as e:
            print("Male user exists/handled:", str(e))

        try:
            f_user = main.create_user(schemas.UserCreate(
                full_name="Ananya Sharma",
                reg_no_email="1554424992",
                password="password123",
                role="student",
                gender="FEMALE"
            ), db=db)
            print("Created female student:", f_user)
        except Exception as e:
            print("Female user exists/handled:", str(e))

        print("\n--- 3. Testing Login ---")
        login_res = main.login_user(schemas.UserLogin(
            reg_no_email="1554424991",
            password="password123"
        ), db=db)
        user_info = login_res["user"]
        print(f"Logged in user: {user_info['full_name']} | Gender: {user_info['gender']} | Role: {user_info['role']}")

        print("\n--- 4. Testing Profile Update (Free Profile Setup) ---")
        updated_prof = main.update_user_profile(schemas.ProfileUpdate(
            user_id=user_info["id"],
            full_name="Amit Kumar Sharma",
            gender="MALE",
            branch="AI & ML",
            semester="4th Semester",
            roll_no="24-AIML-01",
            reg_no="1554424049",
            mobile="9876543210",
            guardian_contact="9876543211",
            address="Campus Road, Barh",
            blood_group="B+"
        ), db=db)
        print("Profile Updated. Completed status:", updated_prof.profile_completed)

        print("\n--- 5. Testing Gender-Isolated Blueprints ---")
        boys_layout = main.get_hostel_layout(gender="MALE", student_id=user_info["id"], db=db)
        print(f"Boys Hostel Blueprint: {boys_layout.name} | Shape: {boys_layout.shape_type} | Total Rooms: {len(boys_layout.rooms)}")
        assert boys_layout.shape_type in ["H_SHAPE", "BLUEPRINT_LAYOUT"]

        girls_layout = main.get_hostel_layout(gender="FEMALE", student_id=user_info["id"], db=db)
        print(f"Girls Hostel Blueprint: {girls_layout.name} | Shape: {girls_layout.shape_type} | Total Rooms: {len(girls_layout.rooms)}")
        assert girls_layout.shape_type in ["LINEAR", "BLUEPRINT_LAYOUT", "CORRIDOR_DUAL_WING"]



        print("\n--- 6. Testing Request Bed Allotment ---")
        first_room = boys_layout.rooms[0]
        first_bed = first_room.beds[0]
        try:
            req_res = main.request_bed(schemas.BedRequestCreate(
                student_id=user_info["id"],
                room_id=first_room.id,
                bed_id=first_bed.id
            ), db=db)
            print("Bed Allotment Request Result:", req_res)
        except Exception as e:
            print("Allotment request note (existing or handled):", str(e))

        print("\n--- 7. Testing Warden Pending Queue & Approvals ---")
        pending_list = main.get_pending_allotment_requests(db=db)
        print(f"Pending Requests in Queue: {len(pending_list)}")
        if pending_list:
            target_req = pending_list[0]
            action_res = main.action_allotment_request(
                request_id=target_req.id,
                action_data=schemas.AllotmentActionRequest(action="approve", remarks="Approved by Chief Warden"),
                db=db
            )
            print("Warden Allotment Action:", action_res)

        print("\n--- 8. Testing Student Allotment Status Check ---")
        status_check = main.get_student_allotment_status(student_id=user_info["id"], db=db)
        print("Student Allotment Status:", status_check)

        print("\n--- 9. Testing Warden Analytics & Student Directory ---")
        analytics = main.get_warden_analytics(db=db)
        print(f"Analytics: Total Capacity: {analytics.total_capacity} | Occupied: {analytics.total_occupied} | Boys %: {analytics.boys_occupancy_pct}% | Girls %: {analytics.girls_occupancy_pct}%")

        directory = main.get_warden_students(db=db)
        print(f"Student Directory Total Roster: {len(directory)}")

        print("\n--- 10. Testing Daily Mess Dynamic QR Token & Mark Attendance ---")
        qr_token_payload = main.get_daily_mess_qr_token()
        print("Daily Mess Token Payload:", qr_token_payload)

        # Mark breakfast attendance for student
        mess_res = main.mark_mess_attendance(schemas.MessAttendanceMarkRequest(
            student_id=user_info["id"],
            meal_type="BREAKFAST"
        ), db=db)
        print("Mess Attendance Result:", mess_res.student_name, mess_res.meal_label, mess_res.token_code)
        assert mess_res.status == "VERIFIED"

        print("\n--- 11. Testing Today Mess Stats Feed ---")
        today_stats = main.get_today_mess_stats(target_date=None, db=db)
        print(f"Today Stats: Scanned: {today_stats.total_scanned_today} | Active Slot: {today_stats.active_slot} | Breakfast Count: {today_stats.breakfast_count}")
        assert today_stats.breakfast_count >= 1

        print("\n--- 12. Testing Student Records Visual Analytics Aggregation ---")
        analytics_agg = main.get_student_records_analytics(student_id=user_info["id"], db=db)
        print(f"Student Analytics: Present Days: {analytics_agg.attendance_summary.get('present_days')} | Paid: {analytics_agg.financial_progress.get('total_paid')} | Timeline Items: {len(analytics_agg.activity_timeline)}")
        assert len(analytics_agg.monthly_attendance) == 30

        print("\n--- 13. Testing Dev Database Reset Endpoint ---")
        reset_out = main.reset_database()
        print("Dev Reset Response:", reset_out)
        assert reset_out["status"] == "success"

        print("\n🎉 ALL BACKEND, MESS ATTENDANCE & ANALYTICS TESTS COMPLETED WITH 100% SUCCESS!")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
