import sys
from pathlib import Path
_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

from fastapi.testclient import TestClient
import main

client = TestClient(main.app)

def test_otp_response():
    print("Testing /api/auth/send-otp endpoint response structure:")
    res = client.post("/api/auth/send-otp", json={
        "email": "test.verification@gpbarh.ac.in",
        "purpose": "SIGNUP"
    })
    print(f"Status: {res.status_code}")
    print(f"JSON: {res.json()}")
    assert res.status_code == 200 or res.status_code == 429
    if res.status_code == 200:
        data = res.json()
        assert "message" in data
        print("PASS: Valid response received.")

if __name__ == "__main__":
    test_otp_response()
