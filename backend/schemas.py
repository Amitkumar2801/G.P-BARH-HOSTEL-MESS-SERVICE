# backend/schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ==========================================
# TRANSACTION SCHEMAS (Paisa / Fee)
# ==========================================
class TransactionBase(BaseModel):
    amount: float
    transaction_type: str
    description: str

class Transaction(TransactionBase):
    id: int
    user_id: int
    date: datetime

    class Config:
        from_attributes = True

# ==========================================
# USER & PROFILE SCHEMAS
# ==========================================
class UserBase(BaseModel):
    full_name: str
    reg_no_email: str
    role: str = "student"
    gender: Optional[str] = "MALE"
    branch: Optional[str] = None
    semester: Optional[str] = "2024-27"
    session: Optional[str] = "2024-27"

class UserCreate(UserBase):
    password: str
    reg_no: Optional[str] = None

class UserLogin(BaseModel):
    reg_no_email: str
    password: str

class ProfileUpdate(BaseModel):
    user_id: int
    full_name: str
    gender: Optional[str] = "MALE" # 'MALE' or 'FEMALE'
    branch: Optional[str] = None
    semester: Optional[str] = None
    session: Optional[str] = None
    roll_no: Optional[str] = None
    reg_no: Optional[str] = None
    mobile: Optional[str] = None
    guardian_contact: Optional[str] = None
    guardian_mobile: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    profile_pic: Optional[str] = None
    pincode: Optional[str] = None
    home_district: Optional[str] = None
    home_state: Optional[str] = "Bihar"
    distance_km: Optional[float] = None
    distance_verified: Optional[bool] = False

class UserProfileResponse(BaseModel):
    id: int
    full_name: str
    reg_no_email: str
    role: str
    gender: str
    branch: Optional[str] = None
    semester: Optional[str] = None
    session: Optional[str] = None
    roll_no: Optional[str] = None
    reg_no: Optional[str] = None
    mobile: Optional[str] = None
    guardian_contact: Optional[str] = None
    guardian_mobile: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    profile_pic: Optional[str] = None
    profile_completed: bool = False
    pincode: Optional[str] = None
    home_district: Optional[str] = None
    home_state: Optional[str] = "Bihar"
    distance_km: Optional[float] = None
    distance_verified: Optional[bool] = False

    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    profile_completed: bool = False
    transactions: List[Transaction] = []

    class Config:
        from_attributes = True

# ==========================================
# ROOM & ALLOCATION SCHEMAS
# ==========================================
class BedSchema(BaseModel):
    id: int
    bed_code: str # 'A', 'B', 'C'
    is_occupied: bool
    current_student_id: Optional[int] = None
    current_student_name: Optional[str] = None
    pending_request_by_me: Optional[bool] = False

    class Config:
        from_attributes = True

class RoomSchema(BaseModel):
    id: int
    room_number: str
    floor_number: int
    wing: str
    block_name: Optional[str] = None
    row_position: Optional[str] = None
    capacity: int = 3
    occupied_count: int
    status_color: str # 'GREEN', 'AMBER', 'RED'
    beds: List[BedSchema] = []

    class Config:
        from_attributes = True

class HostelLayoutSchema(BaseModel):
    id: int
    name: str
    gender_type: str
    total_floors: int
    shape_type: str
    rooms: List[RoomSchema] = []

    class Config:
        from_attributes = True

class BedRequestCreate(BaseModel):
    student_id: int
    room_id: int
    bed_id: int

class AllotmentActionRequest(BaseModel):
    action: str # 'approve' or 'reject'
    remarks: Optional[str] = ""

class AllotmentRequestResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_gender: str
    student_branch: Optional[str] = None
    student_roll: Optional[str] = None
    student_reg: Optional[str] = None
    student_mobile: Optional[str] = None
    student_photo: Optional[str] = None
    student_pincode: Optional[str] = None
    student_district: Optional[str] = None
    student_distance_km: Optional[float] = None
    distance_priority: Optional[str] = None
    hours_left: Optional[float] = 24.0
    is_expired: Optional[bool] = False
    room_id: int
    room_number: str
    floor_number: int
    wing: Optional[str] = "LEFT"
    bed_id: int
    bed_code: str
    status: str
    applied_at: datetime
    remarks: Optional[str] = None

    class Config:
        from_attributes = True

class DistanceCalculationRequest(BaseModel):
    pincode: str
    student_id: Optional[int] = None
    district: Optional[str] = None
    state: Optional[str] = "Bihar"

class DistanceCalculationResponse(BaseModel):
    pincode: str
    district: str
    state: str
    distance_km: float
    distance_priority: str
    hostel_recommended: bool
    message: str

class WardenAnalyticsResponse(BaseModel):
    total_capacity: int
    total_occupied: int
    occupancy_pct: float
    boys_total: int
    boys_occupied: int
    boys_occupancy_pct: float
    girls_total: int
    girls_occupied: int
    girls_occupancy_pct: float
    pending_requests_count: int
    total_pending_dues: float

class StudentDirectoryItem(BaseModel):
    id: int
    full_name: str
    reg_no: Optional[str] = None
    roll_no: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[str] = None
    gender: str
    mobile: Optional[str] = None
    room_number: Optional[str] = None
    bed_code: Optional[str] = None
    status: str
    profile_completed: bool

# ==========================================
# DYNAMIC FEE & PAYMENT SCHEMAS
# ==========================================
class FeeStructureSchema(BaseModel):
    id: int
    mess_fee_per_month: float = 3600.0
    hostel_maintenance_per_month: float = 750.0
    caution_money: float = 1500.0
    registration_fee: float = 500.0
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FeeStructureUpdate(BaseModel):
    mess_fee_per_month: Optional[float] = None
    hostel_maintenance_per_month: Optional[float] = None
    caution_money: Optional[float] = None
    registration_fee: Optional[float] = None

class PaymentSubmitSchema(BaseModel):
    student_id: Optional[int] = None
    student_name: str
    reg_no: str
    gender: Optional[str] = "MALE"
    fee_type: str # 'HOSTEL' or 'MESS'
    amount: float
    utr_number: str
    proof_url: Optional[str] = None
    payment_period: Optional[str] = None
    remarks: Optional[str] = None

class PaymentTransactionSchema(BaseModel):
    id: int
    student_id: Optional[int] = None
    student_name: str
    reg_no: str
    gender: str
    fee_type: str
    amount: float
    utr_number: str
    proof_url: Optional[str] = None
    status: str # 'PENDING', 'APPROVED', 'REJECTED'
    receipt_number: Optional[str] = None
    remarks: Optional[str] = None
    payment_period: Optional[str] = None
    created_at: datetime
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PaymentVerifyAction(BaseModel):
    action: str # 'approve' or 'reject'
    remarks: Optional[str] = None

# ==========================================
# DYNAMIC MESS ATTENDANCE & ANALYTICS SCHEMAS
# ==========================================
class MessAttendanceMarkRequest(BaseModel):
    student_id: Optional[int] = None
    reg_no: Optional[str] = None
    meal_type: Optional[str] = "AUTO" # 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', or 'AUTO'
    qr_payload: Optional[str] = None

class MessAttendanceResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    reg_no: str
    room_number: str
    branch: str
    gender: str
    meal_type: str
    meal_label: str
    date: str
    scanned_at: datetime
    token_code: str
    status: str
    message: str

    class Config:
        from_attributes = True

class MessTodayStatsResponse(BaseModel):
    date: str
    active_slot: str
    active_slot_label: str
    total_eligible_students: int
    total_scanned_today: int
    breakfast_count: int
    lunch_count: int
    snacks_count: int = 0
    dinner_count: int
    boys_fed_today: int = 0
    girls_fed_today: int = 0
    boys_total_eligible: int = 81
    girls_total_eligible: int = 72
    recent_scans: List[dict] = []
    daily_qr_token: str

class WardenMessAnalyticsResponse(BaseModel):
    timeframe: str # '1M', '6M', '1Y'
    total_meals_served: int
    average_daily_turnout: float
    overall_attendance_pct: float
    boys_fed_total: int
    girls_fed_total: int
    meal_slot_distribution: dict = {} # breakfast, lunch, snacks, dinner
    chart_data: List[dict] = [] # points for visualization
    boys_chart_data: List[dict] = []
    girls_chart_data: List[dict] = []

class StudentAnalyticsResponse(BaseModel):
    student_id: int
    student_name: str
    reg_no: str
    monthly_attendance: List[dict] = []
    calendar_days: List[dict] = [] # 1 to 31 calendar grid with green/red/purple status
    timeframe_trends: dict = {} # 1M, 6M, 1Y trend points
    attendance_summary: dict = {}
    financial_progress: dict = {}
    activity_timeline: List[dict] = []

# ==========================================
# QR SCAN-TO-LOGIN SCHEMAS
# ==========================================
class QRGenerateResponse(BaseModel):
    session_id: str
    qr_payload: str
    expires_in: int = 120
    expires_at: float

class QRVerifyRequest(BaseModel):
    session_id: str
    user_id: Optional[int] = None
    reg_no_email: Optional[str] = None

class QRVerifyResponse(BaseModel):
    status: str
    message: str
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    role: Optional[str] = None

class QRPollResponse(BaseModel):
    status: str # "PENDING", "AUTHENTICATED", "EXPIRED", "NOT_FOUND"
    token: Optional[str] = None
    user: Optional[dict] = None