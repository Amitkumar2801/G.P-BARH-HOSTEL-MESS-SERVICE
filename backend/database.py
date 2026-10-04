# backend/database.py
import os
from pathlib import Path
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from .env file if available
try:
    from dotenv import load_dotenv
    backend_env = Path(__file__).resolve().parent / ".env"
    root_env = Path(__file__).resolve().parent.parent / ".env"
    if backend_env.exists():
        load_dotenv(backend_env)
    elif root_env.exists():
        load_dotenv(root_env)
    else:
        load_dotenv()
except ImportError:
    pass

# Retrieve database connection URL from environment or default to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hostel.db")

# Fix for cloud PostgreSQL providers (e.g. Neon, Render, Supabase) using 'postgres://' schema
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

is_sqlite = DATABASE_URL.startswith("sqlite")

if is_sqlite:
    # SQLite configuration with concurrency and timeout
    engine = create_engine(
        DATABASE_URL,
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
else:
    # Production Cloud PostgreSQL (Neon, Supabase, RDS) with pooling
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=300,
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5
        }
    )

# SessionLocal session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative database models
Base = declarative_base()
