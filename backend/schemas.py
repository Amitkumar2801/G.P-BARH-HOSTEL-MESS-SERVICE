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
# USER SCHEMAS (Login / Signup)
# ==========================================
class UserBase(BaseModel):
    full_name: str
    reg_no_email: str
    role: str = "student"  # Default role student rahega

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    reg_no_email: str
    password: str

class User(UserBase):
    id: int
    transactions: List[Transaction] = [] # User ki profile ke sath uski fee history bhi jayegi

    class Config:
        from_attributes = True