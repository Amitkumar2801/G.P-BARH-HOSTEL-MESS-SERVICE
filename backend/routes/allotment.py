# backend/routes/allotment.py
from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

import models
import schemas
from database import SessionLocal
from auth_service import decode_access_token

router = APIRouter(prefix="/api/allotment", tags=["Allotment Management"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def normalize_gender(gender_str: Optional[str]) -> str:
    if not gender_str:
        return "MALE"
    g = gender_str.strip().upper()
    if g in ["FEMALE", "GIRLS", "WOMEN", "GIRL"]:
        return "FEMALE"
    return "MALE"

def resolve_student_user(student_identifier, db: Session) -> Optional[models.User]:
    """Resolves student user by reg_no, email, reg_no_email, or primary key id."""
    if student_identifier is None:
        return None
    s_str = str(student_identifier).strip()
    if not s_str or s_str.lower() in ["null", "undefined", "none"]:
        return None
    
    from sqlalchemy import or_, func
    user = db.query(models.User).filter(
        func.lower(models.User.role) == "student",
        or_(
            func.lower(models.User.reg_no) == s_str.lower(),
            func.lower(models.User.reg_no_email) == s_str.lower(),
            func.lower(models.User.email) == s_str.lower()
        )
    ).first()
    if user:
        return user
        
    if s_str.isdigit():
        user = db.query(models.User).filter(
            func.lower(models.User.role) == "student",
            models.User.id == int(s_str)
        ).first()
        if user:
            return user
            
    return None

def resolve_specific_hostel_name(room_obj, user_gender=None):
    """Resolves specific hostel name based on room wing and hostel definition."""
    if not room_obj:
        if user_gender and normalize_gender(user_gender) == "FEMALE":
            return "Savitribai Phule Girls Hostel"
        return "Birsa Munda Boys Hostel"
    
    if room_obj.hostel and normalize_gender(room_obj.hostel.gender_type) == "FEMALE":
        return "Savitribai Phule Girls Hostel"
    if user_gender and normalize_gender(user_gender) == "FEMALE":
        return "Savitribai Phule Girls Hostel"

    wing_upper = str(room_obj.wing or "").upper()
    block_upper = str(getattr(room_obj, 'block_name', '') or "").upper()

    if "RAJENDRA" in wing_upper or "RIGHT" in wing_upper or "RAJENDRA" in block_upper:
        return "Dr. Rajendra Prasad Boys Hostel"
    elif "BIRSA" in wing_upper or "LEFT" in wing_upper or "BIRSA" in block_upper:
        return "Birsa Munda Boys Hostel"
    elif room_obj.hostel and room_obj.hostel.name and "Birsa Munda & Dr. Rajendra Prasad" not in room_obj.hostel.name:
        return room_obj.hostel.name
    return "Birsa Munda Boys Hostel"

def check_and_expire_allotment_requests(db: Session):
    """Auto-expires pending allotment requests that have exceeded the 24-hour review window."""
    now = datetime.utcnow()
    pending_reqs = db.query(models.AllotmentRequest).filter(models.AllotmentRequest.status == "PENDING").all()
    for req in pending_reqs:
        elapsed = (now - req.applied_at).total_seconds()
        if elapsed > 86400: # 24 hours
            req.status = "EXPIRED"
            req.remarks = "Auto-expired: 24-hour institutional review window elapsed without Warden approval. Bed released for re-selection."
            if req.bed and req.bed.current_student_id == req.student_id:
                req.bed.is_occupied = False
                req.bed.current_student_id = None
    db.commit()

# --------------------------------------------------------------------------
# 1. STUDENT ALLOTMENT / UPGRADE SUBMISSION PIPELINE (POST /api/allotment/request)
# --------------------------------------------------------------------------
@router.post("/request", status_code=status.HTTP_201_CREATED)
def submit_allotment_request(payload: schemas.BedRequestCreate, db: Session = Depends(get_db)):
    try:
        check_and_expire_allotment_requests(db)

        # 1. Resolve Student
        student = resolve_student_user(payload.student_id, db)
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student record not found! Please check your registration ID."
            )

        # 2. Resilient Room Resolution
        room = None
        if payload.room_id is not None:
            if isinstance(payload.room_id, int) or (isinstance(payload.room_id, str) and str(payload.room_id).isdigit()):
                room = db.query(models.Room).filter(models.Room.id == int(payload.room_id)).first()
            if not room and isinstance(payload.room_id, str):
                extracted_no = payload.room_id.split('_')[-1]
                room = db.query(models.Room).filter(models.Room.room_number == extracted_no).first()
        
        if not room and payload.hostel_id:
            # Fallback by hostel_id and room number if available
            room = db.query(models.Room).filter(models.Room.hostel_id == payload.hostel_id).first()

        if not room or not room.hostel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requested room or hostel block not found!"
            )

        # 3. Gender Restriction Validation
        student_gender = normalize_gender(student.gender)
        hostel_gender = normalize_gender(room.hostel.gender_type)
        if student_gender != hostel_gender:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Gender restriction: As a {student_gender} student, you can only select rooms in the {hostel_gender} Hostel!"
            )

        # 4. Resilient Bed Resolution within the Selected Room
        raw_code = str(payload.bed_code or "")
        if not raw_code and payload.bed_id:
            raw_code = str(payload.bed_id)
        
        clean_code = "A"
        raw_upper = raw_code.upper()
        if "C" in raw_upper or raw_upper.endswith("C"):
            clean_code = "C"
        elif "B" in raw_upper or raw_upper.endswith("B"):
            clean_code = "B"
        elif "A" in raw_upper or raw_upper.endswith("A"):
            clean_code = "A"

        # Search for target bed in THIS specific room
        bed = db.query(models.Bed).filter(
            models.Bed.room_id == room.id,
            models.Bed.bed_code == clean_code
        ).first()

        # If not found by bed_code, try to check if bed_id belongs to this room
        if not bed and payload.bed_id is not None:
            if isinstance(payload.bed_id, int) or (isinstance(payload.bed_id, str) and str(payload.bed_id).isdigit()):
                bed = db.query(models.Bed).filter(
                    models.Bed.id == int(payload.bed_id),
                    models.Bed.room_id == room.id
                ).first()

        # If room has no beds yet in database, create beds A, B, C for this room
        if not bed:
            existing_beds = db.query(models.Bed).filter(models.Bed.room_id == room.id).all()
            if not existing_beds:
                for code in ["A", "B", "C"]:
                    new_b = models.Bed(
                        room_id=room.id,
                        bed_code=code,
                        is_occupied=False
                    )
                    db.add(new_b)
                db.commit()
                bed = db.query(models.Bed).filter(
                    models.Bed.room_id == room.id,
                    models.Bed.bed_code == clean_code
                ).first()
            else:
                bed = existing_beds[0]

        if not bed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requested bed not found in the selected room!"
            )

        # 5. Check if target bed is occupied
        is_upgrade_req = (
            payload.request_type == "UPGRADE" or
            bool(student.room_number and student.bed_code) or
            bool(db.query(models.AllotmentRequest).filter(models.AllotmentRequest.student_id == student.id, models.AllotmentRequest.status == "APPROVED").first()) or
            bool(db.query(models.Bed).filter(models.Bed.current_student_id == student.id).first())
        )

        if bed.is_occupied and bed.current_student_id != student.id:
            if is_upgrade_req:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Target bed is already occupied. Upgrade requires a vacant bed."
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This bed is already occupied by another student!"
                )

        # 6. Check if target bed has a pending request from another student
        pending_bed_req = db.query(models.AllotmentRequest).filter(
            models.AllotmentRequest.bed_id == bed.id,
            models.AllotmentRequest.student_id != student.id,
            models.AllotmentRequest.status == "PENDING"
        ).first()
        if pending_bed_req:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This bed currently has a pending request awaiting Warden review."
            )

        # 7. Check if student already occupies this exact bed
        currently_occupied_bed = db.query(models.Bed).filter(models.Bed.current_student_id == student.id).first()
        if currently_occupied_bed and currently_occupied_bed.id == bed.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already occupy this exact bed! Please choose a different available bed to upgrade/change."
            )

        # 8. Handle UPGRADE vs NEW Allotment
        if is_upgrade_req:
            current_room_desc = f"Room {student.room_number or ''} (Bed {student.bed_code or ''})"
            existing_pending = db.query(models.AllotmentRequest).filter(
                models.AllotmentRequest.student_id == student.id,
                models.AllotmentRequest.status == "PENDING"
            ).first()

            if existing_pending:
                existing_pending.room_id = room.id
                existing_pending.bed_id = bed.id
                existing_pending.status = "PENDING"
                existing_pending.request_type = "UPGRADE"
                existing_pending.applied_at = datetime.utcnow()
                existing_pending.remarks = f"UPGRADE REQUEST: Switch from {current_room_desc} to Room {room.room_number} (Bed {bed.bed_code})"
                db.commit()
                db.refresh(existing_pending)
                return {
                    "message": f"Room upgrade request updated to Room {room.room_number} (Bed {bed.bed_code})! Current room remains valid until Warden approval. ⏳",
                    "request_id": existing_pending.id,
                    "status": "PENDING",
                    "request_type": "UPGRADE"
                }

            new_req = models.AllotmentRequest(
                student_id=student.id,
                room_id=room.id,
                bed_id=bed.id,
                status="PENDING",
                request_type="UPGRADE",
                applied_at=datetime.utcnow(),
                remarks=f"UPGRADE REQUEST: Switch from {current_room_desc} to Room {room.room_number} (Bed {bed.bed_code})"
            )
            db.add(new_req)
            db.commit()
            db.refresh(new_req)
            return {
                "message": f"Room upgrade request submitted for Room {room.room_number} (Bed {bed.bed_code})! Awaiting Warden approval. Your current room remains active. ⏳",
                "request_id": new_req.id,
                "status": "PENDING",
                "request_type": "UPGRADE"
            }

        # NEW Allotment Flow
        existing_pending = db.query(models.AllotmentRequest).filter(
            models.AllotmentRequest.student_id == student.id,
            models.AllotmentRequest.status == "PENDING"
        ).first()

        if existing_pending:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An allotment request is already active or pending for this account."
            )

        new_req = models.AllotmentRequest(
            student_id=student.id,
            room_id=room.id,
            bed_id=bed.id,
            status="PENDING",
            request_type="NEW",
            applied_at=datetime.utcnow(),
            remarks="Initial hostel bed allotment request"
        )
        db.add(new_req)
        db.commit()
        db.refresh(new_req)

        return {
            "message": f"Bed allotment request for Room {room.room_number} (Bed {bed.bed_code}) submitted successfully! Awaiting Warden approval. ⏳",
            "request_id": new_req.id,
            "status": "PENDING",
            "request_type": "NEW"
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit allotment request: {str(e)}"
        )

# --------------------------------------------------------------------------
# 2. WARDEN APPROVE (POST /api/allotment/approve/{request_id})
# --------------------------------------------------------------------------
@router.post("/approve/{request_id}")
@router.put("/approve/{request_id}")
def approve_allotment_request(
    request_id: int,
    payload: Optional[schemas.AllotmentActionRequest] = None,
    db: Session = Depends(get_db)
):
    try:
        req = db.query(models.AllotmentRequest).filter(models.AllotmentRequest.id == request_id).first()
        if not req:
            raise HTTPException(status_code=404, detail="Allotment request not found")

        is_upgrade = (req.request_type == "UPGRADE")

        # 1. Vacate old beds occupied by this student (except new bed)
        prev_beds = db.query(models.Bed).filter(
            models.Bed.current_student_id == req.student_id,
            models.Bed.id != req.bed_id
        ).all()
        for pb in prev_beds:
            pb.is_occupied = False
            pb.current_student_id = None
            if pb.room:
                prev_occ = db.query(models.Bed).filter(models.Bed.room_id == pb.room_id, models.Bed.is_occupied == True).count()
                pb.room.occupied_count = min(pb.room.capacity, prev_occ)

        # 2. Mark older approved/pending requests for this student as SUPERSEDED
        db.query(models.AllotmentRequest).filter(
            models.AllotmentRequest.student_id == req.student_id,
            models.AllotmentRequest.id != req.id,
            models.AllotmentRequest.status.in_(["APPROVED", "PENDING"])
        ).update({"status": "SUPERSEDED"}, synchronize_session=False)

        # 3. Mark current request as APPROVED
        req.status = "APPROVED"
        remarks_text = (payload.remarks if payload and payload.remarks else None)
        req.remarks = remarks_text or ("Room upgrade approved by Chief Warden." if is_upgrade else "Approved by Chief Warden.")

        # 4. Update target Bed
        bed = req.bed or db.query(models.Bed).filter(models.Bed.id == req.bed_id).first()
        if bed:
            bed.is_occupied = True
            bed.current_student_id = req.student_id

        # 5. Update Student user record in `users`
        student = req.student or db.query(models.User).filter(models.User.id == req.student_id).first()
        room = req.room or db.query(models.Room).filter(models.Room.id == req.room_id).first()
        if student and room:
            student.room_number = room.room_number
            student.bed_code = bed.bed_code if bed else "A"
            student.hostel_id = room.hostel_id
            student.hostel_block = resolve_specific_hostel_name(room, student.gender)
            student.allotment_status = "APPROVED"
            student.allotment_date = datetime.utcnow()

        # 6. Update target Room occupied count
        if room:
            active_occupied = db.query(models.Bed).filter(models.Bed.room_id == room.id, models.Bed.is_occupied == True).count()
            room.occupied_count = min(room.capacity, active_occupied)

        # 7. Persist transaction to Neon PostgreSQL
        db.commit()
        db.refresh(req)
        if student:
            db.refresh(student)

        return {
            "message": f"Approved! Bed {bed.bed_code if bed else ''} in Room {room.room_number if room else ''} {'upgraded & ' if is_upgrade else ''}allocated to {student.full_name if student else 'Student'}. All features unlocked.",
            "status": "APPROVED",
            "request_id": req.id
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve allotment request: {str(e)}"
        )

# --------------------------------------------------------------------------
# 3. WARDEN REJECT (POST /api/allotment/reject/{request_id})
# --------------------------------------------------------------------------
@router.post("/reject/{request_id}")
@router.put("/reject/{request_id}")
def reject_allotment_request(
    request_id: int,
    payload: Optional[schemas.AllotmentActionRequest] = None,
    db: Session = Depends(get_db)
):
    try:
        req = db.query(models.AllotmentRequest).filter(models.AllotmentRequest.id == request_id).first()
        if not req:
            raise HTTPException(status_code=404, detail="Allotment request not found")

        is_upgrade = (req.request_type == "UPGRADE")

        req.status = "REJECTED"
        remarks_text = (payload.remarks if payload and payload.remarks else None)
        req.remarks = remarks_text or (
            "Upgrade request rejected by Chief Warden. Existing room assignment remains retained."
            if is_upgrade
            else "Allotment request rejected by Chief Warden. You may re-apply for another available bed."
        )

        # If NOT upgrade, ensure student is not marked as having unapproved active room
        if not is_upgrade:
            student = req.student or db.query(models.User).filter(models.User.id == req.student_id).first()
            has_other_approved = db.query(models.AllotmentRequest).filter(
                models.AllotmentRequest.student_id == req.student_id,
                models.AllotmentRequest.id != req.id,
                models.AllotmentRequest.status == "APPROVED"
            ).first()

            if not has_other_approved and student:
                student.allotment_status = "REJECTED"
                student.room_number = None
                student.bed_code = None
                student.hostel_block = None

            # Free target bed if student was set on it
            bed = req.bed or db.query(models.Bed).filter(models.Bed.id == req.bed_id).first()
            if bed and bed.current_student_id == req.student_id:
                bed.is_occupied = False
                bed.current_student_id = None
                if bed.room:
                    active_occ = db.query(models.Bed).filter(models.Bed.room_id == bed.room_id, models.Bed.is_occupied == True).count()
                    bed.room.occupied_count = min(bed.room.capacity, active_occ)

        db.commit()
        db.refresh(req)

        return {
            "message": f"{'Upgrade request' if is_upgrade else 'Allotment request'} for {req.student.full_name if req.student else 'Student'} has been rejected.",
            "status": "REJECTED",
            "request_id": req.id
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject allotment request: {str(e)}"
        )

# --------------------------------------------------------------------------
# 4. PENDING ALLOTMENT REQUESTS (GET /api/allotment/pending)
# --------------------------------------------------------------------------
@router.get("/pending", response_model=List[schemas.AllotmentRequestResponse])
def get_pending_allotment_requests(db: Session = Depends(get_db)):
    check_and_expire_allotment_requests(db)
    reqs = db.query(models.AllotmentRequest).options(
        joinedload(models.AllotmentRequest.student),
        joinedload(models.AllotmentRequest.room),
        joinedload(models.AllotmentRequest.bed)
    ).filter(models.AllotmentRequest.status == "PENDING").order_by(models.AllotmentRequest.applied_at.desc()).all()

    results = []
    now = datetime.utcnow()

    for r in reqs:
        elapsed_sec = (now - r.applied_at).total_seconds() if r.applied_at else 0
        hours_left = max(0.0, round((86400 - elapsed_sec) / 3600.0, 1))

        dist_km = r.student.distance_km if r.student else 145.0
        if dist_km is None:
            dist_km = 145.0
        district_name = (r.student.home_district if r.student else None) or "Bihar"

        if dist_km >= 80.0:
            prio = f"{int(dist_km)} KM • High Priority (>80 KM)"
        elif dist_km >= 40.0:
            prio = f"{int(dist_km)} KM • Medium Priority (40-80 KM)"
        else:
            prio = f"{int(dist_km)} KM • Local Resident (<40 KM)"

        hostel_name = resolve_specific_hostel_name(r.room, normalize_gender(r.student.gender if r.student else "MALE"))

        results.append(schemas.AllotmentRequestResponse(
            id=r.id,
            student_id=r.student.id if r.student else 0,
            student_name=r.student.full_name if r.student else "Unknown Student",
            student_gender=normalize_gender(r.student.gender if r.student else "MALE"),
            student_branch=(r.student.branch if r.student else None) or "AI & ML",
            student_roll=(r.student.roll_no if r.student else None) or "N/A",
            student_reg=(r.student.reg_no if r.student else None) or (r.student.reg_no_email if r.student else "N/A"),
            student_mobile=(r.student.mobile if r.student else None) or (r.student.guardian_contact if r.student else "N/A"),
            student_photo=r.student.profile_pic if r.student else None,
            student_pincode=(r.student.pincode if r.student else None) or "804401",
            student_district=district_name,
            student_distance_km=float(dist_km),
            distance_priority=prio,
            hours_left=hours_left,
            is_expired=(elapsed_sec > 86400),
            room_id=r.room.id if r.room else 0,
            room_number=r.room.room_number if r.room else "N/A",
            floor_number=r.room.floor_number if r.room else 0,
            wing=r.room.wing if r.room else "LEFT",
            hostel_name=hostel_name,
            bed_id=r.bed.id if r.bed else 0,
            bed_code=r.bed.bed_code if r.bed else "A",
            current_room_number=r.student.room_number if r.student else None,
            current_bed_code=r.student.bed_code if r.student else None,
            request_type=r.request_type or ("UPGRADE" if (r.student and r.student.room_number) else "NEW"),
            status=r.status,
            applied_at=r.applied_at or datetime.utcnow(),
            remarks=r.remarks
        ))
    return results

# --------------------------------------------------------------------------
# 5. STUDENT ALLOTMENT STATUS (GET /api/allotment/status/{student_id} & /my-status)
# --------------------------------------------------------------------------
@router.get("/status/{student_id}")
@router.get("/my-status")
def get_student_status(
    student_id: Optional[str] = None,
    student: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    check_and_expire_allotment_requests(db)

    target_id = student or student_id
    if (not target_id or target_id.lower() in ["null", "undefined", "none", "me"]) and authorization and "Bearer " in authorization:
        token = authorization.replace("Bearer ", "").strip()
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            target_id = str(payload["sub"])

    if not target_id:
        return {"has_request": False, "status": "NONE", "fee_unlocked": False, "can_reapply": True}

    user = resolve_student_user(str(target_id), db)
    if not user:
        return {"has_request": False, "status": "NONE", "fee_unlocked": False, "can_reapply": True}

    student_gender = user.gender

    approved_req = db.query(models.AllotmentRequest).filter(
        models.AllotmentRequest.student_id == user.id,
        models.AllotmentRequest.status == "APPROVED"
    ).order_by(models.AllotmentRequest.applied_at.desc()).first()

    pending_req = db.query(models.AllotmentRequest).filter(
        models.AllotmentRequest.student_id == user.id,
        models.AllotmentRequest.status == "PENDING"
    ).order_by(models.AllotmentRequest.applied_at.desc()).first()

    occupied_bed = db.query(models.Bed).filter(models.Bed.current_student_id == user.id).first()

    # Case 1: Approved + Pending Upgrade
    if (approved_req or occupied_bed) and pending_req:
        active_room = occupied_bed.room if occupied_bed else (approved_req.room if approved_req else None)
        active_bed = occupied_bed if occupied_bed else (approved_req.bed if approved_req else None)
        active_hostel = resolve_specific_hostel_name(active_room, student_gender)
        
        now = datetime.utcnow()
        elapsed_sec = (now - pending_req.applied_at).total_seconds() if pending_req.applied_at else 0
        upgrade_hours_left = max(0.0, round((86400 - elapsed_sec) / 3600.0, 1))

        return {
            "has_request": True,
            "request_id": approved_req.id if approved_req else 0,
            "status": "APPROVED",
            "room_number": active_room.room_number if active_room else (user.room_number or ""),
            "floor_number": active_room.floor_number if active_room else 0,
            "wing": active_room.wing if active_room else (user.hostel_block or ""),
            "bed_code": active_bed.bed_code if active_bed else (user.bed_code or "A"),
            "hostel_name": active_hostel,
            "block_name": active_hostel,
            "applied_at": approved_req.applied_at if approved_req else None,
            "remarks": approved_req.remarks if approved_req else "Allotment Approved",
            "fee_unlocked": True,
            "can_reapply": False,
            "has_pending_upgrade": True,
            "upgrade_request_id": pending_req.id,
            "upgrade_room_number": pending_req.room.room_number if pending_req.room else "",
            "upgrade_floor_number": pending_req.room.floor_number if pending_req.room else 0,
            "upgrade_bed_code": pending_req.bed.bed_code if pending_req.bed else "",
            "upgrade_hostel_name": resolve_specific_hostel_name(pending_req.room, student_gender),
            "upgrade_hours_left": upgrade_hours_left,
            "upgrade_applied_at": pending_req.applied_at
        }

    # Case 2: Only Approved
    if approved_req or occupied_bed:
        active_room = occupied_bed.room if occupied_bed else (approved_req.room if approved_req else None)
        active_bed = occupied_bed if occupied_bed else (approved_req.bed if approved_req else None)
        active_hostel = resolve_specific_hostel_name(active_room, student_gender)
        return {
            "has_request": True,
            "request_id": approved_req.id if approved_req else 0,
            "status": "APPROVED",
            "room_number": active_room.room_number if active_room else (user.room_number or ""),
            "floor_number": active_room.floor_number if active_room else 0,
            "wing": active_room.wing if active_room else (user.hostel_block or ""),
            "bed_code": active_bed.bed_code if active_bed else (user.bed_code or "A"),
            "hostel_name": active_hostel,
            "block_name": active_hostel,
            "applied_at": approved_req.applied_at if approved_req else None,
            "remarks": approved_req.remarks if approved_req else "Allotment Approved",
            "fee_unlocked": True,
            "can_reapply": False,
            "has_pending_upgrade": False
        }

    # Case 3: Only Pending Initial Request
    if pending_req:
        now = datetime.utcnow()
        elapsed_sec = (now - pending_req.applied_at).total_seconds() if pending_req.applied_at else 0
        hours_left = max(0.0, round((86400 - elapsed_sec) / 3600.0, 1))
        req_hostel = resolve_specific_hostel_name(pending_req.room, student_gender)
        return {
            "has_request": True,
            "request_id": pending_req.id,
            "status": "PENDING",
            "room_number": pending_req.room.room_number if pending_req.room else "",
            "floor_number": pending_req.room.floor_number if pending_req.room else 0,
            "wing": pending_req.room.wing if pending_req.room else "",
            "bed_code": pending_req.bed.bed_code if pending_req.bed else "",
            "hostel_name": req_hostel,
            "block_name": req_hostel,
            "applied_at": pending_req.applied_at,
            "remarks": pending_req.remarks,
            "fee_unlocked": False,
            "can_reapply": False,
            "hours_left": hours_left,
            "has_pending_upgrade": False
        }

    # Case 4: Rejected / Cancelled / Expired or None
    latest_req = db.query(models.AllotmentRequest).filter(
        models.AllotmentRequest.student_id == user.id
    ).order_by(models.AllotmentRequest.applied_at.desc()).first()

    if latest_req:
        req_hostel = resolve_specific_hostel_name(latest_req.room, student_gender)
        return {
            "has_request": True,
            "request_id": latest_req.id,
            "status": latest_req.status,
            "room_number": latest_req.room.room_number if latest_req.room else "",
            "floor_number": latest_req.room.floor_number if latest_req.room else 0,
            "wing": latest_req.room.wing if latest_req.room else "",
            "bed_code": latest_req.bed.bed_code if latest_req.bed else "",
            "hostel_name": req_hostel,
            "block_name": req_hostel,
            "applied_at": latest_req.applied_at,
            "remarks": latest_req.remarks,
            "fee_unlocked": False,
            "can_reapply": True,
            "has_pending_upgrade": False
        }

    return {"has_request": False, "status": "NONE", "fee_unlocked": False, "can_reapply": True}
