# GEMINI.md - Repository Rules & Finalized Modules Registry
# Government Polytechnic, Barh - Hostel & Mess Management System

Please refer to [AGENTS.md](file:///c:/G.P-BARH-HOSTEL-MESS-SERVICE/AGENTS.md) for the complete list of permanently locked modules and agent guidelines.

### Summary of Strict Directives:
1. **LOCKED MODULES (DO NOT MODIFY UNLESS EXPLICITLY REQUESTED):**
   - `backend/auth_service.py` (Gmail SMTP, DKIM headers, OTP storage, institutional email template)
   - `backend/app/services/email_service.py` (Instant OTP dispatcher)
   - `backend/main.py` (Auth endpoints `/api/auth/*`, async dispatch, 404 handler)
   - `frontend/src/pages/Login.jsx` (Login, QR sync, 3-stage forgot password modal)
   - `frontend/src/pages/Signup.jsx` (Student signup and OTP flow)
   - `frontend/src/utils/api.js` (Dynamic API client resolver)

2. **RULE OF ENGAGEMENT:**
   - Always keep completed features intact.
   - Do not touch, reorganize, or refactor working code when working on new tasks.
