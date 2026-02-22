from fastapi import APIRouter, HTTPException
from app.models.user import StudentCreate, StudentResponse
from app.database import student_collection
from passlib.context import CryptContext

router = APIRouter()

# Password ko secure (encrypt) karne ka tool
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/register", response_model=StudentResponse)
async def register_student(student: StudentCreate):
    # 1. Check karo ki Email pehle se toh nahi hai database mein
    existing_user = await student_collection.find_one({"email": student.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Ye email pehle se register hai bhai!")

    # 2. Password ko hash karo (Taaki DB me real password na dikhe)
    hashed_password = get_password_hash(student.password)

    # 3. Database me save karne ke liye Data taiyar karo
    student_data = {
        "name": student.name,
        "email": student.email,
        "password": hashed_password,
        "registration_number": student.registration_number,
        "role": "student"
    }

    # 4. Data MongoDB mein save karo
    await student_collection.insert_one(student_data)

    return student_data