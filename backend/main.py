# backend/main.py
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

import models
import schemas
from database import engine, SessionLocal

# ---------------------------------------------------------
# DATABASE INITIALIZATION & MIGRATION HELPER
# ---------------------------------------------------------
models.Base.metadata.create_all(bind=engine)

def run_sqlite_migrations():
    """Ensure newly added columns exist in sqlite table without dropping data."""
    db = SessionLocal()
    try:
        # Check and add columns to users table if missing
        cursor = db.connection()
        columns_to_add = [
            ("users", "gender", "VARCHAR DEFAULT 'MALE'"),
            ("users", "branch", "VARCHAR"),
            ("users", "semester", "VARCHAR"),
            ("users", "roll_no", "VARCHAR"),
            ("users", "reg_no", "VARCHAR"),
            ("users", "mobile", "VARCHAR"),
            ("users", "guardian_contact", "VARCHAR"),
            ("users", "guardian_mobile", "VARCHAR"),
            ("users", "address", "VARCHAR"),
            ("users", "blood_group", "VARCHAR"),
            ("users", "profile_pic", "TEXT"),
            ("users", "profile_completed", "BOOLEAN DEFAULT 0"),
            ("beds", "current_student_id", "INTEGER"),
            ("allotment_requests", "remarks", "VARCHAR")
        ]
        for table, col, col_type in columns_to_add:
            try:
                db.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type};"))
                db.commit()
            except Exception:
                db.rollback()
    except Exception as e:
        print("Migration note:", e)
    finally:
        db.close()

run_sqlite_migrations()

def seed_default_users():
    """Seed or update default test users (including warden and demo student accounts)"""
    db = SessionLocal()
    try:
        warden = db.query(models.User).filter(models.User.reg_no_email == "amitkumar.arwal28@gmail.com").first()
        if not warden:
            new_warden = models.User(
                full_name="Amit Kumar Sharma (Chief Warden)",
                reg_no_email="amitkumar.arwal28@gmail.com",
                password="CHAMGADAR",
                role="warden",
                gender="MALE",
                profile_completed=True
            )
            db.add(new_warden)
            db.commit()
        else:
            warden.password = "CHAMGADAR"
            warden.role = "warden"
            warden.gender = "MALE"
            db.commit()

        # 1. Seed Demo Male Student: AMIT SHARMA (Roll 49, AIML, O+)
        student_male = db.query(models.User).filter(
            (models.User.reg_no_email == "1554424049") | (models.User.reg_no == "1554424049")
        ).first()
        if not student_male:
            student_male = models.User(
                full_name="AMIT SHARMA",
                reg_no_email="1554424049",
                password="password123",
                role="student",
                gender="MALE",
                roll_no="49",
                reg_no="1554424049",
                branch="Artificial Intelligence & Machine Learning",
                semester="2024-27",
                mobile="+91 88731 42022",
                guardian_contact="9876543211",
                guardian_mobile="9876543211",
                address="Vill - Agwanpur, P.O - Agwanpur, Dist - Patna, State - Bihar, PIN - 803213",
                blood_group="O+",
                profile_completed=True
            )
            db.add(student_male)
            db.commit()
        else:
            student_male.full_name = "AMIT SHARMA"
            student_male.roll_no = "49"
            student_male.gender = "MALE"
            student_male.blood_group = "O+"
            student_male.branch = "Artificial Intelligence & Machine Learning"
            student_male.semester = "2024-27"
            student_male.mobile = ""
            student_male.address = ""
            student_male.password = "password123"
            db.commit()

        # 2. Seed Demo Female Student: SANA SHARMA (Roll 00, AIML, O+)
        student_female = db.query(models.User).filter(
            (models.User.reg_no_email == "1554424000") | (models.User.reg_no == "1554424000") | (models.User.reg_no_email == "sanasharma31@gmail.com")
        ).first()
        if not student_female:
            student_female = models.User(
                full_name="SANA SHARMA",
                reg_no_email="1554424000",
                password="SANAMIT",
                role="student",
                gender="FEMALE",
                roll_no="00",
                reg_no="1554424000",
                branch="Artificial Intelligence & Machine Learning",
                semester="2024-27",
                mobile="",
                guardian_contact="",
                guardian_mobile="",
                address="",
                blood_group="O+",
                profile_completed=True
            )
            db.add(student_female)
            db.commit()
        else:
            student_female.full_name = "SANA SHARMA"
            student_female.roll_no = "00"
            student_female.gender = "FEMALE"
            student_female.blood_group = "O+"
            student_female.branch = "Artificial Intelligence & Machine Learning"
            student_female.semester = "2024-27"
            student_female.mobile = ""
            student_female.address = ""
            student_female.password = "SANAMIT"
            db.commit()

        # Additional Sample Students for rich Directory
        extra_students = [
            ("RAHUL VERMA", "1554424052", "52", "MALE", "Civil Engineering (Construction Technology)", "+91 98351 99210", "B+"),
            ("POOJA KUMARI", "1554424088", "14", "FEMALE", "Electronics (Robotics)", "+91 76543 21980", "A+"),
            ("PRIYANSHU RAJ", "1554424018", "18", "MALE", "Mechanical Engineering (CAD/CAM)", "+91 99345 88231", "AB+"),
            ("NEHA SINGH", "1554424031", "31", "FEMALE", "Artificial Intelligence & Machine Learning", "+91 82103 44590", "O+"),
            ("VIKRAM ADITYA", "1554424065", "65", "MALE", "Electronics (Robotics)", "+91 94721 00342", "O-"),
            ("ANANYA ROY", "1554424095", "22", "FEMALE", "Civil Engineering (Construction Technology)", "+91 91552 87634", "B-")
        ]
        for name, reg, roll, gen, br, mob, bg in extra_students:
            exists = db.query(models.User).filter(models.User.reg_no_email == reg).first()
            if not exists:
                new_s = models.User(
                    full_name=name,
                    reg_no_email=reg,
                    reg_no=reg,
                    roll_no=roll,
                    password="password123",
                    role="student",
                    gender=gen,
                    branch=br,
                    semester="2024-27",
                    mobile=mob,
                    blood_group=bg,
                    profile_completed=True
                )
                db.add(new_s)
                db.commit()
    except Exception as e:
        print("Seeding users error:", e)
    finally:
        db.close()

seed_default_users()

# ---------------------------------------------------------
# FASTAPI APP INSTANCE SETUP
# ---------------------------------------------------------
app = FastAPI(
    title="GP Barh Hostel Management API - Pro Version",
    description="Backend REST API for the Hostel and Mess Management System with Visual Seat Allocation Grid.",
    version="2.0.0"
)

# ---------------------------------------------------------
# CORS CONFIGURATION
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# DEPENDENCIES
# ---------------------------------------------------------
def get_db() -> Session:
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

# ---------------------------------------------------------
# AUTHENTICATION ENDPOINTS
# ---------------------------------------------------------
@app.get("/", tags=["Health Check"])
def read_root():
    return {
        "message": "Welcome to GP Barh Hostel API! 🚀",
        "status": "Database Connected & Server Running!",
        "version": "2.0.0"
    }

@app.post("/signup", status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        models.User.reg_no_email == user.reg_no_email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this Registration No. / Email already exists."
        )

    norm_gender = normalize_gender(user.gender)

    new_user = models.User(
        full_name=user.full_name,
        reg_no_email=user.reg_no_email,
        password=user.password,
        role=user.role.lower(),
        gender=norm_gender,
        reg_no=user.reg_no or user.reg_no_email,
        branch=user.branch if user.branch else None,
        semester=user.session or user.semester or "2024-27",
        profile_completed=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Account successfully created!",
        "user_id": new_user.id,
        "gender": new_user.gender
    }

@app.post("/login", tags=["Authentication"])
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.reg_no_email == user.reg_no_email
    ).first()

    if not db_user or db_user.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Registration No./Email or Password! Please verify."
        )

    return {
        "message": "Login successful!",
        "user": {
            "id": db_user.id,
            "full_name": db_user.full_name,
            "reg_no_email": db_user.reg_no_email,
            "role": db_user.role,
            "gender": normalize_gender(db_user.gender),
            "branch": db_user.branch,
            "semester": db_user.semester or "2024-27",
            "session": db_user.semester or "2024-27",
            "roll_no": db_user.roll_no,
            "reg_no": db_user.reg_no or db_user.reg_no_email,
            "mobile": db_user.mobile,
            "guardian_mobile": db_user.guardian_mobile or db_user.guardian_contact,
            "address": db_user.address,
            "blood_group": db_user.blood_group,
            "profile_pic": db_user.profile_pic,
            "profile_completed": db_user.profile_completed or False
        }
    }

# ---------------------------------------------------------
# PROFILE ENDPOINTS
# ---------------------------------------------------------
@app.get("/profile/{user_id}", response_model=schemas.UserProfileResponse, tags=["Profile"])
@app.get("/api/student/profile/{user_id}", response_model=schemas.UserProfileResponse, tags=["Profile"])
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.gender = normalize_gender(user.gender)
    if not user.semester:
        user.semester = "2024-27"
    user.session = user.semester
    return user

@app.put("/profile", response_model=schemas.UserProfileResponse, tags=["Profile"])
@app.put("/api/student/profile", response_model=schemas.UserProfileResponse, tags=["Profile"])
def update_user_profile(profile: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == profile.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.full_name = profile.full_name
    user.gender = normalize_gender(profile.gender or user.gender)
    user.branch = profile.branch
    user.semester = profile.session or profile.semester or user.semester or "2024-27"
    user.roll_no = profile.roll_no
    user.reg_no = profile.reg_no or user.reg_no_email
    user.mobile = profile.mobile
    user.guardian_contact = profile.guardian_contact or profile.guardian_mobile
    user.guardian_mobile = profile.guardian_mobile or profile.guardian_contact
    user.address = profile.address
    user.blood_group = profile.blood_group
    if profile.profile_pic:
        user.profile_pic = profile.profile_pic
    user.profile_completed = True

    db.commit()
    db.refresh(user)
    user.session = user.semester
    return user

# ---------------------------------------------------------
# HOSTEL LAYOUT & ALLOCATION SEEDING / ENDPOINTS
# ---------------------------------------------------------
def seed_hostel_data(db: Session):
    """Seed Boys (H-Shape) and Girls (Linear) Hostels, Rooms, and 3-Bed Anatomy."""
    # 1. BOYS HOSTEL (H-SHAPE)
    boys_hostel = db.query(models.Hostel).filter(models.Hostel.gender_type.in_(["BOYS", "MALE"])).first()
    if not boys_hostel:
        boys_hostel = models.Hostel(name="Boys Hostel (Birsa Munda & Dr. Rajendra Prasad Blocks)", gender_type="MALE", total_floors=3, shape_type="H_SHAPE")
        db.add(boys_hostel)
        db.commit()
        db.refresh(boys_hostel)

        # 3 Floors: 0 (Ground), 1 (1st), 2 (2nd)
        for floor in range(3):
            floor_prefix = (floor + 1) * 100
            # Left Wing (Birsa Munda Block) Rooms (e.g. 101, 102, 103)
            for r_num in range(1, 4):
                room = models.Room(hostel_id=boys_hostel.id, room_number=str(floor_prefix + r_num), floor_number=floor, wing="LEFT", capacity=3, occupied_count=0)
                db.add(room)
                db.commit()
                db.refresh(room)
                for bed_code in ['A', 'B', 'C']:
                    db.add(models.Bed(room_id=room.id, bed_code=bed_code, is_occupied=False))
            # Central Wing / Connector Rooms (e.g. 104, 105, 106)
            for r_num in range(4, 7):
                room = models.Room(hostel_id=boys_hostel.id, room_number=str(floor_prefix + r_num), floor_number=floor, wing="CENTER", capacity=3, occupied_count=0)
                db.add(room)
                db.commit()
                db.refresh(room)
                for bed_code in ['A', 'B', 'C']:
                    db.add(models.Bed(room_id=room.id, bed_code=bed_code, is_occupied=False))
            # Right Wing (Dr. Rajendra Prasad Block) Rooms (e.g. 107, 108, 109)
            for r_num in range(7, 10):
                room = models.Room(hostel_id=boys_hostel.id, room_number=str(floor_prefix + r_num), floor_number=floor, wing="RIGHT", capacity=3, occupied_count=0)
                db.add(room)
                db.commit()
                db.refresh(room)
                for bed_code in ['A', 'B', 'C']:
                    db.add(models.Bed(room_id=room.id, bed_code=bed_code, is_occupied=False))
        db.commit()
    else:
        boys_hostel.name = "Boys Hostel (Birsa Munda & Dr. Rajendra Prasad Blocks)"
        if boys_hostel.gender_type != "MALE":
            boys_hostel.gender_type = "MALE"
        db.commit()

    # 2. GIRLS HOSTEL (SAVITRIBAI PHULE GIRLS HOSTEL - LINEAR)
    girls_hostel = db.query(models.Hostel).filter(models.Hostel.gender_type.in_(["GIRLS", "FEMALE"])).first()
    if not girls_hostel:
        girls_hostel = models.Hostel(name="Savitribai Phule Girls Hostel", gender_type="FEMALE", total_floors=3, shape_type="LINEAR")
        db.add(girls_hostel)
        db.commit()
        db.refresh(girls_hostel)

        # 3 Floors: 0 (Ground), 1 (1st), 2 (2nd) - Linear corridor 8 rooms each
        for floor in range(3):
            floor_prefix = (floor + 1) * 100
            for r_num in range(1, 9):
                room = models.Room(hostel_id=girls_hostel.id, room_number=str(floor_prefix + r_num), floor_number=floor, wing="MAIN", capacity=3, occupied_count=0)
                db.add(room)
                db.commit()
                db.refresh(room)
                for bed_code in ['A', 'B', 'C']:
                    db.add(models.Bed(room_id=room.id, bed_code=bed_code, is_occupied=False))
        db.commit()
    else:
        girls_hostel.name = "Savitribai Phule Girls Hostel"
        if girls_hostel.gender_type != "FEMALE":
            girls_hostel.gender_type = "FEMALE"
        db.commit()

@app.get("/hostel-layout", response_model=schemas.HostelLayoutSchema, tags=["Hostel Allocation"])
@app.get("/api/hostels/grid", response_model=schemas.HostelLayoutSchema, tags=["Hostel Allocation"])
def get_hostel_layout(gender: str = Query("MALE"), student_id: Optional[int] = None, db: Session = Depends(get_db)):
    seed_hostel_data(db)
    norm_gender = normalize_gender(gender)
    
    hostel = db.query(models.Hostel).filter(models.Hostel.gender_type.in_([norm_gender, "BOYS" if norm_gender == "MALE" else "GIRLS"])).first()
    if not hostel:
        raise HTTPException(status_code=404, detail=f"Hostel for gender {gender} not found")

    # Fetch active pending requests for student
    my_pending_bed_ids = set()
    if student_id:
        pending_reqs = db.query(models.AllotmentRequest).filter(
            models.AllotmentRequest.student_id == student_id,
            models.AllotmentRequest.status == "PENDING"
        ).all()
        my_pending_bed_ids = {r.bed_id for r in pending_reqs}

    rooms_list = []
    for room in hostel.rooms:
        bed_schemas = []
        occupied_cnt = 0
        for bed in room.beds:
            if bed.is_occupied:
                occupied_cnt += 1
            
            student_name = None
            if bed.current_student:
                student_name = bed.current_student.full_name

            bed_schemas.append(schemas.BedSchema(
                id=bed.id,
                bed_code=bed.bed_code,
                is_occupied=bed.is_occupied,
                current_student_id=bed.current_student_id,
                current_student_name=student_name,
                pending_request_by_me=(bed.id in my_pending_bed_ids)
            ))

        # Color-coded status: GREEN (0), AMBER (1 or 2), RED (3)
        if occupied_cnt == 0:
            status_color = "GREEN"
        elif occupied_cnt < room.capacity:
            status_color = "AMBER"
        else:
            status_color = "RED"

        rooms_list.append(schemas.RoomSchema(
            id=room.id,
            room_number=room.room_number,
            floor_number=room.floor_number,
            wing=room.wing,
            capacity=room.capacity,
            occupied_count=occupied_cnt,
            status_color=status_color,
            beds=bed_schemas
        ))

    return schemas.HostelLayoutSchema(
        id=hostel.id,
        name=hostel.name,
        gender_type=norm_gender,
        total_floors=hostel.total_floors,
        shape_type=hostel.shape_type,
        rooms=rooms_list
    )

@app.post("/request-bed", tags=["Hostel Allocation"])
@app.post("/api/hostels/request-bed", tags=["Hostel Allocation"])
def request_bed(payload: schemas.BedRequestCreate, db: Session = Depends(get_db)):
    student = db.query(models.User).filter(models.User.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found!")
    
    if not student.profile_completed:
        raise HTTPException(status_code=400, detail="Please complete your student profile details first before booking a seat.")

    # Check if student already has an approved or pending request
    existing_approved = db.query(models.AllotmentRequest).filter(
        models.AllotmentRequest.student_id == payload.student_id,
        models.AllotmentRequest.status.in_(["PENDING", "APPROVED"])
    ).first()

    if existing_approved:
        if existing_approved.status == "APPROVED":
            raise HTTPException(status_code=400, detail="You already have an approved room allotment! Check your Payments & Passbook.")
        else:
            raise HTTPException(status_code=400, detail="You already have a pending allotment request awaiting Warden approval.")

    bed = db.query(models.Bed).filter(models.Bed.id == payload.bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Requested bed not found!")
    if bed.is_occupied:
        raise HTTPException(status_code=400, detail="This bed is already occupied by another student!")

    # Check if bed has a pending request from another student
    pending_bed_req = db.query(models.AllotmentRequest).filter(
        models.AllotmentRequest.bed_id == payload.bed_id,
        models.AllotmentRequest.status == "PENDING"
    ).first()
    if pending_bed_req:
        raise HTTPException(status_code=400, detail="This bed currently has a pending request awaiting Warden review.")

    new_req = models.AllotmentRequest(
        student_id=payload.student_id,
        room_id=payload.room_id,
        bed_id=payload.bed_id,
        status="PENDING",
        applied_at=datetime.utcnow()
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    return {
        "message": "Bed allotment request submitted successfully! Awaiting Warden approval. ⏳",
        "request_id": new_req.id,
        "status": "PENDING_APPROVAL"
    }

# ---------------------------------------------------------
# WARDEN WORKFLOW & ANALYTICS ENDPOINTS
# ---------------------------------------------------------
@app.get("/warden/pending-requests", response_model=List[schemas.AllotmentRequestResponse], tags=["Warden Workflow"])
@app.get("/api/warden/allotments/pending", response_model=List[schemas.AllotmentRequestResponse], tags=["Warden Workflow"])
def get_pending_allotment_requests(db: Session = Depends(get_db)):
    reqs = db.query(models.AllotmentRequest).filter(models.AllotmentRequest.status == "PENDING").order_by(models.AllotmentRequest.applied_at.desc()).all()
    results = []
    for r in reqs:
        results.append(schemas.AllotmentRequestResponse(
            id=r.id,
            student_id=r.student.id,
            student_name=r.student.full_name,
            student_gender=normalize_gender(r.student.gender),
            student_branch=r.student.branch or "AI & ML",
            student_roll=r.student.roll_no or "N/A",
            student_reg=r.student.reg_no or r.student.reg_no_email,
            student_mobile=r.student.mobile or r.student.guardian_contact or "N/A",
            student_photo=r.student.profile_pic,
            room_id=r.room.id,
            room_number=r.room.room_number,
            floor_number=r.room.floor_number,
            wing=r.room.wing,
            bed_id=r.bed.id,
            bed_code=r.bed.bed_code,
            status=r.status,
            applied_at=r.applied_at,
            remarks=r.remarks
        ))
    return results

@app.post("/warden/allotment-action/{request_id}", tags=["Warden Workflow"])
@app.post("/api/warden/allotments/{request_id}/action", tags=["Warden Workflow"])
def action_allotment_request(request_id: int, action_data: schemas.AllotmentActionRequest, db: Session = Depends(get_db)):
    req = db.query(models.AllotmentRequest).filter(models.AllotmentRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Allotment request not found")

    action = action_data.action.lower()
    if action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve' or 'reject'")

    if action == "approve":
        req.status = "APPROVED"
        req.remarks = action_data.remarks or "Approved by Warden"
        
        # Mark Bed as occupied
        bed = req.bed
        bed.is_occupied = True
        bed.current_student_id = req.student_id
        
        # Update Room occupied count
        room = req.room
        active_occupied = db.query(models.Bed).filter(models.Bed.room_id == room.id, models.Bed.is_occupied == True).count()
        room.occupied_count = min(room.capacity, active_occupied)

        db.commit()
        return {
            "message": f"Approved! Bed {bed.bed_code} in Room {room.room_number} allocated to {req.student.full_name}. Student fee payments unlocked.",
            "status": "APPROVED"
        }
    else:
        req.status = "REJECTED"
        req.remarks = action_data.remarks or "Rejected by Warden"
        
        # Ensure bed is freed if it was occupied
        bed = req.bed
        if bed and bed.current_student_id == req.student_id:
            bed.is_occupied = False
            bed.current_student_id = None
        
        db.commit()
        return {
            "message": f"Allotment request for {req.student.full_name} has been rejected.",
            "status": "REJECTED"
        }

@app.get("/student/allotment-status/{student_id}", tags=["Hostel Allocation"])
@app.get("/api/student/allotment-status/{student_id}", tags=["Hostel Allocation"])
def get_student_allotment_status(student_id: int, db: Session = Depends(get_db)):
    req = db.query(models.AllotmentRequest).filter(
        models.AllotmentRequest.student_id == student_id
    ).order_by(models.AllotmentRequest.applied_at.desc()).first()

    if not req:
        return {"has_request": False, "status": "NONE", "fee_unlocked": False}

    return {
        "has_request": True,
        "request_id": req.id,
        "status": req.status,
        "room_number": req.room.room_number,
        "floor_number": req.room.floor_number,
        "wing": req.room.wing,
        "bed_code": req.bed.bed_code,
        "hostel_name": req.room.hostel.name,
        "applied_at": req.applied_at,
        "remarks": req.remarks,
        "fee_unlocked": (req.status == "APPROVED")
    }

@app.get("/api/warden/analytics", response_model=schemas.WardenAnalyticsResponse, tags=["Warden Workflow"])
def get_warden_analytics(db: Session = Depends(get_db)):
    seed_hostel_data(db)
    
    # Boys hostel
    boys_hostel = db.query(models.Hostel).filter(models.Hostel.gender_type.in_(["BOYS", "MALE"])).first()
    boys_total = sum(r.capacity for r in boys_hostel.rooms) if boys_hostel else 81
    boys_occupied = db.query(models.Bed).join(models.Room).filter(models.Room.hostel_id == (boys_hostel.id if boys_hostel else 0), models.Bed.is_occupied == True).count()
    boys_pct = round((boys_occupied / boys_total) * 100, 1) if boys_total > 0 else 0.0

    # Girls hostel
    girls_hostel = db.query(models.Hostel).filter(models.Hostel.gender_type.in_(["GIRLS", "FEMALE"])).first()
    girls_total = sum(r.capacity for r in girls_hostel.rooms) if girls_hostel else 72
    girls_occupied = db.query(models.Bed).join(models.Room).filter(models.Room.hostel_id == (girls_hostel.id if girls_hostel else 0), models.Bed.is_occupied == True).count()
    girls_pct = round((girls_occupied / girls_total) * 100, 1) if girls_total > 0 else 0.0

    total_capacity = boys_total + girls_total
    total_occupied = boys_occupied + girls_occupied
    overall_pct = round((total_occupied / total_capacity) * 100, 1) if total_capacity > 0 else 0.0

    pending_count = db.query(models.AllotmentRequest).filter(models.AllotmentRequest.status == "PENDING").count()

    # Total estimated pending dues
    total_dues = total_occupied * 4500.0 # Standard semester hostel + mess dues per student

    return schemas.WardenAnalyticsResponse(
        total_capacity=total_capacity,
        total_occupied=total_occupied,
        occupancy_pct=overall_pct,
        boys_total=boys_total,
        boys_occupied=boys_occupied,
        boys_occupancy_pct=boys_pct,
        girls_total=girls_total,
        girls_occupied=girls_occupied,
        girls_occupancy_pct=girls_pct,
        pending_requests_count=pending_count,
        total_pending_dues=total_dues
    )

@app.get("/api/warden/students", response_model=List[schemas.StudentDirectoryItem], tags=["Warden Workflow"])
def get_warden_students(db: Session = Depends(get_db)):
    students = db.query(models.User).filter(models.User.role == "student").all()
    results = []
    for s in students:
        # Find active allotment
        allotment = db.query(models.AllotmentRequest).filter(
            models.AllotmentRequest.student_id == s.id,
            models.AllotmentRequest.status == "APPROVED"
        ).first()

        results.append(schemas.StudentDirectoryItem(
            id=s.id,
            full_name=s.full_name,
            reg_no=s.reg_no or s.reg_no_email,
            roll_no=s.roll_no or "N/A",
            branch=s.branch or "AI & ML",
            semester=s.semester or "2024-27",
            gender=normalize_gender(s.gender),
            mobile=s.mobile or s.guardian_contact or "N/A",
            room_number=allotment.room.room_number if allotment else "Unassigned",
            bed_code=allotment.bed.bed_code if allotment else "-",
            status="Allotted" if allotment else "Pending / None",
            profile_completed=s.profile_completed or False
        ))
    return results

# ==========================================
# 💳 DYNAMIC FEE CONFIGURATION & PAYMENTS HUB ENDPOINTS
# ==========================================
def seed_fee_structure_and_payments():
    """Seed initial fee rates and verified demo transaction history"""
    db = SessionLocal()
    try:
        fee_config = db.query(models.FeeStructure).first()
        if not fee_config:
            fee_config = models.FeeStructure(
                id=1,
                mess_fee_per_month=3600.0,
                hostel_maintenance_per_month=750.0,
                caution_money=1500.0,
                registration_fee=500.0,
                updated_at=datetime.utcnow()
            )
            db.add(fee_config)
            db.commit()

        # Seed sample transactions if empty
        if db.query(models.PaymentTransaction).count() == 0:
            txns = [
                models.PaymentTransaction(
                    student_id=1,
                    student_name="AMIT SHARMA",
                    reg_no="1554424049",
                    gender="MALE",
                    fee_type="HOSTEL",
                    amount=4500.0,
                    utr_number="UPI/623849102849/SBIN",
                    status="APPROVED",
                    receipt_number="GPB/2026/HST-84921",
                    remarks="Verified & Approved by Accounts",
                    payment_period="Senior Batch (6 Months Maintenance)",
                    created_at=datetime.utcnow(),
                    verified_at=datetime.utcnow()
                ),
                models.PaymentTransaction(
                    student_id=1,
                    student_name="AMIT SHARMA",
                    reg_no="1554424049",
                    gender="MALE",
                    fee_type="MESS",
                    amount=21600.0,
                    utr_number="HDFC/992817264810/MESS",
                    status="APPROVED",
                    receipt_number="GPB/2026/MSS-72105",
                    remarks="Full 6-Month Semester Advance Verified",
                    payment_period="6 Months (Full Semester)",
                    created_at=datetime.utcnow(),
                    verified_at=datetime.utcnow()
                ),
                models.PaymentTransaction(
                    student_id=2,
                    student_name="SANA SHARMA",
                    reg_no="1554424000",
                    gender="FEMALE",
                    fee_type="HOSTEL",
                    amount=4500.0,
                    utr_number="UPI/771829304125/KKBK",
                    status="APPROVED",
                    receipt_number="GPB/2026/HST-90142",
                    remarks="Verified & Approved by Accounts",
                    payment_period="Senior Batch (6 Months Maintenance)",
                    created_at=datetime.utcnow(),
                    verified_at=datetime.utcnow()
                ),
                models.PaymentTransaction(
                    student_id=2,
                    student_name="SANA SHARMA",
                    reg_no="1554424000",
                    gender="FEMALE",
                    fee_type="MESS",
                    amount=21600.0,
                    utr_number="UPI/883920194820/KKBK",
                    status="APPROVED",
                    receipt_number="GPB/2026/MSS-88301",
                    remarks="Full 6-Month Semester Advance Verified",
                    payment_period="6 Months (Full Semester)",
                    created_at=datetime.utcnow(),
                    verified_at=datetime.utcnow()
                ),
            ]
            for t in txns:
                db.add(t)
            db.commit()
    except Exception as e:
        print("Seed fee error:", e)
        db.rollback()
    finally:
        db.close()

seed_fee_structure_and_payments()

@app.get("/api/fees/config", response_model=schemas.FeeStructureSchema, tags=["Fee & Payments"])
def get_fee_configuration(db: Session = Depends(get_db)):
    """Fetch active dynamic fee structure (Mess, Maintenance, Caution, Registration)"""
    config = db.query(models.FeeStructure).first()
    if not config:
        config = models.FeeStructure(
            id=1,
            mess_fee_per_month=3600.0,
            hostel_maintenance_per_month=750.0,
            caution_money=1500.0,
            registration_fee=500.0
        )
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@app.put("/api/admin/fees/config", response_model=schemas.FeeStructureSchema, tags=["Fee & Payments"])
def update_fee_configuration(payload: schemas.FeeStructureUpdate, db: Session = Depends(get_db)):
    """Warden updates dynamic fee rates with instant broadcast"""
    config = db.query(models.FeeStructure).first()
    if not config:
        config = models.FeeStructure(id=1)
        db.add(config)

    if payload.mess_fee_per_month is not None:
        config.mess_fee_per_month = payload.mess_fee_per_month
    if payload.hostel_maintenance_per_month is not None:
        config.hostel_maintenance_per_month = payload.hostel_maintenance_per_month
    if payload.caution_money is not None:
        config.caution_money = payload.caution_money
    if payload.registration_fee is not None:
        config.registration_fee = payload.registration_fee

    config.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(config)
    return config

@app.post("/api/payments/submit", response_model=schemas.PaymentTransactionSchema, tags=["Fee & Payments"])
def submit_payment_transaction(payload: schemas.PaymentSubmitSchema, db: Session = Depends(get_db)):
    """Submit student payment reference and proof receipt for verification"""
    # Check for duplicate UTR
    clean_utr = payload.utr_number.strip()
    if not clean_utr or len(clean_utr) < 6:
        raise HTTPException(status_code=400, detail="Invalid UTR / Transaction Reference Number.")

    existing = db.query(models.PaymentTransaction).filter(models.PaymentTransaction.utr_number == clean_utr).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"UTR Number {clean_utr} has already been submitted.")

    # Find student user if exists
    user = None
    if payload.reg_no:
        user = db.query(models.User).filter(
            (models.User.reg_no == payload.reg_no) | (models.User.reg_no_email == payload.reg_no)
        ).first()

    new_txn = models.PaymentTransaction(
        student_id=user.id if user else payload.student_id,
        student_name=payload.student_name,
        reg_no=payload.reg_no,
        gender=normalize_gender(payload.gender or (user.gender if user else "MALE")),
        fee_type=payload.fee_type.upper(),
        amount=payload.amount,
        utr_number=clean_utr,
        proof_url=payload.proof_url,
        payment_period=payload.payment_period,
        remarks=payload.remarks,
        status="PENDING",
        created_at=datetime.utcnow()
    )
    db.add(new_txn)
    db.commit()
    db.refresh(new_txn)
    return new_txn

@app.get("/api/payments/my-history", response_model=List[schemas.PaymentTransactionSchema], tags=["Fee & Payments"])
def get_student_payment_history(reg_no: Optional[str] = Query(None), student_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """Fetch payment transactions and approved receipts for a specific student"""
    query = db.query(models.PaymentTransaction)
    if reg_no:
        query = query.filter((models.PaymentTransaction.reg_no == reg_no) | (models.PaymentTransaction.student_id == student_id))
    elif student_id:
        query = query.filter(models.PaymentTransaction.student_id == student_id)
    
    return query.order_by(models.PaymentTransaction.created_at.desc()).all()

@app.get("/api/admin/payments/all", response_model=List[schemas.PaymentTransactionSchema], tags=["Fee & Payments"])
def get_all_payment_transactions(status: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Warden fetches all payment transactions with optional status filter"""
    query = db.query(models.PaymentTransaction)
    if status and status != 'ALL':
        query = query.filter(models.PaymentTransaction.status == status.upper())
    return query.order_by(models.PaymentTransaction.created_at.desc()).all()

@app.get("/api/admin/payments/pending", response_model=List[schemas.PaymentTransactionSchema], tags=["Fee & Payments"])
def get_pending_payments(db: Session = Depends(get_db)):
    """Warden fetches pending payments needing audit and verification"""
    return db.query(models.PaymentTransaction).filter(models.PaymentTransaction.status == "PENDING").order_by(models.PaymentTransaction.created_at.desc()).all()

@app.put("/api/admin/payments/{transaction_id}/verify", response_model=schemas.PaymentTransactionSchema, tags=["Fee & Payments"])
def verify_payment_transaction(transaction_id: int, payload: schemas.PaymentVerifyAction, db: Session = Depends(get_db)):
    """Warden single-click approves payment, generates official receipt number, or rejects with remarks"""
    txn = db.query(models.PaymentTransaction).filter(models.PaymentTransaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Payment transaction not found.")

    if payload.action == "approve":
        txn.status = "APPROVED"
        prefix = "HST" if txn.fee_type == "HOSTEL" else "MSS"
        random_num = str(txn.id).zfill(5)
        txn.receipt_number = f"GPB/2026/{prefix}-{random_num}"
        txn.verified_at = datetime.utcnow()
        txn.remarks = payload.remarks or "Verified & Digitally Approved by Chief Warden"

        # Also add to user transactions if user exists
        if txn.student_id:
            general_txn = models.Transaction(
                user_id=txn.student_id,
                amount=txn.amount,
                transaction_type="credit",
                description=f"{txn.fee_type} Payment Approved (Ref: {txn.utr_number})",
                date=datetime.utcnow()
            )
            db.add(general_txn)
    else:
        txn.status = "REJECTED"
        txn.verified_at = datetime.utcnow()
        txn.remarks = payload.remarks or "Rejected: UTR or Payment Proof unverified."

    db.commit()
    db.refresh(txn)
    return txn
