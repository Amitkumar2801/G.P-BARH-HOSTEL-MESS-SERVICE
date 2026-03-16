# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ye humari database file ka naam hoga jo apne aap ban jayegi
SQLALCHEMY_DATABASE_URL = "sqlite:///./hostel.db"

# Engine database se connect karne ka kaam karta hai
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal ek connection ka raasta (tunnel) hai
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class se hum aage chalkar apne tables (models) banayenge
Base = declarative_base()