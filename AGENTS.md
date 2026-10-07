# AGENTS.md - Permanent Repository Guidelines & Protection Rules
# Government Polytechnic, Barh - Hostel & Mess Management System

> **CRITICAL DIRECTIVE FOR ALL AI AGENTS:**
> The modules listed below are **100% COMPLETED, PRODUCTION-VERIFIED, AND PERMANENTLY LOCKED**.
> You are **STRICTLY PROHIBITED** from modifying, refactoring, deleting, or altering the logic in these finalized modules unless the user explicitly and unambiguously requests changes to that specific file.
> Any unprompted modification that causes regressions or breaks working flows will result in severe failure.

---

## 🔒 PERMANENTLY LOCKED & PROTECTED MODULES

### 1. Gmail SMTP & OTP Dispatch Engine
- **Files:**
  - `backend/auth_service.py`
  - `backend/app/services/email_service.py`
- **Protected Features:**
  - Gmail SMTP authentication (`gpbarhhostel@gmail.com`) via App Password.
  - DKIM authentication & zero-attachment MIME architecture delivering straight to Inbox with 0% bounce.
  - Asynchronous background threading dispatch (`daemon=True`) returning instant HTTP `<50ms` response.
  - 6-digit cryptographic OTP generation, TTL caching (300s / 600s), rate-limiting, and brute-force lockout protection.
  - **Official Institutional HTML Email Template**: State emblem (🏛️), Government of Bihar branding, 6 individual digit tiles (`[ 9 ] [ 4 ] [ 1 ] [ 3 ] [ 7 ] [ 6 ]`), dispatch credentials table, and security advisory callout.
- **Rule:** DO NOT change SMTP headers, Message-ID formats, or email templates.

### 2. Authentication & Recovery Backend APIs
- **File:** `backend/main.py`
- **Protected Endpoints:**
  - `POST /api/auth/send-otp` (Instant dispatch for SIGNUP and FORGOT_PASSWORD)
  - `POST /api/auth/verify-otp` (Single-use OTP verification)
  - `POST /api/auth/reset-password` & `POST /api/auth/forgot-password` (Secure password reset)
  - `POST /api/auth/login` & QR session polling endpoints (`/api/auth/qr/*`)
  - **404 Handling:** Professional English notification for unregistered accounts:
    `"Account Not Found: No registered student account exists with this email address or Registration ID. Please check your credentials or register for a new account."`
- **Rule:** DO NOT alter request/response schemas or remove threading dispatch.

### 3. Student Portal Frontend Authentication Flows
- **Files:**
  - `frontend/src/pages/Login.jsx`
  - `frontend/src/pages/Signup.jsx`
  - `frontend/src/utils/api.js`
- **Protected Features:**
  - 3-Stage Forgot Password Modal (Identity Check -> 6-Digit Auto-Advancing Boxes -> New Password Form).
  - Inline error alert badges and toast notifications.
  - QR Code login sync and automatic role redirection.
  - Dynamic API URL resolver prioritizing `localhost:8000` during local development.
- **Rule:** DO NOT alter the modal stage state machines or replace the 6-digit input mechanism.

---

## 📜 AGENT OPERATIONAL RULES

1. **Scope Discipline:** Focus strictly on the exact file(s) and feature(s) the user requested. If the user asks for a new feature (e.g. mess menu, warden notices, complaints, payments), build new routes or components. Never touch authentication code to implement unrelated features.
2. **Preserve Completed Work:** When editing any file, retain existing functions, styles, comments, and logic. Do not overwrite whole files when a localized edit is sufficient.
3. **No Regressions:** Always ensure that existing endpoints, dev servers (`uvicorn` on `:8000`, `vite` on `:5173`), and database connections continue working without disruption.
