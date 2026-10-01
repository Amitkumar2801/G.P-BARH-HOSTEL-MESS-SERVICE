import requests
import json
import sys
import io

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000"

def test_full_system():
    print("=" * 65)
    print("   GP Barh Hostel - Automated End-to-End System Test")
    print("=" * 65)

    session = requests.Session()

    # -------------------------------------------------------------
    # 1. Register Boy Student (Rahul Kumar)
    # -------------------------------------------------------------
    print("\n[STEP 1] Registering Boy Student (Rahul Kumar)...")
    boy_signup = {
        "full_name": "Rahul Kumar",
        "reg_no_email": "1554424090",
        "email": "rahul.test@gpbarh.ac.in",
        "password": "Password123",
        "role": "student",
        "gender": "MALE",
        "branch": "Artificial Intelligence & Machine Learning",
        "semester": "2024-27",
        "roll_no": "24AI01",
        "mobile": "+91 98765 11111",
        "guardian_mobile": "+91 98765 22222",
        "address": "Patna, Bihar",
        "pincode": "800001",
        "home_district": "Patna",
        "home_state": "Bihar",
        "distance_km": 65.0
    }
    r = session.post(f"{BASE_URL}/signup", json=boy_signup)
    print(f"   Status: {r.status_code} | Response: {r.json().get('message', r.text)}")
    assert r.status_code in [200, 201], f"Signup failed: {r.text}"
    boy_data = r.json().get("user", {})
    boy_id = boy_data.get("id") or "1554424090"

    # -------------------------------------------------------------
    # 2. Test Grid Fetch for Boys
    # -------------------------------------------------------------
    print("\n[STEP 2] Fetching Boys Hostel Layout Grid...")
    r = session.get(f"{BASE_URL}/api/hostels/grid?gender=MALE&student_id={boy_id}")
    assert r.status_code == 200
    boys_grid = r.json()
    boys_rooms = boys_grid.get("rooms", [])
    print(f"   Hostel: {boys_grid.get('hostel_name')} | Total Rooms: {len(boys_rooms)}")
    
    # Pick room 101
    room_101 = next(r for r in boys_rooms if r.get("room_number") == "101")
    bed_a = next(b for b in room_101.get("beds", []) if b.get("bed_code") == "A")
    print(f"   Target Room: {room_101.get('room_number')} (ID: {room_101.get('id')}), Bed: {bed_a.get('bed_code')} (ID: {bed_a.get('id')})")

    # -------------------------------------------------------------
    # 3. Test Gender Restriction: Boy trying to select Girls room
    # -------------------------------------------------------------
    print("\n[STEP 3] Testing Gender Security (Boy requesting Girls Hostel Room)...")
    r_girls = session.get(f"{BASE_URL}/api/hostels/grid?gender=FEMALE")
    girls_rooms = r_girls.json().get("rooms", [])
    girls_r1 = girls_rooms[0]
    girls_b1 = girls_r1.get("beds", [])[0]
    
    r_bad = session.post(f"{BASE_URL}/api/hostels/request-bed", json={
        "student_id": boy_id,
        "room_id": girls_r1.get("id"),
        "bed_id": girls_b1.get("id"),
        "request_type": "NEW"
    })
    print(f"   Cross-Gender Request Status: {r_bad.status_code} | Detail: {r_bad.json().get('detail')}")
    assert r_bad.status_code == 400, "Should reject cross-gender bed selection!"

    # -------------------------------------------------------------
    # 4. Valid Bed Request: Boy selecting Room 101, Bed A
    # -------------------------------------------------------------
    print("\n[STEP 4] Submitting Valid Initial Bed Request (Room 101, Bed A)...")
    r_req = session.post(f"{BASE_URL}/api/hostels/request-bed", json={
        "student_id": boy_id,
        "room_id": room_101.get("id"),
        "bed_id": bed_a.get("id"),
        "request_type": "NEW"
    })
    print(f"   Status: {r_req.status_code} | Message: {r_req.json().get('message')}")
    assert r_req.status_code == 200

    # Verify student allotment status is PENDING
    r_status = session.get(f"{BASE_URL}/api/student/allotment-status/{boy_id}")
    status_data = r_status.json()
    print(f"   Student Status: {status_data.get('status')} | Room: {status_data.get('room_number')} ({status_data.get('bed_code')}) | Fee Unlocked: {status_data.get('fee_unlocked')}")
    assert status_data.get("status") == "PENDING"
    assert status_data.get("fee_unlocked") is False

    # -------------------------------------------------------------
    # 5. Warden Reviews & Approves Initial Request
    # -------------------------------------------------------------
    print("\n[STEP 5] Warden Dashboard Pending Requests & Approval...")
    r_pending = session.get(f"{BASE_URL}/api/warden/allotments/pending")
    pending_list = r_pending.json()
    print(f"   Pending Requests Count: {len(pending_list)}")
    matching_req = next((p for p in pending_list if p.get("student_reg") == "1554424090"), None)
    assert matching_req is not None, "Pending request not found in Warden queue!"
    print(f"   Found Request ID: {matching_req.get('id')} | Student: {matching_req.get('student_name')} | Type: {matching_req.get('request_type')}")
    
    # Approve
    r_action = session.post(f"{BASE_URL}/api/warden/allotments/{matching_req.get('id')}/action", json={
        "action": "approve",
        "remarks": "Approved by Chief Warden via automated verification"
    })
    print(f"   Approve Status: {r_action.status_code} | Message: {r_action.json().get('message')}")
    assert r_action.status_code == 200

    # Verify student allotment status is now APPROVED
    r_status = session.get(f"{BASE_URL}/api/student/allotment-status/{boy_id}")
    status_data = r_status.json()
    print(f"   Student Status After Approval: {status_data.get('status')} | Room: {status_data.get('room_number')} ({status_data.get('bed_code')}) | Fee Unlocked: {status_data.get('fee_unlocked')}")
    assert status_data.get("status") == "APPROVED"
    assert status_data.get("fee_unlocked") is True

    # -------------------------------------------------------------
    # 6. Test Room Upgrade Flow
    # -------------------------------------------------------------
    print("\n[STEP 6] Testing Room / Seat Upgrade Request Flow...")
    # Find Room 201 (Birsa / Rajendra)
    room_201 = next(r for r in boys_rooms if r.get("room_number") == "201")
    bed_b = next(b for b in room_201.get("beds", []) if b.get("bed_code") == "B")
    print(f"   Upgrade Target: Room {room_201.get('room_number')} (ID: {room_201.get('id')}), Bed {bed_b.get('bed_code')} (ID: {bed_b.get('id')})")

    r_upgrade = session.post(f"{BASE_URL}/api/hostels/request-bed", json={
        "student_id": boy_id,
        "room_id": room_201.get("id"),
        "bed_id": bed_b.get("id"),
        "request_type": "UPGRADE"
    })
    print(f"   Upgrade Request Status: {r_upgrade.status_code} | Message: {r_upgrade.json().get('message')}")
    assert r_upgrade.status_code == 200

    # Verify student retains current room & sees pending upgrade
    r_status = session.get(f"{BASE_URL}/api/student/allotment-status/{boy_id}")
    status_data = r_status.json()
    print(f"   Current Allotment: Room {status_data.get('room_number')} ({status_data.get('bed_code')})")
    print(f"   Pending Upgrade: {status_data.get('has_pending_upgrade')} ➔ Room {status_data.get('upgrade_room_number')} ({status_data.get('upgrade_bed_code')})")
    assert status_data.get("status") == "APPROVED"
    assert status_data.get("has_pending_upgrade") is True
    assert status_data.get("upgrade_room_number") == "201"
    assert status_data.get("upgrade_bed_code") == "B"

    # Warden views upgrade request
    r_pending = session.get(f"{BASE_URL}/api/warden/allotments/pending")
    upgrade_req = next((p for p in r_pending.json() if p.get("student_reg") == "1554424090"), None)
    assert upgrade_req is not None
    print(f"   Warden Pending Queue: Type={upgrade_req.get('request_type')} | Current: Room {upgrade_req.get('current_room_number')} ({upgrade_req.get('current_bed_code')}) ➔ New: Room {upgrade_req.get('room_number')} ({upgrade_req.get('bed_code')})")
    assert upgrade_req.get("request_type") == "UPGRADE"

    # Warden approves upgrade
    r_action = session.post(f"{BASE_URL}/api/warden/allotments/{upgrade_req.get('id')}/action", json={
        "action": "approve",
        "remarks": "Room upgrade approved"
    })
    print(f"   Warden Upgrade Approval Status: {r_action.status_code} | Message: {r_action.json().get('message')}")
    assert r_action.status_code == 200

    # Verify new room is active and old room is freed
    r_status = session.get(f"{BASE_URL}/api/student/allotment-status/{boy_id}")
    status_data = r_status.json()
    print(f"   Student Status After Upgrade: Room {status_data.get('room_number')} ({status_data.get('bed_code')}) | Pending Upgrade: {status_data.get('has_pending_upgrade')}")
    assert status_data.get("room_number") == "201"
    assert status_data.get("bed_code") == "B"
    assert status_data.get("has_pending_upgrade") is False

    # Check old bed 101-A is freed in grid
    r_grid_after = session.get(f"{BASE_URL}/api/hostels/grid?gender=MALE")
    r101_after = next(r for r in r_grid_after.json().get("rooms", []) if r.get("room_number") == "101")
    bed101a_after = next(b for b in r101_after.get("beds", []) if b.get("bed_code") == "A")
    print(f"   Old Bed 101-A Status: Occupied = {bed101a_after.get('is_occupied')} (Expected: False/Freed)")
    assert bed101a_after.get("is_occupied") is False, "Previous bed should be freed!"

    # -------------------------------------------------------------
    # 7. Register Girl Student (Ananya Singh) & Girls Flow
    # -------------------------------------------------------------
    print("\n[STEP 7] Registering Girl Student (Ananya Singh) & Girls Flow...")
    girl_signup = {
        "full_name": "Ananya Singh",
        "reg_no_email": "1554424095",
        "email": "ananya.test@gpbarh.ac.in",
        "password": "Password123",
        "role": "student",
        "gender": "FEMALE",
        "branch": "Computer Science & Engineering",
        "semester": "2024-27",
        "roll_no": "24CS01",
        "mobile": "+91 98765 33333",
        "guardian_mobile": "+91 98765 44444",
        "address": "Muzaffarpur, Bihar",
        "pincode": "842001",
        "home_district": "Muzaffarpur",
        "home_state": "Bihar",
        "distance_km": 110.0
    }
    r = session.post(f"{BASE_URL}/signup", json=girl_signup)
    assert r.status_code in [200, 201]
    girl_id = r.json().get("user", {}).get("id") or "1554424095"

    # Girl requests Girls room 101 Bed A
    r_girls = session.get(f"{BASE_URL}/api/hostels/grid?gender=FEMALE")
    g_room_101 = next(r for r in r_girls.json().get("rooms", []) if r.get("room_number") == "101")
    g_bed_a = next(b for b in g_room_101.get("beds", []) if b.get("bed_code") == "A")
    
    r_g_req = session.post(f"{BASE_URL}/api/hostels/request-bed", json={
        "student_id": girl_id,
        "room_id": g_room_101.get("id"),
        "bed_id": g_bed_a.get("id"),
        "request_type": "NEW"
    })
    print(f"   Girl Bed Request Status: {r_g_req.status_code} | Message: {r_g_req.json().get('message')}")
    assert r_g_req.status_code == 200

    # Warden approves Girl request
    r_pending = session.get(f"{BASE_URL}/api/warden/allotments/pending")
    g_req = next((p for p in r_pending.json() if p.get("student_reg") == "1554424095"), None)
    assert g_req is not None
    r_g_action = session.post(f"{BASE_URL}/api/warden/allotments/{g_req.get('id')}/action", json={
        "action": "approve",
        "remarks": "Approved Girls Hostel Allotment"
    })
    print(f"   Girl Allotment Approval Status: {r_g_action.status_code} | Message: {r_g_action.json().get('message')}")
    assert r_g_action.status_code == 200

    r_g_status = session.get(f"{BASE_URL}/api/student/allotment-status/{girl_id}")
    print(f"   Girl Final Status: {r_g_status.json().get('status')} | Room: {r_g_status.json().get('room_number')} ({r_g_status.json().get('bed_code')}) | Hostel: {r_g_status.json().get('hostel_name')}")
    assert r_g_status.json().get("status") == "APPROVED"

    print("\n" + "=" * 65)
    print(" [ALL TESTS PASSED PERFECTLY!] Backend & Logic 100% Robust.")
    print("=" * 65)

if __name__ == "__main__":
    test_full_system()
