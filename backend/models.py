# backend/models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    reg_no_email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="student") # Roles: student, warden, parent, faculty

    # Ek user ke bahut saare transactions (fee records) ho sakte hain
    transactions = relationship("Transaction", back_populates="owner")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    transaction_type = Column(String) # 'credit' (jama kiya), 'debit' (mess/rent me kata)
    description = Column(String) # e.g., "March Mess Bill", "Online Fee Payment"
    date = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="transactions")