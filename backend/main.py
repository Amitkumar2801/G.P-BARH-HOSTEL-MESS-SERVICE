# backend/main.py

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, SessionLocal

# ---------------------------------------------------------
# DATABASE INITIALIZATION
# ---------------------------------------------------------
# Generate database tables based on SQLAlchemy models
models.Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------
# FASTAPI APP INSTANCE SETUP
# ---------------------------------------------------------
app = FastAPI(
    title="GP Barh Hostel Management API",
    description="Backend REST API for the Hostel and Mess Management System.",
    version="1.0.0"
)

# ---------------------------------------------------------
# CORS CONFIGURATION (Cross-Origin Resource Sharing)
# ---------------------------------------------------------
# Allows the React Frontend (running on port 5173) to communicate safely with this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Allows all headers
)


# ---------------------------------------------------------
# DEPENDENCIES
# ---------------------------------------------------------
def get_db() -> Session:
    """
    Dependency function to yield a database session.
    Ensures the database connection is securely closed after each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------
# API ENDPOINTS
# ---------------------------------------------------------

@app.get("/", tags=["Health Check"])
def read_root():
    """
    Root endpoint to verify if the API is running successfully.
    """
    return {
        "message": "Welcome to GP Barh Hostel API! 🚀",
        "status": "Database Connected & Server Running!"
    }


@app.post("/signup", status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user (Student/Faculty/Admin) into the system.
    Performs validation to ensure no duplicate registration numbers or emails exist.
    """
    # Step 1: Check if the user already exists in the database
    existing_user = db.query(models.User).filter(
        models.User.reg_no_email == user.reg_no_email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this Registration No. / Email already exists."
        )

    # Step 2: Create a new User instance mapped to the database model
    new_user = models.User(
        full_name=user.full_name,
        reg_no_email=user.reg_no_email,
        password=user.password,  # Note: Password hashing will be implemented in future updates
        role=user.role
    )

    # Step 3: Save the new user record securely to the database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Account successfully created!",
        "user_id": new_user.id
    }


# backend/main.py mein ekdum aakhiri mein paste karo:

@app.post("/login", tags=["Authentication"])
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Checks the user's credentials against the database.
    """
    # 1. Dhoondho ki user database mein hai ya nahi
    db_user = db.query(models.User).filter(models.User.reg_no_email == user.reg_no_email).first()

    # 2. Agar user nahi mila, ya password galat hai, toh error feko
    if not db_user or db_user.password != user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Galat ID ya Password! Wapas check karo."
        )

    # 3. Agar sab theek hai, toh success message bhej do
    return {
        "message": "Login successful!",
        "user": {
            "full_name": db_user.full_name,
            "role": db_user.role
        }
    }