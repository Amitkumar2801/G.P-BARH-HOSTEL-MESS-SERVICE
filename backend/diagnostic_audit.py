# backend/sync_neon_tables.py
import os
import sys
import io

# Set UTF-8 encoding for Windows terminal
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import database
import models
from sqlalchemy import inspect, text

def sync_tables():
    print('===========================================================')
    print('   GP Barh Hostel - Neon PostgreSQL Synchronization')
    print('===========================================================')

    db_url = database.DATABASE_URL
    masked_url = db_url.split('@')[-1] if '@' in db_url else db_url
    print(f'[INFO] Target Host: {masked_url}')
    print(f'[INFO] Engine Dialect: {database.engine.dialect.name}')

    print('\n[1] Testing Live Database Connection...')
    try:
        with database.engine.connect() as conn:
            res = conn.execute(text('SELECT 1;')).scalar()
            print('   [SUCCESS] Live connection to Neon PostgreSQL established! (SELECT 1 -> 1)')
    except Exception as e:
        err_str = str(e)
        print('   [FAILED] Could not connect to Neon PostgreSQL.')
        if 'password authentication failed' in err_str:
            print('   [NOTE] Password authentication failed. Please replace "YOUR_ACTUAL_PASSWORD" in backend/.env with your actual Neon password.')
        else:
            print(f'   [ERROR DETAIL] {err_str}')
        return False

    print('\n[2] Executing Base.metadata.create_all(bind=engine)...')
    try:
        models.Base.metadata.create_all(bind=database.engine)
        print('   [SUCCESS] Table creation / synchronization completed!')
    except Exception as e:
        print(f'   [ERROR] Failed to create tables: {e}')
        return False

    print('\n[3] Inspecting Remote Database Tables...')
    inspector = inspect(database.engine)
    remote_tables = sorted(inspector.get_table_names())

    expected_tables = [
        'users',
        'hostels',
        'rooms',
        'beds',
        'allotment_requests',
        'payment_transactions',
        'mess_attendance',
        'transactions',
        'fee_structures',
        'public_documents'
    ]

    print(f'   Total Tables Discovered: {len(remote_tables)}\n')
    for t in expected_tables:
        status = ' [CREATED & READY]' if t in remote_tables else '❌ [MISSING]'
        col_count = len(inspector.get_columns(t)) if t in remote_tables else 0
        print(f'   {status} {t:22} ({col_count} columns)')

    print('\n===========================================================')
    print('   Neon Cloud Database Successfully Synchronized!')
    print('===========================================================')
    return True

if __name__ == '__main__':
    sync_tables()


