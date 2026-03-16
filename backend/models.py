# backend/models.py
from sqlalchemy import Column, Integer, String
from database import Base

# Ye humari Student table ka naksha (blueprint) hai
class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True) # Har student ka ek unique ID (1, 2, 3...)
    full_name = Column(String, index=True)             # Student ka poora naam
    reg_no = Column(String, unique=True, index=True)   # Registration No. (Ye unique hona chahiye)
    password = Column(String)                          # Password (Aage chalkar hum isko hack-proof banayenge)