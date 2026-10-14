# backend/routes/warden.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from datetime import datetime

import models
import schemas
from database import SessionLocal

router = APIRouter(prefix="/api/warden", tags=["Warden Batch Management"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def normalize_session(sess: Optional[str]) -> str:
    """Normalize session strings like '2024-2027' and '2024-27' to standard patterns."""
    if not sess:
        return "2024-27"
    s = sess.strip()
    if s == "2024-2027":
        return "2024-27"
    if s == "2023-2026":
        return "2023-26"
    if s == "2022-2025":
        return "2022-25"
    if s == "2021-2024":
        return "2021-24"
    return s

def normalize_gender(gender_str: Optional[str]) -> str:
    if not gender_str:
        return "MALE"
    g = gender_str.strip().upper()
    if g in ["FEMALE", "GIRLS", "WOMEN", "GIRL"]:
        return "FEMALE"
    return "MALE"

# --------------------------------------------------------------------------
def get_session_variants(session_str: str) -> List[str]:
    """Generates standard variants like ['2024-27', '2024-2027'] for precise matching."""
    if not session_str or session_str.upper() == "ALL":
        return []
    clean = session_str.strip()
    variants = [clean]
    if "-" in clean:
        parts = clean.split("-")
        if len(parts) == 2:
            start, end = parts[0].strip(), parts[1].strip()
            if len(end) == 2:
                variants.append(f"{start}-20{end}")
            elif len(end) == 4 and end.startswith("20"):
                variants.append(f"{start}-{end[2:]}")
    return list(set(variants))

# --------------------------------------------------------------------------
# 1. LIST STUDENTS BY BATCH & HOSTEL (GET /api/warden/students/by-batch)
# --------------------------------------------------------------------------
@router.get("/students/by-batch", response_model=List[schemas.BatchStudentItem])
def get_students_by_batch(
    session: str = Query("2024-2027", description="Batch session, e.g. 2024-2027, 2024-27, 2024-26, or ALL"),
    hostel_type: str = Query("ALL", description="ALL, BOYS, GIRLS, or specific hostel block"),
    db: Session = Depends(get_db)
):
    """
    Lists students segregated by session batch and hostel type.
    Differentiates 3-year regular (e.g. 2024-27) vs 2-year lateral entry (e.g. 2024-26).
    Includes active bed occupation, room numbers, year-back, and fee status.
    """
    variants = get_session_variants(session)

    query = db.query(models.User).filter(models.User.role == "student")
    if variants:
        query = query.filter(models.User.semester.in_(variants))

    # Filter by hostel block or gender type
    h_type = hostel_type.strip().upper()
    if h_type in ["BOYS", "MALE"]:
        query = query.filter(models.User.gender.in_(["MALE", "BOYS", "Male", "boys"]))
    elif h_type in ["GIRLS", "FEMALE"]:
        query = query.filter(models.User.gender.in_(["FEMALE", "GIRLS", "Female", "girls"]))
    elif h_type != "ALL":
        query = query.filter(
            or_(
                models.User.hostel_block.ilike(f"%{h_type}%"),
                models.User.gender.ilike(f"%{h_type}%")
            )
        )

    students = query.order_by(models.User.reg_no.asc(), models.User.id.asc()).all()

    results = []
    for s in students:
        # Resolve real bed & room if occupied
        room_num = s.room_number
        bed_c = s.bed_code
        h_block = s.hostel_block

        if not room_num:
            occupied_bed = db.query(models.Bed).filter(models.Bed.current_student_id == s.id).first()
            if occupied_bed and occupied_bed.room:
                room_num = occupied_bed.room.room_number
                bed_c = occupied_bed.bed_code
                h_block = occupied_bed.room.wing

        # Resolve payment clearance status
        latest_pay = db.query(models.PaymentTransaction).filter(
            models.PaymentTransaction.student_id == s.id
        ).order_by(models.PaymentTransaction.id.desc()).first()

        pay_status = "UNPAID"
        if latest_pay:
            pay_status = "PAID" if latest_pay.status in ["APPROVED", "PAID"] else latest_pay.status
        elif s.allotment_status == "APPROVED":
            pay_status = "PAID"

        results.append(schemas.BatchStudentItem(
            id=s.id,
            full_name=s.full_name or "Student",
            reg_no=s.reg_no or s.reg_no_email,
            branch=s.branch,
            session=s.semester or session,
            gender=normalize_gender(s.gender),
            mobile=s.mobile,
            email=s.email or s.reg_no_email,
            room_number=room_num,
            bed_code=bed_c,
            hostel_block=h_block,
            hostel_id=s.hostel_id,
            allotment_status=s.allotment_status or "NONE",
            payment_status=pay_status,
            is_year_back=bool(s.is_year_back),
            is_archived=bool(s.is_archived)
        ))

    return results

# --------------------------------------------------------------------------
# 2. MARK STUDENT AS YEAR-BACK (POST /api/warden/students/mark-year-back)
# --------------------------------------------------------------------------
@router.post("/students/mark-year-back")
def mark_student_year_back(
    payload: schemas.MarkYearBackRequest,
    db: Session = Depends(get_db)
):
    """
    Tags specific student as is_year_back = True/False.
    Year-back students are strictly retained during batch clearance operations.
    """
    student = db.query(models.User).filter(
        models.User.id == payload.student_id,
        models.User.role == "student"
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {payload.student_id} not found."
        )

    student.is_year_back = payload.is_year_back
    student.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(student)

    tag_desc = "marked as Year-Back (safely preserved in hostel system)" if payload.is_year_back else "cleared of Year-Back status"
    return {
        "message": f"Student {student.full_name} (Reg: {student.reg_no or student.id}) {tag_desc}.",
        "student_id": student.id,
        "student_name": student.full_name,
        "is_year_back": student.is_year_back
    }

# --------------------------------------------------------------------------
# 3. INDIVIDUAL STUDENT ARCHIVAL / REMOVAL (DELETE /api/warden/students/{student_id})
# --------------------------------------------------------------------------
@router.delete("/students/{student_id}")
def delete_single_student(student_id: int, db: Session = Depends(get_db)):
    """
    Safely vacates bed and archives/removes a single student record from the database.
    """
    student = db.query(models.User).filter(
        models.User.id == student_id,
        models.User.role == "student"
    ).first()

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student record with ID {student_id} not found."
        )

    try:
        # Vacate bed if assigned
        occupied_beds = db.query(models.Bed).filter(models.Bed.current_student_id == student_id).all()
        affected_room_ids = set()
        for b in occupied_beds:
            b.is_occupied = False
            b.current_student_id = None
            if b.room_id:
                affected_room_ids.add(b.room_id)

        for r_id in affected_room_ids:
            room = db.query(models.Room).filter(models.Room.id == r_id).first()
            if room:
                active_occ = db.query(models.Bed).filter(
                    models.Bed.room_id == r_id,
                    models.Bed.is_occupied == True
                ).count()
                room.occupied_count = min(room.capacity, active_occ)

        # Clear foreign keys
        db.query(models.AllotmentRequest).filter(models.AllotmentRequest.student_id == student_id).delete(synchronize_session=False)
        db.query(models.MessAttendance).filter(models.MessAttendance.student_id == student_id).delete(synchronize_session=False)
        db.query(models.PaymentTransaction).filter(models.PaymentTransaction.student_id == student_id).delete(synchronize_session=False)
        db.query(models.Transaction).filter(models.Transaction.user_id == student_id).delete(synchronize_session=False)

        # Remove student
        st_name = student.full_name or "Student"
        db.delete(student)
        db.commit()

        return {
            "success": True,
            "message": f"Student '{st_name}' removed cleanly. Bed vacated successfully.",
            "student_id": student_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to remove student: {str(e)}")

# --------------------------------------------------------------------------
# 4. BULK DELETE SELECTED STUDENTS (POST /api/warden/students/bulk-delete)
# --------------------------------------------------------------------------
@router.post("/students/bulk-delete")
def bulk_delete_students(payload: schemas.BulkDeleteStudentsRequest, db: Session = Depends(get_db)):
    """
    Warden bulk removal of selected student IDs in a single atomic transaction.
    """
    if not payload.student_ids:
        raise HTTPException(status_code=400, detail="No student IDs provided for deletion.")

    ids = payload.student_ids
    try:
        # 1. Vacate all associated beds
        occupied_beds = db.query(models.Bed).filter(models.Bed.current_student_id.in_(ids)).all()
        affected_rooms = set()
        for b in occupied_beds:
            b.is_occupied = False
            b.current_student_id = None
            if b.room_id:
                affected_rooms.add(b.room_id)

        for r_id in affected_rooms:
            room = db.query(models.Room).filter(models.Room.id == r_id).first()
            if room:
                active_occ = db.query(models.Bed).filter(models.Bed.room_id == r_id, models.Bed.is_occupied == True).count()
                room.occupied_count = min(room.capacity, active_occ)

        # 2. Clear child rows
        db.query(models.AllotmentRequest).filter(models.AllotmentRequest.student_id.in_(ids)).delete(synchronize_session=False)
        db.query(models.MessAttendance).filter(models.MessAttendance.student_id.in_(ids)).delete(synchronize_session=False)
        db.query(models.PaymentTransaction).filter(models.PaymentTransaction.student_id.in_(ids)).delete(synchronize_session=False)
        db.query(models.Transaction).filter(models.Transaction.user_id.in_(ids)).delete(synchronize_session=False)

        # 3. Delete users
        deleted_count = db.query(models.User).filter(models.User.id.in_(ids)).delete(synchronize_session=False)
        db.commit()

        return {
            "success": True,
            "message": f"Successfully cleared {deleted_count} selected student(s) and vacated {len(occupied_beds)} bed(s).",
            "deleted_count": deleted_count,
            "beds_vacated": len(occupied_beds)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Bulk deletion failed: {str(e)}")

# --------------------------------------------------------------------------
# 5. BATCH CLEAR & BED VACATION (DELETE /api/warden/students/batch-clear)
# --------------------------------------------------------------------------
@router.delete("/students/batch-clear", response_model=schemas.BatchClearResponse)
def batch_clear_passout_students(
    payload: Optional[schemas.BatchClearRequest] = None,
    session_query: Optional[str] = Query(None, alias="session"),
    exclude_yb_query: bool = Query(True, alias="exclude_year_back"),
    require_fee_clear_query: bool = Query(False, alias="require_fee_clearance"),
    hostel_id_query: Optional[int] = Query(None, alias="hostel_id"),
    db: Session = Depends(get_db)
):
    """
    Administrative Batch Clearance:
    - Finds all students for specified session batch (exact matching to distinguish Regular vs Lateral Entry).
    - Excludes students marked as Year-Back (is_year_back == True) when exclude_year_back=True.
    - Excludes students with unpaid fees when require_fee_clearance=True.
    - Automatically vacates associated beds in `beds` table.
    - Removes passout student records in a single transactional batch.
    - Preserves all year-back students safely.
    """
    target_session = (payload.session if payload and payload.session else session_query) or "2024-2027"
    exclude_yb = payload.exclude_year_back if payload and payload.exclude_year_back is not None else exclude_yb_query
    require_fee_clear = payload.require_fee_clearance if payload and payload.require_fee_clearance is not None else require_fee_clear_query
    target_hostel_id = (payload.hostel_id if payload and payload.hostel_id is not None else hostel_id_query)

    variants = get_session_variants(target_session)

    try:
        # 1. Query all students in this batch session
        base_query = db.query(models.User).filter(
            models.User.role == "student"
        )
        if variants:
            base_query = base_query.filter(models.User.semester.in_(variants))

        if target_hostel_id:
            base_query = base_query.filter(models.User.hostel_id == target_hostel_id)

        all_batch_students = base_query.all()
        if not all_batch_students:
            return schemas.BatchClearResponse(
                message=f"No enrolled student records found matching batch session '{target_session}'.",
                session=target_session,
                cleared_count=0,
                beds_vacated=0,
                retained_year_back_count=0,
                retained_dues_count=0
            )

        # 2. Segregate Year-Back Students & Dues Pending vs Eligible Passouts
        students_to_clear = []
        retained_year_back = []
        retained_dues = []

        for st in all_batch_students:
            if exclude_yb and st.is_year_back:
                retained_year_back.append(st)
                continue

            if require_fee_clear:
                latest_pay = db.query(models.PaymentTransaction).filter(
                    models.PaymentTransaction.student_id == st.id
                ).order_by(models.PaymentTransaction.id.desc()).first()
                is_cleared = (latest_pay and latest_pay.status in ["APPROVED", "PAID"]) or (st.allotment_status == "APPROVED")
                if not is_cleared:
                    retained_dues.append(st)
                    continue

            students_to_clear.append(st)

        if not students_to_clear:
            return schemas.BatchClearResponse(
                message=f"No students cleared. {len(retained_year_back)} Year-Back student(s) and {len(retained_dues)} Dues-Pending student(s) in batch '{target_session}' were safely retained.",
                session=target_session,
                cleared_count=0,
                beds_vacated=0,
                retained_year_back_count=len(retained_year_back),
                retained_dues_count=len(retained_dues)
            )

        clear_ids = [s.id for s in students_to_clear]

        # 3. Vacate all associated beds in `beds` table
        occupied_beds = db.query(models.Bed).filter(
            models.Bed.current_student_id.in_(clear_ids)
        ).all()

        beds_vacated_count = len(occupied_beds)
        affected_room_ids = set()

        for bed in occupied_beds:
            bed.is_occupied = False
            bed.current_student_id = None
            if bed.room_id:
                affected_room_ids.add(bed.room_id)

        # Recalculate room occupancy counts for affected rooms
        for r_id in affected_room_ids:
            room = db.query(models.Room).filter(models.Room.id == r_id).first()
            if room:
                active_occ = db.query(models.Bed).filter(
                    models.Bed.room_id == r_id,
                    models.Bed.is_occupied == True
                ).count()
                room.occupied_count = min(room.capacity, active_occ)

        # 4. Safely clear child table dependencies to satisfy PostgreSQL foreign keys
        db.query(models.AllotmentRequest).filter(
            models.AllotmentRequest.student_id.in_(clear_ids)
        ).delete(synchronize_session=False)

        db.query(models.MessAttendance).filter(
            models.MessAttendance.student_id.in_(clear_ids)
        ).delete(synchronize_session=False)

        db.query(models.PaymentTransaction).filter(
            models.PaymentTransaction.student_id.in_(clear_ids)
        ).delete(synchronize_session=False)

        db.query(models.Transaction).filter(
            models.Transaction.user_id.in_(clear_ids)
        ).delete(synchronize_session=False)

        # 5. Delete or archive passout students from `users`
        cleared_count = db.query(models.User).filter(
            models.User.id.in_(clear_ids)
        ).delete(synchronize_session=False)

        # 6. Commit single atomic batch transaction to Neon PostgreSQL
        db.commit()

        msg = f"Batch '{target_session}' successfully cleared. {cleared_count} passout student(s) cleared, {beds_vacated_count} bed(s) vacated."
        if retained_year_back:
            msg += f" {len(retained_year_back)} Year-Back student(s) preserved."
        if retained_dues:
            msg += f" {len(retained_dues)} student(s) with pending dues kept safe."

        return schemas.BatchClearResponse(
            message=msg,
            session=target_session,
            cleared_count=cleared_count,
            beds_vacated=beds_vacated_count,
            retained_year_back_count=len(retained_year_back),
            retained_dues_count=len(retained_dues)
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch clearance failed: {str(e)}"
        )


# --------------------------------------------------------------------------
# 4. CHIEF WARDEN UNIFIED ALLOTMENT QUEUE & ACTIONS
# --------------------------------------------------------------------------
@router.get("/allotment/pending", response_model=List[schemas.AllotmentRequestResponse])
@router.get("/allotments/pending", response_model=List[schemas.AllotmentRequestResponse])
def get_warden_pending_queue(db: Session = Depends(get_db)):
    """
    Unified Chief Warden pending requests queue across ALL wings:
    - Birsa Munda Boys Hostel
    - Dr. Rajendra Prasad Boys Hostel
    - Savitribai Phule Girls Hostel
    Returns both male and female pending applicants with rich details.
    """
    from routes.allotment import get_pending_allotment_requests
    return get_pending_allotment_requests(db=db)

@router.post("/allotments/{request_id}/action")
@router.put("/allotments/{request_id}/action")
def handle_warden_allotment_action(
    request_id: int,
    payload: Optional[schemas.AllotmentActionRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Chief Warden Universal Allotment Approval / Rejection action.
    Persists updates live to Neon PostgreSQL.
    """
    from routes.allotment import approve_allotment_request, reject_allotment_request
    action = (payload.action if payload and payload.action else "approve").lower()
    if action == "approve":
        return approve_allotment_request(request_id, payload, db=db)
    else:
        return reject_allotment_request(request_id, payload, db=db)

