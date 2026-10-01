import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

import models
import schemas
from database import SessionLocal
import main
from fastapi import HTTPException

def test_direct_allotment_workflow():
    print("=== Direct Route Function Testing for Allotment & Sync ===")
    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        print(f"Total Users in DB: {len(users)}")
        for u in users:
            print(f" - User: {u.id} | {u.full_name} | {u.reg_no or u.reg_no_email} | {u.role} | Room: {u.room_number}")

        # Ensure test student exists
        student = db.query(models.User).filter(models.User.role == "student").first()
        if not student:
            print("Creating test student...")
            student = models.User(
                full_name="Amit Kumar",
                reg_no="1554424049",
                reg_no_email="1554424049",
                role="student",
                gender="MALE",
                branch="AI & ML",
                semester="4th Semester",
                mobile="9876543210"
            )
            db.add(student)
            db.commit()
            db.refresh(student)

        print(f"\nTesting with Student: {student.full_name} | Reg: {student.reg_no} | ID: {student.id}")

        # Step 1: Check pending queue endpoint
        pending = main.get_pending_allotment_requests(db=db)
        print(f"1. Pending requests count in queue: {len(pending)}")
        for p in pending:
            assert p.status == "PENDING", f"Expected PENDING, got {p.status}"
        print("   Pending queue strictly filters WHERE status = 'PENDING'.")

        # Step 2: Check student live status endpoint
        status = main.get_student_allotment_status(student_id=str(student.reg_no or student.id), db=db)
        print(f"2. Student allotment status: {status.get('status')} | Room: {status.get('room_number')} | Bed: {status.get('bed_code')}")

        # Step 3: Check auth me endpoint
        auth_data = main.get_auth_me(student_id=str(student.reg_no or student.id), db=db)
        print(f"3. Auth Me: {auth_data.get('full_name')} | Status: {auth_data.get('allotment_status')} | Room: {auth_data.get('room_number')}")

        # Step 4: Test Allotment Request Submission
        # If student is NOT approved and has no pending request, let's create one
        if status.get("status") in ["NONE", "REJECTED", "CANCELLED"]:
            # Find a room with an available bed in Boys hostel
            room = db.query(models.Room).join(models.Hostel).filter(models.Hostel.gender_type.in_(["BOYS", "MALE"])).first()
            bed = db.query(models.Bed).filter(models.Bed.room_id == room.id, models.Bed.is_occupied == False).first()
            if not bed:
                bed = db.query(models.Bed).filter(models.Bed.room_id == room.id).first()

            print(f"Submitting allotment request for Room {room.room_number}, Bed {bed.bed_code}...")
            req_res = main.request_bed(
                payload=schemas.BedRequestCreate(
                    student_id=str(student.reg_no),
                    room_id=room.id,
                    bed_id=bed.id,
                    request_type="NEW"
                ),
                db=db
            )
            print("Request response:", req_res)

            # Check that it appears in pending queue
            pending_after = main.get_pending_allotment_requests(db=db)
            matching = [p for p in pending_after if p.student_id == student.id]
            assert len(matching) > 0, "Request should be in pending queue"
            req_id = matching[0].id
            print(f"Request {req_id} found in pending queue.")

            # Test duplicate request block
            try:
                main.request_bed(
                    payload=schemas.BedRequestCreate(
                        student_id=str(student.reg_no),
                        room_id=room.id,
                        bed_id=bed.id,
                        request_type="NEW"
                    ),
                    db=db
                )
                assert False, "Should have blocked duplicate request"
            except HTTPException as e:
                assert e.status_code == 400
                print("Duplicate pending request blocked with 400:", e.detail)

            # Step 5: Warden Approves Request
            print(f"Warden approving request {req_id}...")
            action_res = main.action_allotment_request(
                request_id=req_id,
                action_data=schemas.AllotmentActionRequest(action="approve", remarks="Approved by Chief Warden"),
                db=db
            )
            print("Approval response:", action_res)

            # Verify bed is occupied
            db.refresh(bed)
            db.refresh(student)
            assert bed.is_occupied == True
            assert bed.current_student_id == student.id
            assert student.room_number == room.room_number
            assert student.bed_code == bed.bed_code
            assert student.allotment_status == "APPROVED"
            print(f"Bed is_occupied: {bed.is_occupied}, current_student_id: {bed.current_student_id}")
            print(f"Student updated: Room {student.room_number}, Bed {student.bed_code}, Status {student.allotment_status}")

            # Verify no longer in pending queue
            pending_final = main.get_pending_allotment_requests(db=db)
            assert not any(p.id == req_id for p in pending_final), "Approved request should not be in pending queue"
            print("Approved request verified removed from pending queue.")

        print("\nALL ALLOTMENT SYNC & VALIDATION TESTS PASSED PERFECTLY!")
    finally:
        db.close()

if __name__ == "__main__":
    test_direct_allotment_workflow()
