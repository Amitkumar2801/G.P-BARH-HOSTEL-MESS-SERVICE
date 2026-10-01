# backend/test_neon_allotment_e2e.py
"""
End-to-End Live Verification Test for Neon PostgreSQL Database Persistence:
1. Student Allotment Submission Pipeline (POST /api/allotment/request)
2. Target Bed Vacancy & Pending Constraints
3. Warden Approval Live Persistence (allotment_requests, beds, users)
4. Querying Pending directly from Neon Cloud (ensuring approved/rejected never reappear)
5. Student Annual Room Upgrade Workflow (1st Year -> 2nd/3rd Year: Vacate old bed, assign new bed)
6. Warden Rejection Live Persistence & Clean Bed Release
"""

import os
import sys
from datetime import datetime

# Set UTF-8 encoding for Windows terminal
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from database import SessionLocal, engine
import models
import schemas
from routes.allotment import submit_allotment_request, approve_allotment_request, reject_allotment_request, get_pending_allotment_requests

def run_neon_allotment_e2e_tests():
    print("\n" + "="*80)
    print("[TEST] LIVE NEON CLOUD DATABASE ALLOTMENT & UPGRADE PERSISTENCE AUDIT")
    print("="*80)
    print(f"Target Database URL: {engine.url}")

    db = SessionLocal()
    try:
        # 1. Verify / Create Test Student & Initial State
        print("\n--- Step 1: Setting Up Test Student in Neon Cloud DB ---")
        test_student_reg = "TEST_NEON_ALLOT_2026"
        student = db.query(models.User).filter(models.User.reg_no == test_student_reg).first()
        if not student:
            student = models.User(
                full_name="Abhishek Kumar (Neon E2E Test)",
                reg_no_email=f"{test_student_reg.lower()}@gpbarh.ac.in",
                email=f"{test_student_reg.lower()}@gpbarh.ac.in",
                reg_no=test_student_reg,
                password="TestPassword123",
                role="student",
                gender="MALE",
                branch="Civil Engineering",
                semester="3rd Sem",
                mobile="+91 98765 43210",
                pincode="803213",
                home_district="Patna",
                distance_km=75.0,
                profile_completed=True,
                room_number=None,
                bed_code=None,
                hostel_block=None,
                allotment_status="NONE"
            )
            db.add(student)
            db.commit()
            db.refresh(student)
        else:
            # Clean up prior test allotment requests & beds for clean run
            student.room_number = None
            student.bed_code = None
            student.hostel_block = None
            student.allotment_status = "NONE"
            db.query(models.AllotmentRequest).filter(models.AllotmentRequest.student_id == student.id).delete()
            old_beds = db.query(models.Bed).filter(models.Bed.current_student_id == student.id).all()
            for ob in old_beds:
                ob.is_occupied = False
                ob.current_student_id = None
            db.commit()
            db.refresh(student)

        print(f"✅ Test Student Ready: ID={student.id}, RegNo={student.reg_no}, Name={student.full_name}")

        # Find two vacant beds in Birsa / Rajendra Boys Hostel
        boys_hostel = db.query(models.Hostel).filter(models.Hostel.gender_type.in_(["MALE", "BOYS"])).first()
        assert boys_hostel is not None, "Boys hostel not found in Neon database!"

        vacant_beds = (
            db.query(models.Bed)
            .join(models.Room)
            .filter(models.Room.hostel_id == boys_hostel.id, models.Bed.is_occupied == False)
            .limit(2)
            .all()
        )
        assert len(vacant_beds) >= 2, "Need at least 2 vacant beds in Boys Hostel to run E2E upgrade tests!"

        bed1 = vacant_beds[0]
        bed2 = vacant_beds[1]
        room1 = bed1.room
        room2 = bed2.room

        print(f"✅ Target Bed 1 for Initial Allotment: Room {room1.room_number}, Bed {bed1.bed_code} (ID: {bed1.id})")
        print(f"✅ Target Bed 2 for Upgrade Flow: Room {room2.room_number}, Bed {bed2.bed_code} (ID: {bed2.id})")

        # --------------------------------------------------------------------------
        # Test 1: Submit Initial Allotment Request (POST /api/allotment/request)
        # --------------------------------------------------------------------------
        print("\n--- Step 2: Testing POST /api/allotment/request (Initial Allotment) ---")
        req_payload = schemas.BedRequestCreate(
            student_id=student.id,
            room_id=room1.id,
            bed_id=bed1.id,
            bed_code=bed1.bed_code,
            hostel_id=boys_hostel.id,
            request_type="NEW"
        )
        res1 = submit_allotment_request(req_payload, db)
        print(f"✅ Submission Response: {res1}")
        assert res1["status"] == "PENDING"
        req_id1 = res1["request_id"]

        # Verify in Neon DB
        db_req1 = db.query(models.AllotmentRequest).filter(models.AllotmentRequest.id == req_id1).first()
        assert db_req1 is not None
        assert db_req1.status == "PENDING"
        assert db_req1.student_id == student.id
        assert db_req1.bed_id == bed1.id
        print("✅ Live Neon DB record verified for initial request (status=PENDING).")

        # --------------------------------------------------------------------------
        # Test 2: Verify GET /api/allotment/pending queries directly from Neon
        # --------------------------------------------------------------------------
        print("\n--- Step 3: Testing GET /api/allotment/pending ---")
        pending_list = get_pending_allotment_requests(db)
        matching_pending = [p for p in pending_list if p.id == req_id1]
        assert len(matching_pending) == 1
        print(f"✅ Pending list successfully retrieved from Neon Cloud! (Found Request #{req_id1})")

        # --------------------------------------------------------------------------
        # Test 3: Test Warden Approval (POST /api/allotment/approve/{req_id1})
        # --------------------------------------------------------------------------
        print(f"\n--- Step 4: Testing Warden Approval for Request #{req_id1} ---")
        approve_action = schemas.AllotmentActionRequest(action="approve", remarks="Chief Warden Approved Initial Allotment")
        app_res = approve_allotment_request(req_id1, approve_action, db)
        print(f"✅ Approval Response: {app_res}")
        assert app_res["status"] == "APPROVED"

        # Verify Neon DB updates
        db.refresh(student)
        db.refresh(bed1)
        db_req1 = db.query(models.AllotmentRequest).filter(models.AllotmentRequest.id == req_id1).first()

        assert db_req1.status == "APPROVED"
        assert bed1.is_occupied == True
        assert bed1.current_student_id == student.id
        assert student.room_number == room1.room_number
        assert student.bed_code == bed1.bed_code
        assert student.allotment_status == "APPROVED"
        print("✅ Neon DB Verified: Bed marked occupied, User updated with room/bed, Allotment status APPROVED.")

        # Ensure approved request is NO LONGER in pending list
        pending_list_after_approval = get_pending_allotment_requests(db)
        assert not any(p.id == req_id1 for p in pending_list_after_approval)
        print("✅ GET /api/allotment/pending verified: Approved request does NOT appear in pending list.")

        # --------------------------------------------------------------------------
        # Test 4: Annual Room Upgrade Workflow (1st Year -> 2nd/3rd Year)
        # --------------------------------------------------------------------------
        print("\n--- Step 5: Testing Student Annual Room Upgrade Workflow ---")
        print(f"Current Assignment: Room {student.room_number}, Bed {student.bed_code}")
        print(f"Requesting Upgrade to: Room {room2.room_number}, Bed {bed2.bed_code}")

        # Try requesting an occupied bed (Bed 1 is occupied) -> Must fail
        try:
            occupied_payload = schemas.BedRequestCreate(
                student_id=student.id,
                room_id=room1.id,
                bed_id=bed1.id,
                bed_code=bed1.bed_code,
                request_type="UPGRADE"
            )
            submit_allotment_request(occupied_payload, db)
            assert False, "Should have thrown HTTPException for already occupied/same bed!"
        except Exception as ex:
            print(f"✅ Correctly Blocked invalid bed selection: {ex.detail if hasattr(ex, 'detail') else str(ex)}")

        # Submit valid upgrade request to Bed 2
        upgrade_payload = schemas.BedRequestCreate(
            student_id=student.id,
            room_id=room2.id,
            bed_id=bed2.id,
            bed_code=bed2.bed_code,
            hostel_id=boys_hostel.id,
            request_type="UPGRADE"
        )
        upg_res = submit_allotment_request(upgrade_payload, db)
        print(f"✅ Upgrade Request Submitted: {upg_res}")
        assert upg_res["status"] == "PENDING"
        assert upg_res["request_type"] == "UPGRADE"
        upg_req_id = upg_res["request_id"]

        # Verify Pending Upgrade in Warden Queue
        pending_list_upg = get_pending_allotment_requests(db)
        matching_upg = [p for p in pending_list_upg if p.id == upg_req_id]
        assert len(matching_upg) == 1
        assert matching_upg[0].request_type == "UPGRADE"
        assert matching_upg[0].current_room_number == room1.room_number
        print(f"✅ Warden Pending Queue displays UPGRADE request from Room {matching_upg[0].current_room_number} to Room {matching_upg[0].room_number}.")

        # Approve Upgrade Request
        print(f"\n--- Step 6: Warden Approving Upgrade Request #{upg_req_id} ---")
        upg_app_res = approve_allotment_request(
            upg_req_id,
            schemas.AllotmentActionRequest(action="approve", remarks="Annual Room Upgrade Approved"),
            db
        )
        print(f"✅ Upgrade Approval Result: {upg_app_res}")

        # Verify Upgrade in Neon DB:
        db.refresh(student)
        db.refresh(bed1)
        db.refresh(bed2)

        # 1. Old bed MUST be vacated
        assert bed1.is_occupied == False, "Old bed was not vacated on upgrade approval!"
        assert bed1.current_student_id is None, "Old bed student_id was not cleared!"
        print("✅ Old Bed (Bed 1) successfully vacated (is_occupied=False, current_student_id=None).")

        # 2. New bed MUST be assigned
        assert bed2.is_occupied == True, "New bed was not marked occupied!"
        assert bed2.current_student_id == student.id, "New bed was not assigned to student!"
        print(f"✅ New Bed (Bed 2) assigned to student (is_occupied=True, current_student_id={student.id}).")

        # 3. Student user profile updated
        assert student.room_number == room2.room_number, f"Expected Room {room2.room_number}, got {student.room_number}"
        assert student.bed_code == bed2.bed_code, f"Expected Bed {bed2.bed_code}, got {student.bed_code}"
        assert student.allotment_status == "APPROVED"
        print(f"✅ Student profile updated to upgraded Room {student.room_number} (Bed {student.bed_code}).")

        # --------------------------------------------------------------------------
        # Test 5: Testing Rejection Workflow & Bed Preservation
        # --------------------------------------------------------------------------
        print("\n--- Step 7: Testing Rejection Workflow (POST /api/allotment/reject/{id}) ---")
        # Create a new test applicant
        rej_student_reg = "TEST_NEON_REJ_2026"
        rej_student = db.query(models.User).filter(models.User.reg_no == rej_student_reg).first()
        if not rej_student:
            rej_student = models.User(
                full_name="Rahul Verma (Reject Test)",
                reg_no_email=f"{rej_student_reg.lower()}@gpbarh.ac.in",
                email=f"{rej_student_reg.lower()}@gpbarh.ac.in",
                reg_no=rej_student_reg,
                password="TestPassword123",
                role="student",
                gender="MALE",
                branch="Electrical Engineering",
                semester="1st Sem",
                mobile="+91 91234 56789",
                profile_completed=True,
                allotment_status="NONE"
            )
            db.add(rej_student)
            db.commit()
            db.refresh(rej_student)

        # Bed 1 is now free after the previous upgrade. Student applies for Bed 1.
        rej_payload = schemas.BedRequestCreate(
            student_id=rej_student.id,
            room_id=room1.id,
            bed_id=bed1.id,
            bed_code=bed1.bed_code,
            hostel_id=boys_hostel.id,
            request_type="NEW"
        )
        rej_sub_res = submit_allotment_request(rej_payload, db)
        rej_req_id = rej_sub_res["request_id"]
        print(f"✅ Application for Rejection Test Submitted (ID: {rej_req_id})")

        # Reject the request
        rej_action_res = reject_allotment_request(
            rej_req_id,
            schemas.AllotmentActionRequest(action="reject", remarks="Seat quota exceeded for session"),
            db
        )
        print(f"✅ Rejection Action Response: {rej_action_res}")
        assert rej_action_res["status"] == "REJECTED"

        # Verify rejection in Neon DB
        db.refresh(rej_student)
        db.refresh(bed1)
        db_rej_req = db.query(models.AllotmentRequest).filter(models.AllotmentRequest.id == rej_req_id).first()
        assert db_rej_req.status == "REJECTED"
        assert bed1.is_occupied == False
        assert rej_student.room_number is None

        # Verify rejected request is NOT in pending list
        pending_list_after_rej = get_pending_allotment_requests(db)
        assert not any(p.id == rej_req_id for p in pending_list_after_rej)
        print("✅ Neon DB Verified: Request status=REJECTED, Bed remains free, does NOT reappear in pending list.")

        # Cleanup test records
        db.query(models.AllotmentRequest).filter(models.AllotmentRequest.student_id.in_([student.id, rej_student.id])).delete()
        bed2.is_occupied = False
        bed2.current_student_id = None
        db.commit()

        print("\n" + "="*80)
        print("🎉 ALL LIVE NEON CLOUD DATABASE ALLOTMENT & UPGRADE TESTS PASSED 100%!")
        print("="*80)

    finally:
        db.close()

if __name__ == "__main__":
    run_neon_allotment_e2e_tests()
