# backend/database.py
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Ye humari database file ka naam hoga jo apne aap ban jayegi
SQLALCHEMY_DATABASE_URL = "sqlite:///./hostel.db"

# Engine database se connect karne ka kaam karta hai with fast timeout
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False, "timeout": 15}
)

# SQLite concurrency optimizations (WAL mode, Normal Sync, Busy Timeout)
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
    cursor.execute("PRAGMA busy_timeout=5000;")
    cursor.close()

# SessionLocal ek connection ka raasta (tunnel) hai
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class se hum aage chalkar apne tables (models) banayenge
Base = declarative_base()