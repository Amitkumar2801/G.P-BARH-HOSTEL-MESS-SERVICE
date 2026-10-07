from pydantic import BaseModel, EmailStr
from typing import Optional

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    registration_number: Optional[str] = None
    registration_no: Optional[str] = None
    reg_no: Optional[str] = None

class StudentResponse(BaseModel):
    name: str
    email: EmailStr
    registration_number: Optional[str] = None
    registration_no: Optional[str] = None
    role: str = "student"

class StudentLogin(BaseModel):
    identifier: Optional[str] = None
    email: Optional[str] = None
    registration_no: Optional[str] = None
    registration_number: Optional[str] = None
    reg_no: Optional[str] = None
    reg_no_email: Optional[str] = None
    password: str

    def get_identifier(self) -> str:
        return (
            self.identifier or 
            self.email or 
            self.registration_no or 
            self.registration_number or 
            self.reg_no or 
            self.reg_no_email or 
            ""
        ).strip()