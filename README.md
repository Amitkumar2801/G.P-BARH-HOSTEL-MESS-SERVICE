# 🏢 G.P. BARH HOSTEL & MESS SERVICE

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

An enterprise-grade, modern Hostel and Mess Management Platform tailored for **Government Polytechnic Barh**. Designed for automated room allocation, verified online/offline fee reconciliations, smart digital QR meal passes, and real-time warden administrative controls.

---

## 🚀 Key Modules & Highlights

### 1. 🎓 Student Portal & Smart Allotment Pass
- **Room Allotment & Selection**: Visual floor & room grid with instant live availability checks.
- **Smart Allotment Pass**: Downloadable and verifiable allotment pass containing dynamic anti-counterfeit QR codes.
- **Mess Card & Attendance**: Real-time meal counter, diet pause/resume controls, and daily attendance records.
- **Fee Passbook**: Instant UTR reference submission, fee receipts generation, and payment ledger history.

### 2. 🛡️ Warden Control Suite
- **Student Record Dossier**: Complete 360° overview of individual student academic info, room history, payment verification, and disciplinary records.
- **Automated Eligibility Auditor**: Real-time checking of dues, document submission, and allotment criteria.
- **Multi-Level Approvals**: Batch approvals for room allocations, leave applications, and fee clearances.
- **Analytics & Reporting**: Live occupancy rates, mess consumption trends, and financial collection metrics.

### 3. 🍲 Real-Time Mess Scanner & Attendance
- **Camera-Based QR/Barcode Scanner**: High-speed scanning interface for mess counters.
- **Live Verification**: Sub-second meal validation to prevent duplicate entries and unauthorized boarding.
- **Manual Override & Search**: Quick fallback search by Roll Number or Name.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Lucide Icons
- **PWA**: Web App Manifest, Service Worker integration, Offline caching capabilities
- **QR Engine**: html5-qrcode & react-qr-code

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM & DB**: SQLAlchemy with SQLite (production-ready connection pooling)
- **Authentication**: JWT (JSON Web Tokens) with PBKDF2/bcrypt hashing
- **Data Validation**: Pydantic v2 schemas

---

## 📦 Project Structure

```text
G.P-BARH-HOSTEL-MESS-SERVICE/
├── backend/
│   ├── main.py              # FastAPI Application & Endpoints
│   ├── models.py            # SQLAlchemy Database Models
│   ├── schemas.py           # Pydantic Request & Response Schemas
│   ├── hostel.db            # SQLite Database
│   ├── reset_users.py       # Seed & Reset Utility Script
│   └── test_endpoints.py    # Backend API Verification Suite
│
├── frontend/
│   ├── public/              # Icons, Manifest & Static Assets
│   ├── src/
│   │   ├── components/      # Reusable UI & Dossier Modals
│   │   ├── pages/           # Student, Warden, Scanner & Auth Pages
│   │   ├── App.jsx          # Protected Routes & Layout
│   │   └── main.jsx         # App Entry Point
│   ├── package.json         # Node Dependencies
│   └── vite.config.js       # Vite Build Configuration
│
└── requirements.txt         # Backend Python Dependencies
```

---

## ⚙️ Quickstart & Local Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment:
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r ../requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and communicate with FastAPI on `http://localhost:8000`.

---

## 📄 License
Maintained and developed for **Government Polytechnic Barh**. All rights reserved.
