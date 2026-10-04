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
# 1. LIST STUDENTS BY BATCH & HOSTEL (GET /api/warden/students/by-batch)
# --------------------------------------------------------------------------
@router.get("/students/by-batch", response_model=List[schemas.BatchStudentItem])
def get_students_by_batch(
    session: str = Query("2024-2027", description="Batch session, e.g. 2024-2027 or 2024-27"),
    hostel_type: str = Query("ALL", description="ALL, BOYS, GIRLS, or specific hostel block"),
    db: Session = Depends(get_db)
):
    """
    Lists students segregated by session batch and hostel type.
    Includes active bed occupation, room numbers, and year-back status flags.
    """
    clean_session = session.strip()
    alt_session = "2024-27" if clean_session == "2024-2027" else ("2024-2027" if clean_session == "2024-27" else clean_session)

    # Filter by session matching either format (e.g. 2024-2027 or 2024-27)
    query = db.query(models.User).filter(
        models.User.role == "student",
        or_(
            models.User.semester == clean_session,
            models.User.semester == alt_session,
            models.User.semester.ilike(f"%{clean_session[:4]}%") # Matches by starting year
        )
    )

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

        results.append(schemas.BatchStudentItem(
            id=s.id,
            full_name=s.full_name or "Student",
            reg_no=s.reg_no or s.reg_no_email,
            branch=s.branch,
            session=s.semester or clean_session,
            gender=normalize_gender(s.gender),
            mobile=s.mobile,
            email=s.email or s.reg_no_email,
            room_number=room_num,
            bed_code=bed_c,
            hostel_block=h_block,
            hostel_id=s.hostel_id,
            allotment_status=s.allotment_status or "NONE",
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
# 3. BATCH CLEAR & BED VACATION (DELETE /api/warden/students/batch-clear)
# --------------------------------------------------------------------------
@router.delete("/students/batch-clear", response_model=schemas.BatchClearResponse)
def batch_clear_passout_students(
    payload: Optional[schemas.BatchClearRequest] = None,
    session_query: Optional[str] = Query(None, alias="session"),
    exclude_yb_query: bool = Query(True, alias="exclude_year_back"),
    hostel_id_query: Optional[int] = Query(None, alias="hostel_id"),
    db: Session = Depends(get_db)
):
    """
    Administrative Batch Clearance:
    - Finds all students for specified session batch.
    - Excludes students marked as Year-Back (is_year_back == True) when exclude_year_back=True.
    - Automatically vacates associated beds in `beds` table (is_occupied=False, current_student_id=None).
    - Removes passout student records in a single transactional batch.
    - Preserves all year-back students safely.
    """
    target_session = (payload.session if payload and payload.session else session_query) or "2024-2027"
    exclude_yb = payload.exclude_year_back if payload and payload.exclude_year_back is not None else exclude_yb_query
    target_hostel_id = (payload.hostel_id if payload and payload.hostel_id is not None else hostel_id_query)

    clean_sess = target_session.strip()
    alt_sess = "2024-27" if clean_sess == "2024-2027" else ("2024-2027" if clean_sess == "2024-27" else clean_sess)

    try:
        # 1. Query all students in this batch session
        base_query = db.query(models.User).filter(
            models.User.role == "student",
            or_(
                models.User.semester == clean_sess,
                models.User.semester == alt_sess,
                models.User.semester.ilike(f"%{clean_sess[:4]}%")
            )
        )

        if target_hostel_id:
            base_query = base_query.filter(models.User.hostel_id == target_hostel_id)

        all_batch_students = base_query.all()
        if not all_batch_students:
            return schemas.BatchClearResponse(
                message=f"No enrolled student records found matching batch session '{target_session}'.",
                session=target_session,
                cleared_count=0,
                beds_vacated=0,
                retained_year_back_count=0
            )

        # 2. Segregate Year-Back Students vs Eligible Passouts
        students_to_clear = []
        retained_year_back = []

        for st in all_batch_students:
            if exclude_yb and st.is_year_back:
                retained_year_back.append(st)
            else:
                students_to_clear.append(st)

        if not students_to_clear:
            return schemas.BatchClearResponse(
                message=f"No students cleared. All {len(retained_year_back)} student(s) in batch '{target_session}' are tagged as Year-Back and were safely retained.",
                session=target_session,
                cleared_count=0,
                beds_vacated=0,
                retained_year_back_count=len(retained_year_back)
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

        return schemas.BatchClearResponse(
            message=f"Batch '{target_session}' successfully cleared. {cleared_count} passout student(s) cleared, {beds_vacated_count} bed(s) vacated. {len(retained_year_back)} Year-Back student(s) preserved intact.",
            session=target_session,
            cleared_count=cleared_count,
            beds_vacated=beds_vacated_count,
            retained_year_back_count=len(retained_year_back)
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

