# backend/models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    reg_no_email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="student") # Roles: student, warden, parent

    # Profile completion fields
    gender = Column(String, default="MALE") # 'MALE' or 'FEMALE' (or 'BOYS'/'GIRLS')
    branch = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    roll_no = Column(String, nullable=True)
    reg_no = Column(String, nullable=True)
    mobile = Column(String, nullable=True)
    guardian_contact = Column(String, nullable=True)
    guardian_mobile = Column(String, nullable=True)
    address = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    profile_pic = Column(Text, nullable=True)
    profile_completed = Column(Boolean, default=False)

    transactions = relationship("Transaction", back_populates="owner")
    allotment_requests = relationship("AllotmentRequest", back_populates="student", foreign_keys="[AllotmentRequest.student_id]")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    transaction_type = Column(String) # 'credit', 'debit'
    description = Column(String)
    date = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="transactions")

class Hostel(Base):
    __tablename__ = "hostels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    gender_type = Column(String, index=True) # 'MALE', 'FEMALE', 'BOYS', or 'GIRLS'
    total_floors = Column(Integer, default=3)
    shape_type = Column(String, default="H_SHAPE") # 'H_SHAPE' or 'LINEAR'

    rooms = relationship("Room", back_populates="hostel", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    hostel_id = Column(Integer, ForeignKey("hostels.id"))
    room_number = Column(String, index=True)
    floor_number = Column(Integer, default=0) # 0 = Ground, 1 = 1st, 2 = 2nd
    wing = Column(String, default="LEFT") # 'LEFT', 'RIGHT', 'CENTER', 'MAIN'
    capacity = Column(Integer, default=3)
    occupied_count = Column(Integer, default=0)

    hostel = relationship("Hostel", back_populates="rooms")
    beds = relationship("Bed", back_populates="room", cascade="all, delete-orphan")
    allotment_requests = relationship("AllotmentRequest", back_populates="room")

class Bed(Base):
    __tablename__ = "beds"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    bed_code = Column(String, index=True) # 'A', 'B', 'C'
    is_occupied = Column(Boolean, default=False)
    current_student_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    room = relationship("Room", back_populates="beds")
    current_student = relationship("User", foreign_keys=[current_student_id])
    allotment_requests = relationship("AllotmentRequest", back_populates="bed")

class AllotmentRequest(Base):
    __tablename__ = "allotment_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    bed_id = Column(Integer, ForeignKey("beds.id"))
    status = Column(String, default="PENDING") # 'PENDING', 'APPROVED', 'REJECTED'
    applied_at = Column(DateTime, default=datetime.utcnow)
    remarks = Column(String, nullable=True)

    student = relationship("User", back_populates="allotment_requests", foreign_keys=[student_id])
    room = relationship("Room", back_populates="allotment_requests")
    bed = relationship("Bed", back_populates="allotment_requests")

class FeeStructure(Base):
    __tablename__ = "fee_structures"

    id = Column(Integer, primary_key=True, index=True)
    mess_fee_per_month = Column(Float, default=3600.0)
    hostel_maintenance_per_month = Column(Float, default=750.0)
    caution_money = Column(Float, default=1500.0)
    registration_fee = Column(Float, default=500.0)
    updated_at = Column(DateTime, default=datetime.utcnow)

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    student_name = Column(String, index=True)
    reg_no = Column(String, index=True)
    gender = Column(String, default="MALE")
    fee_type = Column(String, index=True) # 'HOSTEL' or 'MESS'
    amount = Column(Float)
    utr_number = Column(String, unique=True, index=True)
    proof_url = Column(Text, nullable=True)
    status = Column(String, default="PENDING") # 'PENDING', 'APPROVED', 'REJECTED'
    receipt_number = Column(String, unique=True, nullable=True, index=True)
    remarks = Column(String, nullable=True)
    payment_period = Column(String, nullable=True) # e.g. '6 Months (Semester)', 'New Batch 1st Year (5 Months)'
    created_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)

    student = relationship("User", foreign_keys=[student_id])