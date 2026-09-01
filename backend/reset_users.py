"""
reset_users.py
==============
Yeh script database ki users table se SABHI users (students + wardens) delete kar deta hai.
Rooms, hostels, beds, payments — sab kuch safe rahega.

USAGE:
    cd backend
    python reset_users.py
"""

import sqlite3
import os
import sys

# Windows terminal encoding fix
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DB_PATH = os.path.join(os.path.dirname(__file__), "hostel.db")

def reset_all_users():
    print("=" * 55)
    print("   GP Barh Hostel - User Reset Script")
    print("=" * 55)

    if not os.path.exists(DB_PATH):
        print(f"[ERROR] Database file nahi mila: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Pehle count karo
    cursor.execute("SELECT COUNT(*) FROM users;")
    total_users = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'student';")
    student_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'warden';")
    warden_count = cursor.fetchone()[0]

    print(f"\n[INFO] Current Database Status:")
    print(f"   Total Users   : {total_users}")
    print(f"   Students      : {student_count}")
    print(f"   Wardens       : {warden_count}")

    if total_users == 0:
        print("\n[OK] Database mein pehle se koi user nahi hai.")
        conn.close()
        return

    confirm = input(f"\n[CONFIRM] Kya aap SABHI {total_users} users delete karna chahte ho? (yes/no): ").strip().lower()
    if confirm != "yes":
        print("[CANCELLED] Koi bhi change nahi hua.")
        conn.close()
        return

    try:
        # Allotment requests mein student_id foreign key hai, isliye pehle woh clear karo
        cursor.execute("UPDATE allotment_requests SET student_id = NULL;")
        
        # Beds mein current_student_id clear karo
        cursor.execute("UPDATE beds SET is_occupied = 0, current_student_id = NULL;")
        
        # Rooms occupied count reset karo
        cursor.execute("UPDATE rooms SET occupied_count = 0;")
        
        # Allotment requests delete karo (kyunki student nahi toh request bhi useless hai)
        cursor.execute("DELETE FROM allotment_requests;")

        # Payment transactions mein student_id NULL karo (payment records safe rahe)
        cursor.execute("UPDATE payment_transactions SET student_id = NULL;")

        # Transactions table clear karo
        cursor.execute("DELETE FROM transactions;")

        # Ab sabhi users delete karo
        cursor.execute("DELETE FROM users;")

        # SQLite auto-increment reset karo (yeh table optional hoti hai)
        try:
            cursor.execute("DELETE FROM sqlite_sequence WHERE name='users';")
            cursor.execute("DELETE FROM sqlite_sequence WHERE name='allotment_requests';")
            cursor.execute("DELETE FROM sqlite_sequence WHERE name='transactions';")
        except Exception:
            pass  # sqlite_sequence table nahi hai toh koi baat nahi

        conn.commit()

        print(f"\n[SUCCESS] Sabhi {total_users} users delete ho gaye!")
        print("   -> Rooms aur Hostel data safe hai.")
        print("   -> Bed occupancy reset ho gayi (sabhi beds khali).")
        print("   -> Payment records safe hain (student ID NULL hua).")
        print("\n[DONE] Ab Students aur Warden fresh register kar sakte hain!")
        print("=" * 55)

    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Error aaya: {e}")
    finally:
        conn.close()


if __name__ == "__main__":
    reset_all_users()
