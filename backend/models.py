# backend/models.py
from sqlalchemy import Column, Integer, String
from database import Base


# Humne 'Student' ki jagah 'User' kar diya taaki Faculty aur Admin bhi aa sakein
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)

    # Students ke liye Reg No. aur Faculty/Admin ke liye Email ID
    reg_no_email = Column(String, unique=True, index=True)

    password = Column(String)

    # Ye sabse zaroori column hai: 'student', 'faculty', ya 'admin'
    role = Column(String, default="student")