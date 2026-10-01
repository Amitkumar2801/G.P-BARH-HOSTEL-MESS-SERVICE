"""
reset_students_only.py
======================
Yeh script database ki users table se SIRF STUDENTS ka record delete karta hai.
Warden accounts, Hostels, Rooms, aur Base Tables SAFE rahenge.
Beds occupancy 0 ho jayegi taaki fresh allotment ho sake.
"""

import sqlite3
import os
import sys

# Windows terminal encoding fix
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DB_PATH = os.path.join(os.path.dirname(__file__), "hostel.db")

def reset_students():
    print("=" * 60)
    print("   GP Barh Hostel - Student Data Reset (Warden Safe)")
    print("=" * 60)

    if not os.path.exists(DB_PATH):
        print(f"[ERROR] Database file not found: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Pehle count check karo
    cursor.execute("SELECT COUNT(*) FROM users;")
    total_users = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'student' OR role IS NULL;")
    student_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'warden';")
    warden_count = cursor.fetchone()[0]

    print(f"\n[INFO] Current Database Status:")
    print(f"   Total Users   : {total_users}")
    print(f"   Students      : {student_count}")
    print(f"   Wardens       : {warden_count}")

    # Warden check
    cursor.execute("SELECT id, full_name, email, reg_no_email FROM users WHERE role = 'warden';")
    wardens = cursor.fetchall()
    print("\n[INFO] Preserved Warden Accounts:")
    for w in wardens:
        print(f"   - ID: {w[0]} | Name: {w[1]} | Email/User: {w[2] or w[3]}")

    try:
        # 1. Clear all allotment requests
        cursor.execute("DELETE FROM allotment_requests;")
        
        # 2. Reset beds occupancy
        cursor.execute("UPDATE beds SET is_occupied = 0, current_student_id = NULL;")
        
        # 3. Reset room occupancy counts
        cursor.execute("UPDATE rooms SET occupied_count = 0;")
        
        # 4. Clear mess attendance
        cursor.execute("DELETE FROM mess_attendance;")
        
        # 5. Clear student transactions / payments
        cursor.execute("DELETE FROM transactions;")
        cursor.execute("DELETE FROM payment_transactions;")

        # 6. Delete student users only
        cursor.execute("DELETE FROM users WHERE role = 'student' OR role IS NULL;")

        conn.commit()

        # Final verification
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'student';")
        remaining_students = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'warden';")
        remaining_wardens = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM beds WHERE is_occupied = 1;")
        occupied_beds = cursor.fetchone()[0]

        print("\n" + "=" * 60)
        print("[SUCCESS] Students Reset Completed Successfully!")
        print(f"   - Remaining Students in DB : {remaining_students} (Wiped Clean)")
        print(f"   - Remaining Wardens in DB  : {remaining_wardens} (Preserved)")
        print(f"   - Occupied Beds Count      : {occupied_beds} (All Vacant)")
        print("=" * 60)

    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Reset failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    reset_students()
