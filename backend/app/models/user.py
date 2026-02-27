from pydantic import BaseModel, EmailStr

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    registration_number: str

class StudentResponse(BaseModel):
    name: str
    email: EmailStr
    registration_number: str
    role: str = "student"

class StudentLogin(BaseModel):
    email: EmailStr
    password: str