# Changelog

All notable changes to the **G.P. Barh Hostel & Mess Service** project are documented in this file.

## [2.3.0] - 2026-09-01

### Added
- **Progressive Web App (PWA)**: Full manifest integration, home screen install capability, and responsive app icons.
- **Mess Scanner (`MessScanner.jsx`)**: High-performance QR and barcode scanning module with live validation and manual override.
- **Student Record Dossier (`StudentRecordDossier.jsx`)**: Comprehensive 360° modal with student profile, academic metrics, fee clearance checks, and document previews.
- **Database Seeding Tool (`reset_users.py`)**: Automated utility to reset, verify, and seed standard student and warden credentials.
- **Environment Templates**: Pre-configured `.env.example` templates for rapid backend and frontend local deployments.

### Enhanced
- **Warden Dashboard (`WardenDashboard.jsx`)**: Added real-time occupancy statistics, multi-criteria eligibility auditor, batch fee approvals, and room allocation filters.
- **Student Dashboard (`StudentDashboard.jsx`)**: Enhanced Smart Allotment Pass generation with anti-counterfeit QR codes and live meal pass counters.
- **Backend APIs (`main.py`, `schemas.py`, `models.py`)**: Added granular authentication middleware, expanded schemas for student profiles, and hardened meal verification routes.
- **API Tests (`test_endpoints.py`)**: Extended test coverage for authentication, room allotment, and mess attendance flows.

### Changed & Cleaned
- Deprecated legacy `ParentDashboard` and unified route hierarchy in `App.jsx`.
- Cleaned up login / signup error handling and form validation.
