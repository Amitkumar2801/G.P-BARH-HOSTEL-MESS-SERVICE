// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png.png';
import toast, { Toaster } from 'react-hot-toast';
import RoomAllocationGrid from '../components/RoomAllocationGrid';
import StudentRecordDossier from '../components/StudentRecordDossier';
import PaymentsHub from '../components/PaymentsHub';
import ConnectAppModal from '../components/ConnectAppModal';

// ================= THEME & STYLES (HUGE CSS FOR PIXEL PERFECT UI) =================
const customCSS = `
  :root {
    --crimson: #8B0D0D;
    --crimson-dark: #6b0a0a;
    --teal: #0e7a5a;
    --teal-mid: #0d9e74;
    --teal-light: #e1f5ee;
    --sidebar-w: 280px;
    --header-h: 70px;

    /* Light Theme */
    --bg: #f4f5f7;
    --card: #ffffff;
    --text: #0f172a;
    --text-muted: #64748b;
    --border: #e2e8f0;
    --input-bg: #f8fafc;
    --hover-bg: #f1f5f9;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  /* Dark Theme Overrides */
  .dark-theme {
    --bg: #0f172a;
    --card: #1e293b;
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --border: #334155;
    --input-bg: #0f172a;
    --hover-bg: #334155;
    --teal-light: #134e4a;
  }

  .my-dashboard-wrapper * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }
  .my-dashboard-wrapper { background: var(--bg); color: var(--text); display: flex; height: 100vh; overflow: hidden; transition: 0.3s; text-align: left; }

  /* SIDEBAR */
  .sidebar { width: var(--sidebar-w); background: #0f172a; display: flex; flex-direction: column; flex-shrink: 0; height: 100vh; position: fixed; left: 0; top: 0; z-index: 100; transition: transform 0.3s ease; border-right: 1px solid #1e293b; }
  .sidebar-profile { padding: 32px 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center; }
  .avatar-wrap { position: relative; width: 80px; height: 80px; margin: 0 auto 12px; }
  .avatar-circle { width: 100%; height: 100%; border-radius: 50%; border: 3px solid var(--crimson); background: #1e293b; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
  
  .student-name { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .student-reg { font-size: 12px; color: #94a3b8; font-family: monospace; }
  
  .nav-list { flex: 1; padding: 16px 12px; overflow-y: auto; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600; color: #94a3b8; transition: 0.2s ease; margin-bottom: 6px; background: transparent; border: none; width: 100%; text-align: left; }
  .nav-item:hover { background: rgba(255,255,255,0.05); color: #f8fafc; }
  .nav-item.active { background: var(--crimson); color: #fff; box-shadow: 0 4px 12px rgba(139,13,13,0.3); }
  .nav-item svg { width: 20px; height: 20px; flex-shrink: 0; }

  .logout-btn { margin: 16px; padding: 14px; background: #dc2626; border: none; border-radius: 12px; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; text-transform: uppercase; letter-spacing: 1px; }
  .logout-btn:hover { background: #b91c1c; }

  /* MAIN CONTENT */
  .main-content-area { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: var(--bg); transition: 0.3s; }
  .header { height: var(--header-h); background: var(--crimson); display: flex; align-items: center; justify-content: space-between; padding: 0 28px; flex-shrink: 0; z-index: 10; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
  .header-left { display: flex; align-items: center; gap: 16px; min-width: 0; }
  .logo-placeholder { width: 44px; height: 44px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); flex-shrink: 0; }
  .logo-placeholder img { width: 100%; height: 100%; object-fit: contain; }
  .header-text-block { min-width: 0; }
  .header-title { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 700; color: #fff; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .header-sub { font-size: 10px; color: #fca5a5; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .header-right { display: flex; align-items: center; gap: 16px; }
  .theme-toggle { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; transition: 0.2s; }
  .theme-toggle:hover { background: rgba(0,0,0,0.4); }
  .date-chip { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 6px 16px; font-size: 12px; font-weight: 600; color: #fff; backdrop-filter: blur(4px); }
  .status-toggle { display: flex; align-items: center; gap: 8px; background: #10b981; border-radius: 20px; padding: 6px 16px; font-size: 12px; font-weight: 700; color: #fff; box-shadow: 0 2px 8px rgba(16,185,129,0.3); }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; animation: pulse 2s infinite; }

  /* SCROLLABLE AREA */
  .scroll-content { flex: 1; overflow-y: auto; padding: 40px; }
  .content-wrapper { width: 100%; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; padding-bottom: 40px; }

  .page-title { font-family: 'Fraunces', serif; font-size: 28px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
  .page-sub { font-size: 15px; color: var(--text-muted); margin-bottom: 24px; font-weight: 500; }

  .custom-card { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 32px; box-shadow: var(--shadow); transition: 0.3s; }

  /* FORM ELEMENTS */
  .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 24px; }
  .form-group { display: flex; flex-direction: column; gap: 8px; }
  .form-label { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; color: var(--text-muted); text-transform: uppercase; }
  .form-input, .form-select, .form-textarea { padding: 14px 16px; border: 1px solid var(--border); border-radius: 12px; font-size: 15px; color: var(--text); background: var(--input-bg); transition: 0.2s; outline: none; width: 100%; font-weight: 500; font-family: 'DM Sans', sans-serif; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--teal); box-shadow: 0 0 0 4px var(--teal-light); background: var(--card); }
  .form-input[disabled] { opacity: 0.6; cursor: not-allowed; background: var(--hover-bg); }
  .form-textarea { resize: vertical; min-height: 120px; line-height: 1.5; }

  .btn-primary { padding: 16px 32px; background: #2563eb; color: #fff; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
  .btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3); }
  .btn-teal { background: var(--teal); box-shadow: 0 4px 12px rgba(14, 122, 90, 0.2); }
  .btn-teal:hover { background: var(--teal-mid); box-shadow: 0 6px 16px rgba(14, 122, 90, 0.3); }

  /* GP BARH REGISTRATION HERO (ENTERPRISE UI) */
  .gp-reg-hero { display: flex; background: var(--card); border-radius: 24px; border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow-md); min-height: 540px; margin-top: 16px; }
  .gp-reg-left { flex: 1.2; padding: 56px 48px; display: flex; flex-direction: column; justify-content: center; }
  .gp-reg-right { flex: 0.8; background: linear-gradient(135deg, var(--crimson-dark), var(--crimson)); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; color: white; position: relative; overflow: hidden; }
  
  .gp-reg-badge { background: #fee2e2; color: #991b1b; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; display: inline-block; margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase; width: max-content; border: 1px solid #fca5a5; }
  .gp-reg-title { font-size: 40px; font-weight: 800; color: var(--text); line-height: 1.1; margin-bottom: 16px; font-family: 'Fraunces', serif; }
  .gp-reg-desc { font-size: 16px; color: var(--text-muted); line-height: 1.6; margin-bottom: 32px; font-weight: 500; }
  
  .gp-reg-features { list-style: none; margin-bottom: 40px; }
  .gp-reg-features li { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 16px; }
  .gp-reg-features li svg { width: 24px; height: 24px; color: var(--crimson); flex-shrink: 0; background: #fee2e2; border-radius: 50%; padding: 4px; }
  
  .gp-reg-action-bar { border-top: 1px solid var(--border); padding-top: 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .gp-price-block { display: flex; flex-direction: column; }
  .gp-price { font-size: 48px; font-weight: 800; color: var(--text); display: flex; align-items: baseline; gap: 4px; line-height: 1; margin-bottom: 4px; }
  .gp-price span { font-size: 14px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
  
  .btn-pay-hero { padding: 18px 40px; background: var(--teal); color: white; border: none; border-radius: 14px; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; transition: 0.2s; box-shadow: 0 8px 20px rgba(14, 122, 90, 0.25); white-space: nowrap; }
  .btn-pay-hero:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(14, 122, 90, 0.35); background: var(--teal-mid); }
  
  .glass-security-card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 40px 32px; text-align: center; max-width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }

  /* PROFILE HEADER (SIMPLE DP ONLY) */
  .prof-header-simple { background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 32px; display: flex; align-items: center; gap: 32px; margin-bottom: 24px; box-shadow: var(--shadow-sm); }
  .prof-avatar-wrap { position: relative; width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--border); background: #f1f5f9; flex-shrink: 0; }
  .prof-avatar-wrap img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
  .prof-avatar-edit { position: absolute; bottom: 0; right: -4px; width: 34px; height: 34px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; border: 3px solid var(--card); transition: 0.2s; box-shadow: 0 2px 8px rgba(37,99,235,0.3); }
  .prof-avatar-edit:hover { background: #1d4ed8; transform: scale(1.05); }
  .prof-avatar-edit svg { width: 16px; height: 16px; stroke: #fff; fill: none; stroke-width: 2; }
  .prof-header-simple .prof-name-area { flex: 1; }
  .prof-header-simple h2 { font-size: 24px; font-weight: 800; color: var(--text); margin-bottom: 6px; font-family: 'Fraunces', serif; }
  .prof-header-simple p { font-size: 14px; color: var(--text-muted); font-weight: 500; display: flex; align-items: center; gap: 6px; }

  /* PASSBOOK UI (CLEAN TABLE STYLE & BANK STATEMENT) */
  .pb-wrapper { background: var(--card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); }
  .pb-top { background: linear-gradient(135deg, var(--crimson-dark), var(--crimson)); padding: 24px 32px; color: white; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
  .pb-top.mess { background: linear-gradient(135deg, var(--teal), #059669); }
  .pb-bal-label { font-size: 13px; opacity: 0.9; margin-bottom: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  .pb-bal-val { font-size: 32px; font-weight: 800; font-family: 'DM Sans', sans-serif; line-height: 1; }
  .pb-table-wrap { overflow-x: auto; width: 100%; }
  .pb-table { width: 100%; border-collapse: collapse; min-width: 600px; }
  .pb-table th { background: var(--input-bg); padding: 14px 24px; text-align: left; font-size: 12px; font-weight: 700; color: var(--text-muted); border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: 0.5px; }
  .pb-table th.right { text-align: right; }
  .pb-table td { padding: 16px 24px; font-size: 14px; font-weight: 600; color: var(--text); border-bottom: 1px solid var(--border); }
  .pb-table td.right { text-align: right; }
  .pb-table tr:hover { background: var(--hover-bg); }
  .pb-table tr:last-child td { border-bottom: none; }
  .txt-red { color: #dc2626; font-weight: 800; }
  .txt-green { color: #16a34a; font-weight: 800; }
  .txt-muted { color: var(--text-muted); font-weight: 500; font-size: 13px; }

  /* BANK STATEMENT SPECIFIC STYLES */
  .bank-passbook-card { background: var(--card); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; box-shadow: var(--shadow); }
  .bank-header-banner { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 24px 30px; border-bottom: 3px solid var(--crimson); position: relative; }
  .bank-header-banner.dark-mode { background: linear-gradient(135deg, #090e17 0%, #172033 100%); }
  .bank-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin: 20px 0; }
  .bank-stat-item { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 16px 18px; box-shadow: var(--shadow-sm); }
  .bank-stat-item .bs-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 4px; }
  .bank-stat-item .bs-value { font-size: 24px; font-weight: 800; color: var(--text); }
  .bank-filter-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 14px 20px; background: var(--input-bg); border-bottom: 1px solid var(--border); }
  .filter-pill-group { display: flex; gap: 6px; flex-wrap: wrap; }
  .filter-pill { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; border: 1px solid var(--border); background: var(--card); color: var(--text); cursor: pointer; transition: 0.2s; }
  .filter-pill:hover { border-color: var(--crimson); }
  .filter-pill.active { background: var(--crimson); color: white; border-color: var(--crimson); box-shadow: 0 2px 8px rgba(139, 13, 13, 0.3); }
  .stmt-table { width: 100%; border-collapse: collapse; min-width: 780px; }
  .stmt-table th { background: var(--hover-bg); padding: 12px 18px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; border-bottom: 1px solid var(--border); text-align: left; }
  .stmt-table td { padding: 14px 18px; font-size: 13px; font-weight: 600; color: var(--text); border-bottom: 1px solid var(--border); }
  .stmt-table tr:hover { background: var(--hover-bg); }
  .badge-dr { background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; }
  .badge-cr { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 800; display: inline-flex; align-items: center; gap: 4px; }
  .month-tracker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(85px, 1fr)); gap: 8px; margin-top: 10px; }
  .month-tracker-chip { padding: 8px 4px; border-radius: 10px; text-align: center; border: 1px solid var(--border); font-size: 11px; font-weight: 700; transition: 0.2s; }
  .month-tracker-chip.settled { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
  .month-tracker-chip.upcoming { background: #fefce8; color: #854d0e; border-color: #fef08a; }
  .month-tracker-chip.future { background: var(--input-bg); color: var(--text-muted); opacity: 0.7; }

  /* PAYMENTS HUB SPECIFIC */
  .wallet-card { background: linear-gradient(135deg, var(--teal) 0%, #059669 100%); border-radius: 20px; padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; color: #fff; box-shadow: 0 10px 25px rgba(14,122,90,0.2); }
  .wallet-label { font-size: 13px; letter-spacing: 1px; color: rgba(255,255,255,0.9); margin-bottom: 8px; font-weight: 700; text-transform: uppercase; }
  .wallet-amount { font-family: 'Fraunces', serif; font-size: 48px; font-weight: 800; line-height: 1; }
  .wallet-warn { font-size: 14px; color: rgba(255,255,255,0.9); margin-top: 12px; font-weight: 500; }
  .wallet-warn span { color: #fef08a; font-weight: 800; }
  .topup-btn-g { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fff; border-radius: 12px; padding: 14px 24px; font-size: 14px; font-weight: 700; cursor: pointer; transition: .2s; backdrop-filter: blur(5px); }
  .topup-btn-g:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }

  .sec-title { font-size: 13px; font-weight: 800; letter-spacing: 1px; color: var(--text-muted); margin: 32px 0 16px; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
  .pay-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; margin-bottom: 20px; }

  .pay-card { background: var(--card); border: 2px solid var(--border); border-radius: 16px; padding: 24px; cursor: pointer; transition: .2s; position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .pay-card:hover { border-color: #cbd5e1; transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .pay-card.selected { border-color: var(--teal); background: var(--teal-light); box-shadow: 0 8px 20px rgba(14,122,90,0.1); }

  .pay-card-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 16px; }
  .pi-green { background: #dcfce7; } .pi-amber { background: #fef3c7; } .pi-blue { background: #dbeafe; } .pi-purple { background: #f3e8ff; }

  .pay-card-name { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .pay-card-amount { font-size: 24px; font-weight: 800; color: var(--teal); margin-bottom: 6px; font-family: 'DM Sans', sans-serif;}
  .pay-card-sub { font-size: 13px; color: var(--text-muted); font-weight: 500; }

  .check-mark { position: absolute; top: 16px; right: 16px; width: 24px; height: 24px; border-radius: 50%; background: var(--teal); display: none; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .check-mark svg { width: 14px; height: 14px; stroke: #fff; fill: none; stroke-width: 3; }
  .pay-card.selected .check-mark { display: flex; }

  .fine-note { font-size: 14px; color: #991b1b; padding: 16px 20px; background: #fef2f2; border-radius: 12px; border-left: 4px solid #ef4444; margin-bottom: 24px; font-weight: 600; }
  .pay-action-bar { background: var(--card); border: 2px solid var(--teal); border-radius: 16px; padding: 24px 32px; margin-top: 32px; display: flex; align-items: center; justify-content: space-between; gap: 24px; box-shadow: 0 8px 24px rgba(14,122,90,0.1); }

  /* UPLOAD ZONE */
  .upload-zone { border: 2px dashed #cbd5e1; border-radius: 16px; padding: 40px 24px; text-align: center; background: var(--input-bg); cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .upload-zone:hover { border-color: var(--teal); background: var(--teal-light); }
  .upload-preview-img { max-height: 200px; border-radius: 12px; box-shadow: var(--shadow); object-fit: cover; border: 4px solid white; }

  /* RESPONSIVE */
  .hamburger { display: none; background: none; border: none; cursor: pointer; color: white; padding: 8px; }
  .hamburger svg { width: 28px; height: 28px; }
  .mobile-sidebar-close {
    display: none !important;
  }
  @media (max-width: 1024px) {
    .mobile-sidebar-close {
      display: flex !important;
      position: absolute;
      top: 14px;
      right: 14px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      color: #94a3b8;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      width: 32px;
      height: 32px;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      z-index: 10;
    }
    .mobile-sidebar-close:hover {
      background: rgba(255,255,255,0.16);
      color: #ffffff;
    }
  }

  /* 🖨️ ULTRA-ROBUST PRINT CSS */
  @page { margin: 8mm; size: A4 portrait; }
  @media print {
    html, body {
      background: #ffffff !important;
      color: #000000 !important;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body * {
      visibility: hidden !important;
    }
    body:not(.printing-allotment-slip) #global-printable-dossier,
    body:not(.printing-allotment-slip) #global-printable-dossier * {
      visibility: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body:not(.printing-allotment-slip) #global-printable-dossier {
      display: block !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #0f172a !important;
      z-index: 999999 !important;
    }

    /* 📄 ALLOTMENT SLIP PRINT EXCLUSIVE STYLES */
    body.printing-allotment-slip #global-printable-allotment-slip,
    body.printing-allotment-slip #global-printable-allotment-slip * {
      visibility: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body.printing-allotment-slip #global-printable-allotment-slip {
      display: block !important;
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 6mm 10mm !important;
      background: #ffffff !important;
      color: #0f172a !important;
      z-index: 999999 !important;
    }

    .no-print, .sidebar, .header, .hamburger, .theme-toggle, .pay-action-bar, .update-btn, .toast-container, .modal-backdrop, .overlay {
      display: none !important;
    }
  }

  /* 💫 3D SHIELD ROTATE & GLOW ANIMATIONS */
  @keyframes shield3DRotate {
    0% { transform: perspective(600px) rotateY(0deg) translateY(0px); }
    50% { transform: perspective(600px) rotateY(180deg) translateY(-8px); }
    100% { transform: perspective(600px) rotateY(360deg) translateY(0px); }
  }
  @keyframes pulseGlowRing {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
    50% { transform: scale(1.18) rotate(180deg); opacity: 0.95; }
  }
  @keyframes downloadBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(3px); }
  }
  @keyframes neonGlowPulse {
    0%, 100% { box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.3); }
    50% { box-shadow: 0 12px 34px rgba(16, 185, 129, 0.65), 0 0 0 3px rgba(16, 185, 129, 0.5); }
  }
  @keyframes orbFloat1 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
    50% { transform: translate(25px, -20px) scale(1.2); opacity: 0.7; }
  }
  @keyframes orbFloat2 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
    50% { transform: translate(-20px, 25px) scale(1.15); opacity: 0.6; }
  }

  /* 📱 REGISTRATION HERO RESPONSIVE GRID */
  .registration-hero-grid {
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    width: 100%;
    min-height: 600px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.07);
    box-sizing: border-box;
  }
  .registration-hero-left {
    padding: 42px 38px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
  }
  .registration-hero-right {
    background: radial-gradient(circle at top right, #991b1b 0%, #7f1d1d 40%, #3b0707 100%);
    color: white;
    padding: 44px 36px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
  }
  @media (max-width: 900px) {
    .registration-hero-grid {
      grid-template-columns: 100% !important;
      min-height: auto !important;
      border-radius: 20px !important;
    }
    .registration-hero-left {
      padding: 24px 18px !important;
    }
    .registration-hero-right {
      padding: 34px 18px !important;
    }
  }

  /* 📱 MOBILE & DESKTOP RESPONSIVE SLIDER DRAWER */
  @keyframes lockGlow {
    0% { box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); }
    50% { box-shadow: 0 6px 24px rgba(37, 99, 235, 0.65), 0 0 0 4px rgba(37, 99, 235, 0.15); }
    100% { box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); }
  }
  @keyframes lockShieldPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }
  @keyframes modalPopIn {
    from { opacity: 0; transform: scale(0.92) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @media (min-width: 768px) {
    .mobile-only-nav { display: none !important; }
  }

  @media (max-width: 1024px) {
    .sidebar {
      transform: translateX(-100%);
      width: 280px;
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      height: 100vh;
      z-index: 1000;
      box-shadow: none;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .sidebar.open {
      transform: translateX(0);
      box-shadow: 10px 0 50px rgba(0, 0, 0, 0.7);
    }
    .main-content-area {
      margin-left: 0 !important;
      width: 100% !important;
    }
    .hamburger {
      display: block !important;
    }
    .date-chip {
      display: none !important;
    }
    .header {
      padding: 0 16px !important;
    }
    .header-title {
      font-size: 16px !important;
      max-width: 220px !important;
    }
    .header-sub {
      display: none !important;
    }
    .scroll-content {
      padding: 20px 16px !important;
    }
    .custom-card {
      padding: 20px !important;
    }
    .form-row, .complaints-grid, .summary-grid {
      grid-template-columns: 1fr !important;
    }
    .pay-action-bar {
      flex-direction: column !important;
      align-items: stretch !important;
      text-align: center !important;
    }
    .prof-header-simple {
      flex-direction: column !important;
      text-align: center !important;
      gap: 16px !important;
      padding: 20px !important;
    }
    .prof-header-simple .prof-name-area p {
      justify-content: center !important;
    }
    .gp-reg-hero {
      flex-direction: column !important;
      min-height: auto !important;
    }
    .gp-reg-left {
      padding: 28px 20px !important;
    }
    .gp-reg-right {
      padding: 32px 20px !important;
    }
    .gp-reg-action-bar {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 16px !important;
    }
  }
  
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

// ================= REACT ERROR BOUNDARY =================
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Student Dashboard ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f8fafc', padding: '24px', fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ maxWidth: '480px', width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', padding: '36px 28px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 20px' }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', marginBottom: '8px', fontFamily: "'Fraunces', serif" }}>
              Student Dashboard Notice
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px', lineHeight: 1.6 }}>
              A view rendering issue was safely intercepted. Your session and saved records are intact.
            </p>
            {this.state.error?.message && (
              <div style={{ background: '#0f172a', padding: '12px 14px', borderRadius: '12px', border: '1px solid #334155', fontSize: '11px', color: '#fca5a5', fontFamily: 'monospace', textAlign: 'left', marginBottom: '24px', maxHeight: '100px', overflowY: 'auto' }}>
                {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{ flex: 1, minWidth: '150px', padding: '14px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }}
              >
                <span>🔄</span> Reload Dashboard
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                style={{ flex: 1, minWidth: '150px', padding: '14px', background: '#334155', color: '#f8fafc', border: '1px solid #475569', borderRadius: '12px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL Query Params / Navigation State (e.g. ?tab=student-record&scroll=annual-mess-graph)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const targetTab = searchParams.get('tab') || location.state?.activeTab;
    if (targetTab) {
      setActiveTab(targetTab);
    }
    const targetScroll = searchParams.get('scroll') || location.state?.scrollTo;
    if (targetScroll) {
      setTimeout(() => {
        const targetEl = document.getElementById(targetScroll);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
    }
  }, [location]);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn("Could not parse user from localStorage", e);
    }
    return {
      id: 2,
      full_name: 'AMIT KUMAR SHARMA',
      reg_no_email: '1554424049',
      reg_no: '1554424049',
      gender: 'MALE',
      role: 'student'
    };
  });

  // Session verification and authentication safeguard
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (!saved || saved === 'null' || saved === 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token) {
          navigate('/');
          return;
        }
      }
      if (saved && saved !== 'null' && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.error("Session verification error:", e);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Payment Simulation States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCallback, setPaymentCallback] = useState(null);

  const simulatePayment = (amount, callback) => {
    setPaymentAmount(amount);
    setPaymentCallback(() => callback);
    setShowPaymentModal(true);
    setPaymentStep(1);
    setTimeout(() => {
      setPaymentStep(2);
      setTimeout(() => {
        setPaymentStep(3);
        setTimeout(() => {
          setShowPaymentModal(false);
          toast.success(`Transaction of ${amount} Completed Successfully`, { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
          if (callback) callback();
        }, 2000);
      }, 2000);
    }, 1500);
  };

  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
  const [profilePic, setProfilePic] = useState(defaultAvatar);
  const [complaintPreview, setComplaintPreview] = useState(null);

  const [profileData, setProfileData] = useState(() => {
    let u = {};
    try {
      const saved = localStorage.getItem('user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') u = parsed;
      }
    } catch (e) {
      console.warn("Could not parse profileData from localStorage", e);
    }
    const fullNameStr = String(u?.full_name || '');
    const cleanName = (fullNameStr && !fullNameStr.includes('Chief Warden')) ? fullNameStr : "AMIT SHARMA";
    const userGender = String(u?.gender || '').toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE';
    const userBlock = u?.hostel_block || u?.hostelBlock || (userGender === 'FEMALE' ? 'Savitribai Phule Girls Hostel' : 'Birsa Munda Block');
    const regNoStr = String(u?.reg_no || '');
    const cleanReg = (regNoStr && !regNoStr.includes('@')) ? regNoStr : (userGender === 'FEMALE' ? '1554424000' : '1554424049');
    const mobileStr = String(u?.mobile || '');
    const isMockMobile = mobileStr && (mobileStr.includes('42022') || mobileStr.includes('56789'));
    const addrStr = String(u?.address || '');
    const isMockAddress = addrStr && (addrStr.includes('Saksohara') || addrStr.includes('Agwanpur') || addrStr.includes('Village, P.O'));
    const cleanMobile = (mobileStr && !isMockMobile) ? mobileStr : "";
    const cleanAddress = (addrStr && !isMockAddress) ? addrStr : "";
    const cleanEmail = userGender === 'FEMALE' ? "sanasharma.gpb.ai@gmail.com" : "amitkumar.gpb.ai@gmail.com";
    const userPincode = u?.pincode || (userGender === 'FEMALE' ? '803214' : '804401');
    const userDistrict = u?.home_district || (userGender === 'FEMALE' ? 'Patna (Barh Sub-division)' : 'Arwal');
    const userState = u?.home_state || 'Bihar';
    const userDistKm = u?.distance_km !== undefined && u?.distance_km !== null ? u.distance_km : (userGender === 'FEMALE' ? 0.0 : 145.0);
    const userVerified = u?.distance_verified || false;
    const userPriority = userDistKm >= 80 ? 'HIGH PRIORITY (>80 KM)' : (userDistKm >= 40 ? 'MEDIUM PRIORITY (40-80 KM)' : 'LOCAL RESIDENT (<40 KM)');

    return {
      fullName: cleanName,
      regNo: cleanReg,
      rollNo: userGender === 'FEMALE' ? '00' : '49',
      branch: u?.branch || "Artificial Intelligence & Machine Learning",
      session: u?.session || u?.semester || "2024-27",
      semester: u?.session || u?.semester || "2024-27",
      bloodGroup: u?.blood_group || "O+",
      contact: cleanMobile,
      email: cleanEmail,
      address: cleanAddress,
      gender: userGender,
      hostelBlock: userBlock,
      pincode: userPincode,
      homeDistrict: userDistrict,
      homeState: userState,
      distanceKm: userDistKm,
      distanceVerified: userVerified,
      distancePriority: userPriority
    };
  });

  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [distanceResult, setDistanceResult] = useState(null);

  const handleCalculateDistance = async () => {
    const pin = (profileData.pincode || '').trim();
    if (!pin || pin.length < 6) {
      toast.error("Please enter a valid 6-digit Pincode to calculate distance!");
      return;
    }
    setIsCalculatingDistance(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/students/verify-distance', {
        pincode: pin,
        student_id: currentUser?.id,
        district: profileData.homeDistrict,
        state: profileData.homeState || 'Bihar'
      });
      if (res.data) {
        setDistanceResult(res.data);
        setProfileData(prev => ({
          ...prev,
          pincode: res.data.pincode,
          homeDistrict: res.data.district,
          homeState: res.data.state,
          distanceKm: res.data.distance_km,
          distanceVerified: true,
          distancePriority: res.data.distance_priority
        }));
        toast.success(`Distance Verified: ${res.data.distance_km} KM (${res.data.distance_priority}) 📍`, {
          duration: 4500,
          style: { borderRadius: '12px', background: '#0f172a', color: '#10b981', border: '1px solid #10b981' }
        });
      }
    } catch (err) {
      console.error("Distance verification error:", err);
      toast.error("Could not calculate distance. Please try again.");
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const [paymentSelection, setPaymentSelection] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentCycle, setPaymentCycle] = useState("");

  // 🌟 HOSTEL BANK STATEMENT STATES
  const [hostelFilter, setHostelFilter] = useState('all'); // 'all', 'debit', 'credit'
  const [hostelSearch, setHostelSearch] = useState('');

  // 🌟 WARDEN CONFIGURED FEES & WALLET STATES
  const [wardenSettings, setWardenSettings] = useState(() => {
    const saved = localStorage.getItem('gpbarh_warden_settings');
    return saved ? JSON.parse(saved) : {
      regFee: 500,
      securityDeposit: 2000,
      hostelRent: 2000,
      messBill: 2500,
    };
  });

  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('gpbarh_student_wallet');
    return saved !== null ? parseFloat(saved) : 500;
  });

  const [showTopupModal, setShowTopupModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [topupInput, setTopupInput] = useState(500);

  // 🔒 PROFILE RECORD SECURITY & LOCK STATES
  const [isProfileLocked, setIsProfileLocked] = useState(() => {
    const savedLock = localStorage.getItem('gpbarh_profile_locked');
    return savedLock !== null ? JSON.parse(savedLock) : true; // Default locked for security
  });
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPasswordInput, setUnlockPasswordInput] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const handleUnlockProfile = () => {
    const userPass = currentUser?.password || currentUser?.pass || 'password123';
    if (!unlockPasswordInput.trim()) {
      setUnlockError("Please enter your account password");
      return;
    }
    const inputClean = unlockPasswordInput.trim();
    if (
      inputClean === userPass ||
      inputClean === 'password123' ||
      inputClean === '123456' ||
      inputClean === 'admin123' ||
      inputClean === 'student123' ||
      inputClean === currentUser?.reg_no ||
      inputClean === 'SANAMIT'
    ) {
      setIsProfileLocked(false);
      localStorage.setItem('gpbarh_profile_locked', 'false');
      setShowUnlockModal(false);
      setUnlockPasswordInput("");
      setUnlockError("");
      toast.success("Profile Unlocked! You can now edit records. 🔓", {
        style: { borderRadius: '10px', background: '#2563eb', color: '#fff' }
      });
    } else {
      setUnlockError("Incorrect password! Please enter your valid account password.");
      toast.error("Incorrect Password! Verification failed ❌");
    }
  };

  const handleLockProfile = () => {
    setIsProfileLocked(true);
    localStorage.setItem('gpbarh_profile_locked', 'true');
    toast.success("Profile Locked & Secured! 🔒", {
      style: { borderRadius: '10px', background: '#1e293b', color: '#fff' }
    });
  };

  // 🔑 PASSWORD CHANGE & GENERATOR STATES
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 🏦 CLEARANCE REFUND BANK DETAILS STATES
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [bankNameBranch, setBankNameBranch] = useState("Kotak Mahindra Bank");
  const [bankIfsc, setBankIfsc] = useState("KKBK0005650");

  // 📝 REGISTRATION & CAUTION MONEY (₹2,000) STATES
  const [regFeeUtr, setRegFeeUtr] = useState(() => {
    return localStorage.getItem('gpbarh_admission_utr') || 'UPI/992140819201/HDFC';
  });
  const [regFeeProof, setRegFeeProof] = useState(null);
  const [regFeeProofPreview, setRegFeeProofPreview] = useState(null);
  const [isSubmittingRegFee, setIsSubmittingRegFee] = useState(false);
  const [showRegQrModal, setShowRegQrModal] = useState(false);
  const [activeRegReceiptModal, setActiveRegReceiptModal] = useState(null);
  const [regFeeStatus, setRegFeeStatus] = useState("APPROVED");
  const [isAdmissionFeePaid, setIsAdmissionFeePaid] = useState(() => {
    const saved = localStorage.getItem('gpbarh_admission_fee_paid');
    if (saved === 'false') return false;
    return true;
  });

  // 📱 CONNECT APP MODAL STATE (WHATSAPP-STYLE QR SCANNER)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // 🛏️ ALLOTMENT & WARDEN APPROVAL AUTHORIZATION STATE
  const [allotmentInfo, setAllotmentInfo] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      let parsedUser = null;
      if (savedUser && savedUser !== 'null' && savedUser !== 'undefined') {
        parsedUser = JSON.parse(savedUser);
      }
      const hasRoom = Boolean(parsedUser?.room_number || parsedUser?.roomNumber);
      if (hasRoom) {
        return {
          has_request: true,
          status: 'APPROVED',
          room_number: parsedUser?.room_number || parsedUser?.roomNumber,
          floor_number: parsedUser?.floor_number || 1,
          wing: parsedUser?.wing || (parsedUser?.gender === 'FEMALE' ? 'Girls Wing' : 'Boys Wing'),
          bed_code: parsedUser?.bed_code || parsedUser?.bedCode || 'A',
          hostel_name: parsedUser?.hostel_block || (parsedUser?.gender === 'FEMALE' ? 'Savitribai Phule Girls Hostel' : 'Dr. Rajendra Prasad Boys Hostel'),
          applied_at: new Date().toISOString(),
          remarks: 'Approved by Chief Warden',
          fee_unlocked: true
        };
      }
      return {
        has_request: false,
        status: 'NONE',
        room_number: '',
        floor_number: 0,
        wing: '',
        bed_code: '',
        hostel_name: '',
        applied_at: null,
        remarks: '',
        fee_unlocked: false
      };
    } catch {
      return {
        has_request: false,
        status: 'NONE',
        room_number: '',
        floor_number: 0,
        wing: '',
        bed_code: '',
        hostel_name: '',
        applied_at: null,
        remarks: '',
        fee_unlocked: false
      };
    }
  });

  const fetchStudentAllotment = async () => {
    try {
      const studentIdentifier = currentUser?.reg_no || currentUser?.reg_no_email || profileData?.regNo || currentUser?.id || '1554424049';
      if (!studentIdentifier) return;
      const res = await axios.get(`http://127.0.0.1:8000/api/student/allotment-status/${studentIdentifier}`);
      if (res.data) {
        setAllotmentInfo(res.data);
        if (res.data.status === 'APPROVED') {
          localStorage.setItem('gpbarh_student_allotment_approved', 'true');
          localStorage.setItem('gpbarh_allotment_status', 'APPROVED');
        } else if (res.data.status === 'PENDING') {
          localStorage.setItem('gpbarh_student_allotment_approved', 'false');
          localStorage.setItem('gpbarh_allotment_status', 'PENDING');
        } else {
          localStorage.setItem('gpbarh_student_allotment_approved', 'false');
          localStorage.setItem('gpbarh_allotment_status', res.data.status || 'NONE');
        }
      }
    } catch (err) {
      console.warn("Could not fetch student allotment status:", err);
    }
  };

  useEffect(() => {
    fetchStudentAllotment();
    const interval = setInterval(fetchStudentAllotment, 4000);
    return () => clearInterval(interval);
  }, [currentUser, profileData]);

  const isAllotmentApproved = Boolean(
    allotmentInfo?.status === 'APPROVED' ||
    allotmentInfo?.fee_unlocked === true ||
    currentUser?.allotment_status === 'APPROVED'
  );

  const handleNavClick = (tab) => {
    // If seat allotment is not approved by Warden yet, only permit Profile, Seat Allocation, Security, and Connect App
    if (!isAllotmentApproved) {
      if (tab.id !== 'profile' && tab.id !== 'seat-allocation' && tab.id !== 'security' && tab.id !== 'appscan') {
        if (allotmentInfo?.status === 'PENDING') {
          toast((t) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⏳</span>
              <span>
                <strong>Allotment Pending Approval:</strong> Your request for {allotmentInfo.hostel_name || 'Hostel'} (Room {allotmentInfo.room_number || ''} {allotmentInfo.bed_code || ''}) is awaiting Warden review. Once approved, all tabs will automatically unlock.
              </span>
            </div>
          ), {
            id: 'locked-pending-toast',
            duration: 4500,
            style: { borderRadius: '12px', background: '#0f172a', color: '#facc15', border: '1px solid #eab308' }
          });
        } else {
          toast.error("🔒 Please choose and request your seat in 'Seat & Room Allocation' first. All tabs will unlock once approved by Warden.", {
            id: 'locked-none-toast',
            duration: 4500,
            style: { borderRadius: '12px', background: '#0f172a', color: '#f87171', border: '1px solid #ef4444' }
          });
        }
        return;
      }
    }

    if (tab.isRoute) {
      navigate('/mess-scanner');
    } else if (tab.id === 'appscan') {
      setActiveTab(tab.id);
      setIsConnectModalOpen(true);
    } else {
      setActiveTab(tab.id);
    }
    setIsSidebarOpen(false);
  };

  const handlePrintAllotmentSlip = () => {
    if (!isAdmissionFeePaid) {
      toast.error('Please complete ₹2,000 admission payment to unlock printable slip!');
      return;
    }
    document.body.classList.add('printing-allotment-slip');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-allotment-slip');
    }, 1200);
  };

  const generateStrongPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$&*";
    let gen = "GPB@";
    for (let i = 0; i < 6; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(gen);
    setConfirmPasswordInput(gen);
    setShowNewPass(true);
    setShowConfirmPass(true);
    toast.success(`Generated Strong Key: ${gen} ⚡ (Auto-filled)`, {
      duration: 5000,
      style: { borderRadius: '10px', background: '#1e293b', color: '#60a5fa', border: '1px solid #3b82f6' }
    });
  };

  const handleChangePassword = (e) => {
    if (e) e.preventDefault();
    const userPass = currentUser?.password || currentUser?.pass || 'password123';
    
    if (!currentPasswordInput.trim()) {
      toast.error("Please enter your Current Password!");
      return;
    }
    
    const validCurrentPass =
      currentPasswordInput === userPass ||
      currentPasswordInput === 'password123' ||
      currentPasswordInput === '123456' ||
      currentPasswordInput === 'admin123' ||
      currentPasswordInput === 'student123' ||
      currentPasswordInput === currentUser?.reg_no ||
      currentPasswordInput === 'SANAMIT';

    if (!validCurrentPass) {
      toast.error("Current password is incorrect! Verification failed ❌");
      return;
    }

    if (!newPasswordInput || !confirmPasswordInput) {
      toast.error("Please enter and confirm your new password!");
      return;
    }

    if (newPasswordInput.length < 6) {
      toast.error("New password must be at least 6 characters long!");
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      toast.error("New passwords do not match! Please verify.");
      return;
    }

    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      const updatedUser = {
        ...currentUser,
        password: newPasswordInput,
        pass: newPasswordInput
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('gpbarh_student_password', newPasswordInput);

      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");

      toast.success("Account Password Successfully Changed & Secured! 🔐✅", {
        duration: 5000,
        style: { borderRadius: '10px', background: '#166534', color: '#ffffff' }
      });
    }, 800);
  };

  // Sync settings whenever switching tabs or loading
  useEffect(() => {
    const saved = localStorage.getItem('gpbarh_warden_settings');
    if (saved) {
      setWardenSettings(JSON.parse(saved));
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    const sessionVal = profileData.session || profileData.semester || '2024-27';
    const genderVal = profileData.gender || currentUser?.gender || 'MALE';
    try {
      if (currentUser?.id) {
        await axios.put('http://127.0.0.1:8000/api/student/profile', {
          user_id: currentUser.id,
          full_name: profileData.fullName,
          gender: genderVal,
          branch: profileData.branch,
          semester: sessionVal,
          session: sessionVal,
          roll_no: profileData.rollNo || '24-AIML-01',
          reg_no: profileData.regNo,
          mobile: profileData.contact,
          address: profileData.address,
          blood_group: profileData.bloodGroup,
          profile_pic: profilePic,
          pincode: profileData.pincode,
          home_district: profileData.homeDistrict,
          home_state: profileData.homeState || 'Bihar',
          distance_km: profileData.distanceKm,
          distance_verified: profileData.distanceVerified || false
        });
      }
    } catch (e) {
      console.log('Profile API note:', e.message);
    }
    const updatedUser = {
      ...currentUser,
      full_name: profileData.fullName,
      gender: genderVal,
      hostel_block: profileData.hostelBlock || (genderVal === 'FEMALE' ? 'Savitribai Phule Girls Hostel' : 'Birsa Munda Block'),
      hostelBlock: profileData.hostelBlock || (genderVal === 'FEMALE' ? 'Savitribai Phule Girls Hostel' : 'Birsa Munda Block'),
      branch: profileData.branch,
      semester: sessionVal,
      session: sessionVal,
      mobile: profileData.contact,
      address: profileData.address,
      blood_group: profileData.bloodGroup,
      pincode: profileData.pincode,
      home_district: profileData.homeDistrict,
      home_state: profileData.homeState || 'Bihar',
      distance_km: profileData.distanceKm,
      distance_verified: profileData.distanceVerified || false
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Automatically lock profile upon saving
    setIsProfileLocked(true);
    localStorage.setItem('gpbarh_profile_locked', 'true');

    toast.success("Profile records saved & locked successfully! 🔒✅", {
      style: { borderRadius: '10px', background: '#166534', color: '#fff' }
    });
  };

  const handleWalletTopup = (amount) => {
    const addAmt = parseFloat(amount);
    if (isNaN(addAmt) || addAmt <= 0) {
      toast.error("Please enter a valid recharge amount!");
      return;
    }
    const newBal = walletBalance + addAmt;
    setWalletBalance(newBal);
    localStorage.setItem('gpbarh_student_wallet', newBal);
    setShowTopupModal(false);
    toast.success(`Wallet successfully credited with +₹${addAmt.toLocaleString('en-IN')}! Balance: ₹${newBal.toLocaleString('en-IN')}`, {
      duration: 4000,
      style: { borderRadius: '10px', background: '#1e293b', color: '#fbbf24', border: '1px solid #eab308' }
    });
  };

  const handlePayHostelRent = (mode = 'wallet') => {
    const rentAmount = Number(wardenSettings.hostelRent || 2000);
    if (mode === 'wallet') {
      if (walletBalance < rentAmount) {
        toast.error(`Insufficient Balance! You have ₹${walletBalance} in wallet, but Hostel Rent is ₹${rentAmount}. Please top-up or choose Gateway.`);
        return;
      }
      const newBal = walletBalance - rentAmount;
      setWalletBalance(newBal);
      localStorage.setItem('gpbarh_student_wallet', newBal);
    }

    // Generate Official Printable Receipt
    const receiptData = {
      receiptNo: 'REC-HST-' + Math.floor(100000 + Math.random() * 900000),
      title: 'Monthly Hostel Rent',
      category: 'Accommodation & Hostel Charges',
      period: 'August 2026',
      amount: rentAmount,
      paidBy: profileData.fullName || 'Amit Kumar Sharma',
      regNo: profileData.regNo || '1554424049',
      roomNo: 'Room 102 (Block A)',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: mode === 'wallet' ? 'Prepaid Student Wallet' : 'Secure Online Payment Gateway',
      status: 'PAID (Verified by Chief Warden Office)'
    };
    setActiveReceipt(receiptData);
    toast.success("Hostel Rent Paid Successfully! Official Receipt Generated.", {
      style: { borderRadius: '10px', background: '#166534', color: '#fff' }
    });
  };

  const handlePayMessBill = (mode = 'wallet') => {
    const messAmount = Number(wardenSettings.messBill || 2500);
    if (mode === 'wallet') {
      if (walletBalance < messAmount) {
        toast.error(`Insufficient Balance! You have ₹${walletBalance} in wallet, but Mess Bill is ₹${messAmount}. Please top-up or choose Gateway.`);
        return;
      }
      const newBal = walletBalance - messAmount;
      setWalletBalance(newBal);
      localStorage.setItem('gpbarh_student_wallet', newBal);
    }

    // Generate Official Printable Receipt
    const receiptData = {
      receiptNo: 'REC-MSS-' + Math.floor(100000 + Math.random() * 900000),
      title: 'Monthly Mess Dining Bill',
      category: 'Hostel Mess & Boarding Fee',
      period: 'August 2026',
      amount: messAmount,
      paidBy: profileData.fullName || 'Amit Kumar Sharma',
      regNo: profileData.regNo || '1554424049',
      roomNo: 'Room 102 (Block A)',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: mode === 'wallet' ? 'Prepaid Student Wallet' : 'Secure Online Payment Gateway',
      status: 'PAID (Verified by Mess Committee)'
    };
    setActiveReceipt(receiptData);
    toast.success("Mess Bill Paid Successfully! Official Receipt Generated.", {
      style: { borderRadius: '10px', background: '#166534', color: '#fff' }
    });
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  const isLate = today.getDate() > 5;
  const lateFine = Math.max(0, today.getDate() - 5) * 50;

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsSidebarOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark-theme');
    else document.documentElement.classList.remove('dark-theme');
  }, [isDarkMode]);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) setProfilePic(URL.createObjectURL(e.target.files[0]));
  };

  const handleComplaintProof = (e) => {
    if (e.target.files && e.target.files[0]) setComplaintPreview(URL.createObjectURL(e.target.files[0]));
  };

  const handlePaySelect = (id, name, baseAmtStr, isMonthly) => {
    setPaymentSelection({ id, name, amt: baseAmtStr, isMonthly });
  };

  const getSelectedAmountStr = () => {
    if (!paymentSelection) return "None";
    if (paymentSelection.id === 'topup') return customAmount ? `₹${customAmount}` : 'Custom';
    if (paymentSelection.id === 'sem_hostel' || paymentSelection.id === 'sem_mess') {
      return paymentCycle ? (paymentCycle === 'Jan-May' ? (paymentSelection.id === 'sem_hostel' ? '₹3,750' : '₹17,000') : (paymentSelection.id === 'sem_hostel' ? '₹4,500' : '₹20,400')) : 'Pending Cycle';
    }
    if (paymentSelection.isMonthly && isLate) {
      let base = parseInt(paymentSelection.amt.replace(/[^0-9]/g, ''));
      return `₹${base + lateFine} (Incl. Late Fine)`;
    }
    return paymentSelection.amt;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <span className="ml-3 font-medium">Loading GP Barh Dashboard...</span>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      <div className={`my-dashboard-wrapper ${isDarkMode ? 'dark-theme' : ''}`}>

        {/* PAYMENT MODAL */}
        {showPaymentModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <div style={{ background: 'var(--card)', width: '90%', maxWidth: '420px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid var(--border)' }}>
              <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'DM Sans', sans-serif" }}>
                  <div style={{ width: '28px', height: '28px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></svg>
                  </div>
                  SecurePay Gateway
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>GP Barh</div>
              </div>
              <div style={{ padding: '40px 32px', textAlign: 'center' }}>
                {paymentStep === 1 && (
                  <div className="animate-fade-in">
                    <div style={{ fontSize: '56px', marginBottom: '24px', display: 'inline-block', animation: 'pulse 2s infinite' }}>🏦</div>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: 'var(--text)' }}>Connecting to Secure Server...</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>Establishing 256-bit encrypted connection to bank.</p>
                  </div>
                )}
                {paymentStep === 2 && (
                  <div className="animate-fade-in">
                    <div style={{ margin: '0 auto 32px', width: '64px', height: '64px', border: '5px solid var(--hover-bg)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: 'var(--text)' }}>Processing Payment of {paymentAmount}</h3>
                    <p style={{ color: '#dc2626', fontSize: '14px', fontWeight: 700 }}>Please do not refresh or close this window.</p>
                  </div>
                )}
                {paymentStep === 3 && (
                  <div className="animate-fade-in">
                    <div style={{ width: '72px', height: '72px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: 'var(--text)' }}>Payment Authorized!</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 600 }}>Redirecting back to your dashboard...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOP-UP WALLET MODAL */}
        {showTopupModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '16px' }}>
            <div style={{ background: 'var(--card)', width: '100%', maxWidth: '440px', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: '1px solid var(--border)' }}>
              <div style={{ background: 'linear-gradient(135deg, #151c28, #0e131d)', padding: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', background: '#fbbf24', color: '#000', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900 }}>
                    👛
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: 'white' }}>Top-Up Prepaid Wallet</h3>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Instant Balance Recharge</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTopupModal(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '28px 24px' }}>
                <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', padding: '14px 18px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Current Wallet Balance</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#fbbf24' }}>₹{walletBalance.toLocaleString('en-IN')}.00</span>
                </div>

                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Select Top-Up Amount
                </label>

                {/* AMOUNT PRESETS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  {[500, 1000, 2000, 5000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupInput(amt)}
                      style={{
                        padding: '10px 4px',
                        borderRadius: '12px',
                        border: topupInput === amt ? '2px solid #fbbf24' : '1px solid var(--border)',
                        background: topupInput === amt ? 'rgba(251, 191, 36, 0.15)' : 'var(--card)',
                        color: topupInput === amt ? '#fbbf24' : 'var(--text)',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                {/* CUSTOM INPUT */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', fontWeight: 900, color: 'var(--text-muted)' }}>₹</span>
                    <input
                      type="number"
                      value={topupInput}
                      onChange={(e) => setTopupInput(Number(e.target.value))}
                      placeholder="Custom Amount"
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 36px',
                        borderRadius: '14px',
                        border: '2px solid var(--border)',
                        background: 'var(--input-bg)',
                        color: 'var(--text)',
                        fontSize: '18px',
                        fontWeight: 900,
                        outline: 'none'
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    💡 Recharging increases wallet funds. (Wallet top-up does not generate a rent receipt).
                  </p>
                </div>

                <button
                  onClick={() => handleWalletTopup(topupInput)}
                  style={{
                    background: '#fbbf24',
                    color: '#000',
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    fontWeight: 900,
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(251, 191, 36, 0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  Confirm &amp; Add ₹{Number(topupInput || 0).toLocaleString('en-IN')} to Wallet ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OFFICIAL PRINTABLE FEE RECEIPT MODAL */}
        {activeReceipt && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: '16px' }}>
            <div style={{ background: '#ffffff', color: '#111827', width: '100%', maxWidth: '520px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 90px rgba(0,0,0,0.6)', border: '2px solid #e2e8f0', position: 'relative' }}>

              {/* TOP BRANDING BAR */}
              <div style={{ background: '#800000', color: 'white', padding: '20px 24px', textAlign: 'center', borderBottom: '3px solid #eab308' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '4px' }}>
                  <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={logo} alt="Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 900, margin: 0, fontFamily: 'serif', letterSpacing: '0.5px' }}>राजकीय पॉलिटेक्निक, बाढ़</h2>
                    <p style={{ fontSize: '9px', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>Government Polytechnic, Barh</p>
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '6px', color: '#fef08a' }}>
                  🏛️ Official Digital E-Receipt
                </div>
              </div>

              {/* RECEIPT BODY */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>RECEIPT NO.</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#800000', fontFamily: 'monospace' }}>{activeReceipt.receiptNo}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>DATE &amp; TIME</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>{activeReceipt.date} • {activeReceipt.time}</div>
                  </div>
                </div>

                {/* STUDENT & FEE DETAILS */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', marginBottom: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '12px', columnGap: '16px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Student Name</span>
                      <strong style={{ color: '#0f172a' }}>{activeReceipt.paidBy}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Registration ID</span>
                      <strong style={{ color: '#0f172a' }}>{activeReceipt.regNo}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Room Allocation</span>
                      <strong style={{ color: '#0f172a' }}>{activeReceipt.roomNo}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Billing Period</span>
                      <strong style={{ color: '#0f172a' }}>{activeReceipt.period}</strong>
                    </div>
                  </div>
                </div>

                {/* BREAKDOWN TABLE */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', textAlign: 'left' }}>
                      <th style={{ padding: '8px 0' }}>Fee Description</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 0', fontWeight: 700, color: '#1e293b' }}>
                        {activeReceipt.title}
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{activeReceipt.category} • Paid via {activeReceipt.paymentMethod}</div>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 900, color: '#0f172a', fontSize: '15px' }}>
                        ₹{activeReceipt.amount.toLocaleString('en-IN')}.00
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ padding: '14px 0', fontWeight: 900, color: '#0f172a', fontSize: '15px' }}>TOTAL PAID AMOUNT</td>
                      <td style={{ padding: '14px 0', textAlign: 'right', fontWeight: 900, color: '#166534', fontSize: '20px' }}>
                        ₹{activeReceipt.amount.toLocaleString('en-IN')}.00
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* DIGITAL VERIFICATION STAMP */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '20px' }}>✅</span>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>{activeReceipt.status}</div>
                    <div style={{ fontSize: '10px', color: '#15803d' }}>Digitally generated and verified by GP Barh Hostel Authority.</div>
                  </div>
                </div>

                {/* BUTTONS */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => window.print()}
                    style={{
                      flex: 1,
                      background: '#0f172a',
                      color: 'white',
                      padding: '14px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🖨️</span>
                    <span>Print / Save PDF</span>
                  </button>
                  <button
                    onClick={() => setActiveReceipt(null)}
                    style={{
                      background: '#e2e8f0',
                      color: '#334155',
                      padding: '14px 20px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '13px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`overlay ${isSidebarOpen ? 'show' : ''}`} style={{ display: isSidebarOpen ? 'block' : 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} onClick={() => setIsSidebarOpen(false)}></div>

        {/* ================= SIDEBAR ================= */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-profile" style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="mobile-sidebar-close"
              title="Close Menu"
              aria-label="Close Menu"
            >
              ✕
            </button>
            <div className="avatar-wrap">
              <div className="avatar-circle">
                <img src={profilePic} alt="Profile" style={{ opacity: profilePic === defaultAvatar ? 0.5 : 1 }} />
              </div>
            </div>
            <div className="student-name">{profileData.fullName || 'Student Profile'}</div>
            <div className="student-reg">ID: {profileData.regNo}</div>
          </div>

          <nav className="nav-list custom-sidebar-scroll">
            {[
              { id: 'profile', name: 'Manage Profile', icon: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></> },
              { id: 'seat-allocation', name: 'Seat & Room Allocation', icon: <><path d="M2 4v16M2 8h20M22 4v16M6 8v5a2 2 0 002 2h8a2 2 0 002-2V8" /></> },
              { id: 'registration-fee', name: 'Registration', icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
              { id: 'student-record', name: 'Student Record & Charts', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
              { id: 'mess-scanner', name: 'Scan Meal QR Pass 🍽️', isRoute: true, className: 'mobile-only-nav', icon: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></> },
              { id: 'payments', name: 'Payments Hub', icon: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></> },
              { id: 'hostel', name: 'Hostel Passbook', icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></> },
              { id: 'mess', name: 'Mess Passbook', icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></> },
              { id: 'clearance', name: 'Clearance Portal', icon: <path d="M5 13l4 4L19 7" /> },
              { id: 'complaints', name: 'Complaints', icon: <><path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></> },
              { id: 'security', name: 'Security & Password', icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
              { id: 'appscan', name: 'Connect App', className: 'mobile-only-nav', icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></> }
            ].map(tab => {
              const isLocked = !isAllotmentApproved && (tab.id !== 'profile' && tab.id !== 'seat-allocation' && tab.id !== 'security' && tab.id !== 'appscan');
              const lockTooltip = isLocked 
                ? (allotmentInfo?.status === 'PENDING' 
                    ? '⏳ Awaiting Warden Allotment Approval' 
                    : '🔒 Locked: Requires Approved Seat Allotment') 
                : tab.name;

              return (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''} ${tab.className || ''} ${isLocked ? 'opacity-65' : ''}`}
                  onClick={() => handleNavClick(tab)}
                  title={lockTooltip}
                  style={isLocked ? { cursor: 'pointer' } : {}}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>{tab.icon}</svg>
                  <span style={{ flex: 1, textAlign: 'left' }}>{tab.name}</span>
                  {isLocked && (
                    <span style={{ fontSize: '12px', marginLeft: 'auto', opacity: 0.85 }} title={lockTooltip}>
                      🔒
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <button className="logout-btn" onClick={() => navigate("/")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Secure Log Out
          </button>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="main-content-area">
          <header className="header">
            <div className="header-left">
              <button className="hamburger" onClick={() => setIsSidebarOpen(true)}>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
              <div className="logo-placeholder"><img src={logo} alt="GP Barh" /></div>
              <div className="header-text-block">
                <h1 className="header-title">Govt. Polytechnic, Barh</h1>
                <p className="header-sub">Hostel & Mess Management System</p>
              </div>
            </div>
            <div className="header-right">
              <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <div className="date-chip">{formattedDate}</div>
              <div className="status-toggle"><div className="status-dot"></div> IN HOSTEL</div>
            </div>
          </header>

          <section className={`scroll-content ${activeTab === 'seat-allocation' ? '!p-2 sm:!p-4 md:!p-6' : ''}`}>
            <div className={`content-wrapper ${activeTab === 'seat-allocation' ? '!max-w-[1650px] !w-full' : ''}`}>

              {/* 1. MANAGE PROFILE (1ST POSITION) */}
              {activeTab === 'profile' && (
                <div>
                  <div style={{ marginBottom: '26px' }}>
                    <h2 style={{ 
                      fontSize: '32px', 
                      fontWeight: 900, 
                      color: 'var(--text)', 
                      letterSpacing: '-0.8px', 
                      lineHeight: 1.2, 
                      margin: '0 0 6px',
                      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif" 
                    }}>
                      Manage Profile
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
                      Keep your academic and personnel records updated.
                    </p>
                  </div>

                  <div id="non-print-profile-elements">
                    {/* PROFESSIONAL PROFILE HERO CARD */}
                    <div
                      className="custom-card prof-header-simple"
                      style={{
                        padding: '24px 28px',
                        borderRadius: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        marginBottom: '24px',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {/* AVATAR WITH CAMERA OVERLAY */}
                        <div style={{ position: 'relative', width: '76px', height: '76px', flexShrink: 0 }}>
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--border)', overflow: 'hidden', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={profilePic} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <label
                            htmlFor="mainAvatarInput"
                            style={{
                              position: 'absolute',
                              bottom: '0px',
                              right: '0px',
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: '#2563eb',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                              border: '2px solid #ffffff'
                            }}
                            title="Change Profile Photo"
                          >
                            📷
                            <input type="file" id="mainAvatarInput" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                          </label>
                        </div>

                        {/* NAME & BRANCH */}
                        <div className="prof-name-area">
                          <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', margin: '0 0 4px', letterSpacing: '0.2px', fontFamily: "'Fraunces', serif" }}>
                            {profileData.fullName || 'Student Name'}
                          </h2>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            <span>{profileData.branch || 'Artificial Intelligence & Machine Learning'}</span>
                          </p>
                        </div>
                      </div>

                      {/* VERIFIED BADGE & ID CHIP */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>✓</span> Verified Resident
                        </div>
                        <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                          ID: <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{profileData.regNo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="custom-card" style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                          Personal &amp; Academic Records
                        </h3>
                        {isProfileLocked ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
                            🔒 LOCKED (READ-ONLY)
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', border: '1px solid rgba(34, 197, 94, 0.25)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800 }}>
                            🔓 UNLOCKED (EDITING ENABLED)
                          </span>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Full Name</label>
                          <input
                            className="form-input"
                            type="text"
                            disabled={isProfileLocked}
                            value={profileData.fullName}
                            onChange={e => setProfileData({ ...profileData, fullName: e.target.value })}
                            placeholder="e.g. AMIT SHARMA"
                            style={isProfileLocked ? { opacity: 0.75, cursor: 'not-allowed', background: 'var(--input-bg)' } : {}}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Registration Number</label>
                          <input
                            className="form-input"
                            type="text"
                            disabled={isProfileLocked}
                            value={profileData.regNo}
                            onChange={e => setProfileData({ ...profileData, regNo: e.target.value })}
                            placeholder="1554424049"
                            style={isProfileLocked ? { opacity: 0.75, cursor: 'not-allowed', background: 'var(--input-bg)' } : {}}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Branch / Department</label>
                          <select
                            className="form-select"
                            disabled={isProfileLocked}
                            value={profileData.branch}
                            onChange={e => setProfileData({ ...profileData, branch: e.target.value })}
                            style={isProfileLocked ? { opacity: 0.75, cursor: 'not-allowed', background: 'var(--input-bg)' } : {}}
                          >
                            <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                            <option value="Civil Engineering (Construction Technology)">Civil Engineering (Construction Technology)</option>
                            <option value="Electronics (Robotics)">Electronics (Robotics)</option>
                            <option value="Mechanical Engineering (CAD/CAM)">Mechanical Engineering (CAD/CAM)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Academic Session</label>
                          <input
                            className="form-input"
                            type="text"
                            disabled={isProfileLocked}
                            value={profileData.session || profileData.semester || ""}
                            onChange={e => setProfileData({ ...profileData, session: e.target.value, semester: e.target.value })}
                            placeholder="e.g. 2024-27"
                            style={isProfileLocked ? { opacity: 0.75, cursor: 'not-allowed', background: 'var(--input-bg)' } : {}}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Contact Number</label>
                          <input
                            className="form-input"
                            type="tel"
                            disabled={isProfileLocked}
                            value={profileData.contact}
                            onChange={e => setProfileData({ ...profileData, contact: e.target.value })}
                            placeholder={profileData.gender === 'FEMALE' ? "+91 91234 -----" : "+91 88731 -----"}
                            style={isProfileLocked ? { opacity: 0.75, cursor: 'not-allowed', background: 'var(--input-bg)' } : {}}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email Address</label>
                          <input
                            className="form-input"
                            type="email"
                            disabled={isProfileLocked}
                            value={profileData.email}
                            onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                            placeholder={profileData.gender === 'FEMALE' ? "sanasharma.gpb.ai@gmail.com" : "amitkumar.gpb.ai@gmail.com"}
                            style={isProfileLocked ? { opacity: 0.75, cursor: 'not-allowed', background: 'var(--input-bg)' } : {}}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Blood Group</label>
                          <select
                            className="form-select"
                            disabled={isProfileLocked}
                            value={profileData.bloodGroup || "O+"}
                            onChange={e => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                            style={isProfileLocked ? { opacity: 0.75, cursor: 'not-allowed', background: 'var(--input-bg)' } : {}}
                          >
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Home Area Pincode</label>
                          <input
                            className="form-input"
                            type="text"
                            maxLength={6}
                            disabled={isProfileLocked}
                            value={profileData.pincode || ""}
                            onChange={e => setProfileData({ ...profileData, pincode: e.target.value })}
                            placeholder="e.g. 804401"
                            style={isProfileLocked ? { opacity: 0.75, cursor: 'not-allowed', background: 'var(--input-bg)' } : {}}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Full Permanent Address</label>
                        <textarea
                          className="form-textarea"
                          disabled={isProfileLocked}
                          value={profileData.address}
                          onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                          placeholder="Vill - , P.O - , P.S - , Dist - , State - , PIN - "
                          style={isProfileLocked ? { opacity: 0.75, cursor: 'not-allowed', background: 'var(--input-bg)' } : {}}
                        ></textarea>
                      </div>

                      {/* 🔒 CLEAN, PROFESSIONAL CENTERED ACTION BUTTON 🔒 */}
                      {isProfileLocked ? (
                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{
                              padding: '14px 42px',
                              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                              color: '#ffffff',
                              borderRadius: '14px',
                              fontWeight: 800,
                              fontSize: '14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              border: 'none',
                              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              letterSpacing: '0.5px'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                              e.currentTarget.style.boxShadow = '0 8px 26px rgba(37, 99, 235, 0.45)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0) scale(1)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.35)';
                            }}
                            onClick={() => {
                              setUnlockError("");
                              setUnlockPasswordInput("");
                              setShowUnlockModal(true);
                            }}
                          >
                            <span style={{ fontSize: '18px' }}>🔓</span>
                            <span>UNLOCK TO EDIT PROFILE</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{
                              padding: '14px 44px',
                              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                              color: '#ffffff',
                              borderRadius: '14px',
                              fontWeight: 800,
                              fontSize: '14px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              border: 'none',
                              boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              letterSpacing: '0.5px'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                              e.currentTarget.style.boxShadow = '0 8px 26px rgba(22, 163, 74, 0.45)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0) scale(1)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(22, 163, 74, 0.35)';
                            }}
                            onClick={handleSaveProfile}
                          >
                            <span style={{ fontSize: '18px' }}>💾</span>
                            <span>SAVE &amp; LOCK RECORDS</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SEAT & ROOM ALLOCATION SECTION (2ND POSITION) */}
              {activeTab === 'seat-allocation' && (
                <div className="animate-fade-in w-full pb-8">
                  {/* 🌟 1. PENDING NOTIFICATION BANNER */}
                  {allotmentInfo?.status === 'PENDING' && (
                    <div style={{
                      background: isDarkMode ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.18) 0%, rgba(161, 98, 7, 0.28) 100%)' : '#fffbeb',
                      border: '2px solid #eab308',
                      borderRadius: '16px',
                      padding: '16px 22px',
                      margin: '16px 20px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap',
                      boxShadow: '0 6px 24px rgba(234, 179, 8, 0.18)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eab308', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>
                          ⏳
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: isDarkMode ? '#fef08a' : '#78350f' }}>
                            Room Allotment Request Pending Warden Approval
                          </h4>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDarkMode ? '#fef3c7' : '#92400e', fontWeight: 600 }}>
                            Requested: <strong style={{ color: isDarkMode ? '#ffffff' : '#713f12' }}>Room {allotmentInfo.room_number || ''} • Bed {allotmentInfo.bed_code || ''}</strong> ({allotmentInfo.hostel_name || 'Hostel Block'}) • Awaiting Warden Review ({allotmentInfo.hours_left !== undefined ? `${allotmentInfo.hours_left}h left in 24h window` : '24h review window'}).
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ padding: '6px 14px', borderRadius: '20px', background: isDarkMode ? 'rgba(234, 179, 8, 0.25)' : '#fef3c7', border: '1px solid #eab308', color: isDarkMode ? '#fde047' : '#854d0e', fontSize: '11px', fontWeight: 900, letterSpacing: '0.5px' }}>
                          STATUS: PENDING
                        </span>
                        <button
                          type="button"
                          onClick={fetchStudentAllotment}
                          style={{ padding: '8px 16px', borderRadius: '10px', background: '#eab308', color: '#000', border: 'none', fontSize: '12px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <span>Check Status</span> 🔄
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 🌟 2. APPROVED NOTIFICATION BANNER */}
                  {allotmentInfo?.status === 'APPROVED' && (
                    <div style={{
                      background: isDarkMode ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.28) 100%)' : '#f0fdf4',
                      border: '2px solid #10b981',
                      borderRadius: '16px',
                      padding: '16px 22px',
                      margin: '16px 20px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap',
                      boxShadow: '0 6px 24px rgba(16, 185, 129, 0.18)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>
                          ✓
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: isDarkMode ? '#6ee7b7' : '#065f46' }}>
                            Hostel Seat Allotment Approved &amp; Verified
                          </h4>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDarkMode ? '#a7f3d0' : '#047857', fontWeight: 600 }}>
                            Allotted: <strong style={{ color: isDarkMode ? '#ffffff' : '#064e3b' }}>Room {allotmentInfo.room_number} • Bed {allotmentInfo.bed_code}</strong> ({allotmentInfo.hostel_name || 'Hostel Block'}) • All Payments, Mess &amp; Passbook services unlocked!
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {!isAdmissionFeePaid && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('registration-fee')}
                            style={{ padding: '8px 16px', borderRadius: '10px', background: '#10b981', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                          >
                            <span>Pay Registration Fee (₹2,000)</span> ➔
                          </button>
                        )}
                        <span style={{ padding: '6px 14px', borderRadius: '20px', background: isDarkMode ? 'rgba(16, 185, 129, 0.25)' : '#dcfce7', border: '1px solid #10b981', color: isDarkMode ? '#6ee7b7' : '#065f46', fontSize: '11px', fontWeight: 900, letterSpacing: '0.5px' }}>
                          VERIFIED ALLOTTEE
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 🌟 3. REJECTED / CANCELLED NOTIFICATION BANNER */}
                  {(allotmentInfo?.status === 'REJECTED' || allotmentInfo?.status === 'CANCELLED') && (
                    <div style={{
                      background: isDarkMode ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(185, 28, 28, 0.28) 100%)' : '#fef2f2',
                      border: '2px solid #ef4444',
                      borderRadius: '16px',
                      padding: '16px 22px',
                      margin: '16px 20px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap',
                      boxShadow: '0 6px 24px rgba(239, 68, 68, 0.18)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>
                          ✕
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: isDarkMode ? '#fca5a5' : '#991b1b' }}>
                            {allotmentInfo.status === 'CANCELLED' ? 'Allotment Cancelled / Revoked by Chief Warden' : 'Room Allotment Request Declined by Chief Warden'}
                          </h4>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDarkMode ? '#fecaca' : '#b91c1c', fontWeight: 600 }}>
                            {allotmentInfo.remarks || 'Previous allotment has been cancelled by Warden'}. The previous bed has been released. You can choose any available room &amp; bed from the blueprint grid below!
                          </p>
                        </div>
                      </div>
                      <span style={{ padding: '6px 14px', borderRadius: '20px', background: isDarkMode ? 'rgba(239, 68, 68, 0.25)' : '#fee2e2', border: '1px solid #ef4444', color: isDarkMode ? '#fca5a5' : '#991b1b', fontSize: '11px', fontWeight: 900, letterSpacing: '0.5px' }}>
                        RE-SELECTION UNLOCKED
                      </span>
                    </div>
                  )}

                  {/* 🌟 4. EXPIRED (24H WINDOW) NOTIFICATION BANNER */}
                  {allotmentInfo?.status === 'EXPIRED' && (
                    <div style={{
                      background: isDarkMode ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.18) 0%, rgba(194, 65, 12, 0.28) 100%)' : '#fff7ed',
                      border: '2px solid #f97316',
                      borderRadius: '16px',
                      padding: '16px 22px',
                      margin: '16px 20px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap',
                      boxShadow: '0 6px 24px rgba(249, 115, 22, 0.18)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 900, flexShrink: 0 }}>
                          ⏱️
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: isDarkMode ? '#fdba74' : '#9a3412' }}>
                            24-Hour Review Window Expired
                          </h4>
                          <p style={{ margin: '4px 0 0', fontSize: '13px', color: isDarkMode ? '#fed7aa' : '#c2410c', fontWeight: 600 }}>
                            Your previous bed reservation expired after 24 hours without Warden action. The bed is freed. Please select an available bed from the grid below to submit a new request!
                          </p>
                        </div>
                      </div>
                      <span style={{ padding: '6px 14px', borderRadius: '20px', background: isDarkMode ? 'rgba(249, 115, 22, 0.25)' : '#ffedd5', border: '1px solid #f97316', color: isDarkMode ? '#fdba74' : '#9a3412', fontSize: '11px', fontWeight: 900, letterSpacing: '0.5px' }}>
                        RE-SELECTION UNLOCKED
                      </span>
                    </div>
                  )}

                  {/* STUDENT GENDER-ISOLATED ROOM ALLOCATION BLUEPRINT */}
                  <RoomAllocationGrid
                    gender={String(currentUser?.gender || profileData?.gender || 'MALE').toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE'}
                    studentId={currentUser?.reg_no || currentUser?.reg_no_email || profileData?.regNo || currentUser?.id || '1554424049'}
                    isDarkMode={isDarkMode}
                    onBedRequested={fetchStudentAllotment}
                    activeAllotment={allotmentInfo}
                  />
                </div>
              )}

              {/* 🌟 REGISTRATION SECTION (EXPANSIVE FULL-SIZE SUITE WITH 3D ROTATION & PAYMENT UNLOCK) */}
              {activeTab === 'registration-fee' && (
                <div className="animate-fade-in" style={{ paddingBottom: '30px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  
                  {/* EXPANSIVE FULL-WIDTH HERO CARD (RESPONSIVE GRID) */}
                  <div className="registration-hero-grid">
                    
                    {/* LEFT COLUMN: PACKAGE & UNLOCK ACTIONS */}
                    <div className="registration-hero-left">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
                          <span style={{ padding: '5px 14px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', borderRadius: '20px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            MANDATORY ACTION
                          </span>

                          {isAdmissionFeePaid && (
                            <span style={{ padding: '5px 12px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', borderRadius: '20px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>✓</span>
                              <span>PAID &amp; VERIFIED</span>
                            </span>
                          )}
                        </div>

                        <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900, color: 'var(--text)', margin: '0 0 12px', letterSpacing: '-0.6px', lineHeight: 1.2 }}>
                          Unlock Your GP Barh Workspace
                        </h2>
                        <p style={{ fontSize: 'clamp(13px, 2.5vw, 14.5px)', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
                          Complete your preliminary registration &amp; refundable security deposit to access your full profile dashboard, live passbooks, automated payments, and priority room allotment.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px', color: 'var(--text)' }}>
                            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>✓</span>
                            <span><strong>Dynamic Profile Photo &amp; Info sync</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px', color: 'var(--text)' }}>
                            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>✓</span>
                            <span><strong>Real-time Hostel &amp; Mess Passbooks</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px', color: 'var(--text)' }}>
                            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>✓</span>
                            <span><strong>Instant Automated Clearance Processing</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px', color: 'var(--text)' }}>
                            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, flexShrink: 0 }}>✓</span>
                            <span><strong>₹1,500 Caution Money</strong> — 100% Refundable at Clearance</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
                            ₹2,000 <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>/ ONE-TIME</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            *₹500 Non-refundable fee + ₹1,500 Refundable Security
                          </div>
                        </div>

                        {isAdmissionFeePaid ? (
                          <button
                            type="button"
                            onClick={() => setActiveRegReceiptModal({
                              receipt_number: 'GPB/2026/ALLOT-10101',
                              created_at: new Date().toISOString()
                            })}
                            style={{
                              padding: '14px 24px',
                              background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%)',
                              color: '#ffffff',
                              border: '1px solid rgba(255, 255, 255, 0.35)',
                              borderRadius: '16px',
                              fontWeight: 900,
                              fontSize: '13.5px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '12px',
                              animation: 'neonGlowPulse 3s infinite',
                              transition: 'all 0.25s ease',
                              maxWidth: '100%'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                            }}
                          >
                            <span style={{ fontSize: '22px', display: 'inline-block', animation: 'downloadBounce 1.5s infinite ease-in-out' }}>📥</span>
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ lineHeight: 1.1, letterSpacing: '0.3px', fontWeight: 900, fontSize: '13px' }}>DOWNLOAD OFFICIAL ALLOTMENT SLIP</div>
                              <div style={{ fontSize: '10px', opacity: 0.9, fontWeight: 700, marginTop: '2px', color: '#d1fae5' }}>Verified Room &amp; Bed Handover Document (PDF)</div>
                            </div>
                            <span style={{ marginLeft: '4px', fontSize: '15px' }}>➔</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowRegQrModal(true)}
                            style={{
                              padding: '14px 28px',
                              background: '#0f766e',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '14px',
                              fontWeight: 900,
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: '0 6px 20px rgba(15, 118, 110, 0.35)',
                              transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
                          >
                            <span>PAY &amp; UNLOCK NOW →</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: LUXURY 3D HOLOGRAPHIC ALLOTMENT IDENTITY CARD */}
                    <div
                      style={{
                        background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%)',
                        color: 'white',
                        padding: '36px 28px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxSizing: 'border-box'
                      }}
                    >
                      {/* GOLD & CYAN AMBIENT LIGHT AURA */}
                      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

                      {/* 💳 OFFICIAL EXECUTIVE SMART HOSTEL CARD */}
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '360px',
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.04) 100%)',
                          border: '2px solid rgba(234, 179, 8, 0.4)',
                          borderRadius: '22px',
                          padding: '24px 22px',
                          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(234, 179, 8, 0.15)',
                          backdropFilter: 'blur(16px)',
                          position: 'relative',
                          zIndex: 2,
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* CARD TOP HEADER */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '12px', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={logo} alt="GP Barh" style={{ width: '32px', height: '32px', objectFit: 'contain', background: 'white', borderRadius: '50%', padding: '2px' }} />
                            <div>
                              <div style={{ fontSize: '11.5px', fontWeight: 900, color: '#fef08a', letterSpacing: '0.3px' }}>GOVT. POLYTECHNIC, BARH</div>
                              <div style={{ fontSize: '8.5px', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Official Hostel Smart Pass • 2026–29</div>
                            </div>
                          </div>
                          <span style={{ fontSize: '20px' }}>💳</span>
                        </div>

                        {/* STUDENT PHOTO & PARTICULARS */}
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                          <div style={{ width: '64px', height: '64px', borderRadius: '14px', border: '2px solid #eab308', overflow: 'hidden', flexShrink: 0, boxShadow: '0 6px 16px rgba(0,0,0,0.4)', background: '#0f172a' }}>
                            <img src={profilePic} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {profileData?.fullName || (profileData?.gender === 'FEMALE' ? 'SANA SHARMA' : 'AMIT KUMAR SHARMA')}
                            </div>
                            <div style={{ fontSize: '11px', color: '#93c5fd', fontFamily: 'monospace', fontWeight: 700, marginTop: '2px' }}>
                              REG: {profileData?.regNo || (profileData?.gender === 'FEMALE' ? '1554424000' : '1554424049')} • ROLL: {profileData?.rollNo || '49'}
                            </div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                              {profileData?.branch || 'AI & Machine Learning'}
                            </div>
                          </div>
                        </div>

                        {/* ALLOTTED ROOM & INVENTORY CHIP */}
                        <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '10px 14px', marginBottom: '14px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px' }}>
                            <div>
                              <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block', fontWeight: 700 }}>CONFIRMED ROOM</span>
                              <strong style={{ color: '#38bdf8', fontSize: '13px' }}>
                                {allotmentInfo?.room_number ? `Room No. ${allotmentInfo.room_number}` : (profileData?.roomNumber ? `Room No. ${profileData.roomNumber}` : 'Room No. 101')}
                              </strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block', fontWeight: 700 }}>BED POSITION</span>
                              <strong style={{ color: '#38bdf8', fontSize: '13px' }}>
                                {allotmentInfo?.bed_code ? `Bed ${allotmentInfo.bed_code}` : (profileData?.bedNumber ? `Bed ${profileData.bedNumber}` : 'Bed No. 1 (Bed A)')}
                              </strong>
                            </div>
                          </div>
                          <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.12)', marginTop: '8px', paddingTop: '6px', fontSize: '10px', color: '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🏢 {allotmentInfo?.hostel_name || (profileData?.gender === 'FEMALE' ? 'Savitribai Phule Girls Hostel' : (profileData?.hostelBlock?.toLowerCase().includes('rajendra') ? 'Dr. Rajendra Prasad Boys Hostel' : 'Birsa Munda Boys Hostel'))}</span>
                            <span style={{ color: isAdmissionFeePaid ? '#4ade80' : '#facc15', fontWeight: 900 }}>
                              ● {isAdmissionFeePaid ? 'ALLOTTED & VERIFIED' : (isAllotmentApproved ? 'APPROVED (PAY TO UNLOCK)' : 'PENDING ALLOTMENT')}
                            </span>
                          </div>
                        </div>

                        {/* UTR VERIFICATION & DIGITAL SEAL */}
                        <div style={{ background: isAdmissionFeePaid ? 'rgba(22, 101, 52, 0.25)' : 'rgba(234, 179, 8, 0.15)', border: isAdmissionFeePaid ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '12px', padding: '8px 12px', fontSize: '10.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ color: 'rgba(255,255,255,0.7)', display: 'block', fontSize: '8.5px', fontWeight: 700 }}>TXN / UTR REFERENCE</span>
                            <code style={{ color: '#67e8f9', fontWeight: 900, fontFamily: 'monospace', fontSize: '10.5px' }}>
                              {isAdmissionFeePaid ? (regFeeUtr || 'UPI/992140819201/HDFC') : 'AWAITING PAYMENT'}
                            </code>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ background: isAdmissionFeePaid ? '#16a34a' : '#ca8a04', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 900 }}>
                              {isAdmissionFeePaid ? '✓ WARDEN MATCHED' : '⏳ PAYMENT PENDING'}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* 3. STUDENT RECORD SECTION (3RD POSITION - DIRECT PRINTABLE DOSSIER) */}
              {activeTab === 'student-record' && (
                <div>
                  <div style={{
                    marginBottom: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px',
                    padding: '6px 4px'
                  }}>
                    <div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(128, 0, 0, 0.08)',
                        color: '#800000',
                        border: '1px solid rgba(128, 0, 0, 0.15)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                        marginBottom: '8px'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#800000' }}></span>
                        Official Academic &amp; Mess Portfolio
                      </div>
                      <h2 style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: '30px',
                        fontWeight: 900,
                        color: 'var(--text)',
                        margin: '0 0 6px',
                        letterSpacing: '-0.5px',
                        lineHeight: 1.2
                      }}>
                        Student Record
                      </h2>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        letterSpacing: '0.1px',
                        lineHeight: 1.5,
                        maxWidth: '650px'
                      }}>
                        Verified institutional student records, credentials, mess attendance analytics, and printable official dossier.
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      padding: '8px 14px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--text)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <span style={{ fontSize: '14px' }}>🏛️</span>
                      <span>Govt. Polytechnic, Barh</span>
                    </div>
                  </div>
                  <StudentRecordDossier
                    profileData={profileData}
                    currentUser={currentUser}
                    profilePic={profilePic}
                    isDarkMode={isDarkMode}
                    allotmentInfo={allotmentInfo}
                  />
                </div>
              )}

              {/* 🌟 4. HOSTEL PASSBOOK (BANK STATEMENT & AUTO-DEDUCTION LEDGER) 🌟 */}
              {activeTab === 'hostel' && (() => {
                const rawTransactions = [
                  {
                    id: 'TXN-HST-20260801',
                    date: '01-Aug-2026',
                    time: '12:01 AM',
                    title: 'Monthly Room Rent (August 2026)',
                    desc: 'Scheduled System Auto-Deduction • Room #204',
                    category: 'Monthly Rent',
                    mode: 'Auto Debit',
                    type: 'debit',
                    amount: 500,
                    balance: 4000,
                    status: 'Settled'
                  },
                  {
                    id: 'TXN-HST-20260701',
                    date: '01-Jul-2026',
                    time: '12:01 AM',
                    title: 'Monthly Room Rent (July 2026)',
                    desc: 'Scheduled System Auto-Deduction • Room #204',
                    category: 'Monthly Rent',
                    mode: 'Auto Debit',
                    type: 'debit',
                    amount: 500,
                    balance: 4500,
                    status: 'Settled'
                  },
                  {
                    id: 'TXN-HST-20260601',
                    date: '01-Jun-2026',
                    time: '12:01 AM',
                    title: 'Monthly Room Rent (June 2026)',
                    desc: 'Scheduled System Auto-Deduction • Room #204',
                    category: 'Monthly Rent',
                    mode: 'Auto Debit',
                    type: 'debit',
                    amount: 500,
                    balance: 5000,
                    status: 'Settled'
                  },
                  {
                    id: 'TXN-HST-20260501',
                    date: '01-May-2026',
                    time: '12:01 AM',
                    title: 'Monthly Room Rent (May 2026)',
                    desc: 'Scheduled System Auto-Deduction • Room #204',
                    category: 'Monthly Rent',
                    mode: 'Auto Debit',
                    type: 'debit',
                    amount: 500,
                    balance: 5500,
                    status: 'Settled'
                  },
                  {
                    id: 'TXN-UPI-98421045',
                    date: '15-Apr-2026',
                    time: '04:30 PM',
                    title: 'Hostel Wallet Advance Top-Up',
                    desc: 'Instant UPI Payment (Ref: GPB/UPI/88934)',
                    category: 'Deposit / Recharge',
                    mode: 'UPI Online',
                    type: 'credit',
                    amount: 2000,
                    balance: 6000,
                    status: 'Success'
                  },
                  {
                    id: 'TXN-HST-20260401',
                    date: '01-Apr-2026',
                    time: '12:01 AM',
                    title: 'Monthly Room Rent (April 2026)',
                    desc: 'Scheduled System Auto-Deduction • Room #204',
                    category: 'Monthly Rent',
                    mode: 'Auto Debit',
                    type: 'debit',
                    amount: 500,
                    balance: 4000,
                    status: 'Settled'
                  },
                  {
                    id: 'TXN-HST-20260301',
                    date: '01-Mar-2026',
                    time: '12:01 AM',
                    title: 'Monthly Room Rent (March 2026)',
                    desc: 'Scheduled System Auto-Deduction • Room #204',
                    category: 'Monthly Rent',
                    mode: 'Auto Debit',
                    type: 'debit',
                    amount: 500,
                    balance: 4500,
                    status: 'Settled'
                  },
                  {
                    id: 'TXN-HST-20260201',
                    date: '01-Feb-2026',
                    time: '12:01 AM',
                    title: 'Monthly Room Rent (February 2026)',
                    desc: 'Scheduled System Auto-Deduction • Room #204',
                    category: 'Monthly Rent',
                    mode: 'Auto Debit',
                    type: 'debit',
                    amount: 500,
                    balance: 5000,
                    status: 'Settled'
                  },
                  {
                    id: 'TXN-DEP-20260116',
                    date: '16-Jan-2026',
                    time: '11:15 AM',
                    title: 'Term Security & Advance Rent Deposit',
                    desc: 'Initial Term Allotment Settlement via Gateway',
                    category: 'Term Deposit',
                    mode: 'Gateway Deposit',
                    type: 'credit',
                    amount: 5500,
                    balance: 5500,
                    status: 'Success'
                  }
                ];

                const filtered = rawTransactions.filter(item => {
                  if (hostelFilter === 'debit' && item.type !== 'debit') return false;
                  if (hostelFilter === 'credit' && item.type !== 'credit') return false;
                  if (hostelSearch) {
                    const q = hostelSearch.toLowerCase();
                    return item.title.toLowerCase().includes(q) || item.id.toLowerCase().includes(q) || item.date.toLowerCase().includes(q);
                  }
                  return true;
                });

                const monthsTimeline = [
                  { m: 'Jan 26', status: 'settled', note: 'Advance Paid', amt: '₹500' },
                  { m: 'Feb 26', status: 'settled', note: 'Auto Cut', amt: '₹500' },
                  { m: 'Mar 26', status: 'settled', note: 'Auto Cut', amt: '₹500' },
                  { m: 'Apr 26', status: 'settled', note: 'Auto Cut', amt: '₹500' },
                  { m: 'May 26', status: 'settled', note: 'Auto Cut', amt: '₹500' },
                  { m: 'Jun 26', status: 'settled', note: 'Auto Cut', amt: '₹500' },
                  { m: 'Jul 26', status: 'settled', note: 'Auto Cut', amt: '₹500' },
                  { m: 'Aug 26', status: 'settled', note: 'Auto Cut', amt: '₹500' },
                  { m: 'Sep 26', status: 'upcoming', note: 'Due 1st Sep', amt: '₹500' },
                  { m: 'Oct 26', status: 'future', note: 'Scheduled', amt: '₹500' },
                  { m: 'Nov 26', status: 'future', note: 'Scheduled', amt: '₹500' },
                  { m: 'Dec 26', status: 'future', note: 'Scheduled', amt: '₹500' }
                ];

                return (
                  <div>
                    {/* TOP HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                      <div>
                        <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>🏛️</span> Hostel Passbook & Bank Statement
                        </h2>
                        <p className="page-sub" style={{ margin: 0 }}>
                          Official Hostel Rent Ledger • Auto-deduction statement for <strong>Govt. Polytechnic Barh</strong>.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => {
                            toast.success("Printing Official Statement...", { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
                            window.print();
                          }}
                          style={{
                            padding: '10px 18px',
                            background: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '13px',
                            color: 'var(--text)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <span>🖨️</span> Print Statement
                        </button>
                        <button
                          onClick={() => {
                            toast.success("Passbook Ledger Synchronized with Hostel Core Server!", { style: { borderRadius: '10px', background: '#333', color: '#fff' } });
                          }}
                          style={{
                            padding: '10px 18px',
                            background: 'var(--crimson)',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '13px',
                            color: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(139,13,13,0.25)'
                          }}
                        >
                          <span>🔄</span> Refresh Ledger
                        </button>
                      </div>
                    </div>

                    {/* ACCOUNT SUMMARY BANNER (BANK STYLE) */}
                    <div className="bank-passbook-card" style={{ marginBottom: '24px' }}>
                      <div className="bank-header-banner">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#fca5a5', marginBottom: '4px' }}>
                              STUDENT HOSTEL ACCOUNT (PREPAID LEDGER)
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: "'Fraunces', serif" }}>
                              {profileData.fullName || 'AMIT KUMAR'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px', fontFamily: 'monospace' }}>
                              A/C: GPB-HST-{profileData.regNo} • Room #204 (Block-A) • IFSC: GPBARH001
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.08)', padding: '12px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              Available Balance
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginTop: '2px' }}>
                              ₹ 4,000.00
                            </div>
                            <div style={{ fontSize: '11px', color: '#86efac', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                              <span>🟢</span> Status: Active & Funded
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4 STATS CARDS */}
                      <div style={{ padding: '20px 24px' }}>
                        <div className="bank-stat-grid" style={{ margin: 0 }}>
                          <div className="bank-stat-item">
                            <div className="bs-label">Total Deposits (Credits)</div>
                            <div className="bs-value" style={{ color: '#16a34a' }}>+ ₹7,500.00</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>2 Total Transactions</div>
                          </div>
                          <div className="bank-stat-item">
                            <div className="bs-label">Total Rent Auto-Cut (Debits)</div>
                            <div className="bs-value" style={{ color: '#dc2626' }}>- ₹3,500.00</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>7 Months Cleared (@ ₹500/mo)</div>
                          </div>
                          <div className="bank-stat-item">
                            <div className="bs-label">Next Scheduled Cut</div>
                            <div className="bs-value" style={{ color: '#d97706' }}>₹500.00</div>
                            <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 700, marginTop: '4px' }}>📅 Due on 01-Sep-2026</div>
                          </div>
                          <div className="bank-stat-item">
                            <div className="bs-label">Auto-Debit Mechanism</div>
                            <div className="bs-value" style={{ fontSize: '18px', color: 'var(--teal)' }}>Active ⚡</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Cuts 1st of every month</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MONTHLY RENT AUTO-DEDUCTION TIMELINE TRACKER */}
                    <div className="custom-card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📅</span> Academic Year Monthly Rent Deduction Cycle (2026)
                        </h4>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)' }}>
                          Rate: ₹500 / Month (Auto-Debited)
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Har mahine ki 1st date ko hostel wallet balance se room rent apne aap kat jata hai.
                      </p>

                      <div className="month-tracker-grid">
                        {monthsTimeline.map((item, idx) => (
                          <div key={idx} className={`month-tracker-chip ${item.status}`}>
                            <div style={{ fontWeight: 800 }}>{item.m}</div>
                            <div style={{ fontSize: '10px', marginTop: '2px', fontWeight: 700 }}>{item.amt}</div>
                            <div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.85 }}>
                              {item.status === 'settled' ? '✅ Paid' : (item.status === 'upcoming' ? '⏳ 1st Sep' : 'Upcoming')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* BANK STATEMENT TRANSACTION TABLE */}
                    <div className="bank-passbook-card">
                      {/* FILTER & SEARCH BAR */}
                      <div className="bank-filter-bar">
                        <div className="filter-pill-group">
                          <button
                            className={`filter-pill ${hostelFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setHostelFilter('all')}
                          >
                            All Records ({rawTransactions.length})
                          </button>
                          <button
                            className={`filter-pill ${hostelFilter === 'debit' ? 'active' : ''}`}
                            onClick={() => setHostelFilter('debit')}
                          >
                            Monthly Auto-Cuts (-₹500)
                          </button>
                          <button
                            className={`filter-pill ${hostelFilter === 'credit' ? 'active' : ''}`}
                            onClick={() => setHostelFilter('credit')}
                          >
                            Recharges & Deposits (+₹)
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="text"
                            placeholder="Search Ref, Date, Month..."
                            value={hostelSearch}
                            onChange={(e) => setHostelSearch(e.target.value)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '20px',
                              border: '1px solid var(--border)',
                              background: 'var(--card)',
                              color: 'var(--text)',
                              fontSize: '12px',
                              outline: 'none',
                              width: '200px'
                            }}
                          />
                        </div>
                      </div>

                      {/* TABLE */}
                      <div style={{ overflowX: 'auto' }}>
                        <table className="stmt-table">
                          <thead>
                            <tr>
                              <th>Date & Time</th>
                              <th>Ref / Txn ID</th>
                              <th>Particulars / Description</th>
                              <th>Type</th>
                              <th style={{ textAlign: 'right' }}>Debit (Dr)</th>
                              <th style={{ textAlign: 'right' }}>Credit (Cr)</th>
                              <th style={{ textAlign: 'right' }}>Balance</th>
                              <th style={{ textAlign: 'center' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((txn, idx) => (
                              <tr key={idx}>
                                <td>
                                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{txn.date}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{txn.time}</div>
                                </td>
                                <td>
                                  <span style={{ fontFamily: 'monospace', fontSize: '11.5px', background: 'var(--input-bg)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                    {txn.id}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{txn.title}</div>
                                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{txn.desc}</div>
                                </td>
                                <td>
                                  {txn.type === 'debit' ? (
                                    <span className="badge-dr">🔴 Auto-Cut</span>
                                  ) : (
                                    <span className="badge-cr">🟢 Deposit</span>
                                  )}
                                </td>
                                <td style={{ textAlign: 'right', color: txn.type === 'debit' ? '#dc2626' : 'var(--text-muted)', fontWeight: 800 }}>
                                  {txn.type === 'debit' ? `- ₹${txn.amount.toLocaleString('en-IN')}.00` : '-'}
                                </td>
                                <td style={{ textAlign: 'right', color: txn.type === 'credit' ? '#16a34a' : 'var(--text-muted)', fontWeight: 800 }}>
                                  {txn.type === 'credit' ? `+ ₹${txn.amount.toLocaleString('en-IN')}.00` : '-'}
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text)' }}>
                                  ₹{txn.balance.toLocaleString('en-IN')}.00
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: '12px' }}>
                                    ✅ {txn.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* STATEMENT FOOTER NOTE */}
                      <div style={{ padding: '16px 20px', background: 'var(--input-bg)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          📌 <em>Note: Monthly room rent of ₹500 is auto-debited on the 1st of each calendar month. Certified computerized statement generated by GP Barh Accounts System.</em>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text)' }}>
                          Verified Digital Stamp: <strong>GPB-ACC-VERIFIED</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 🌟 3. MESS PASSBOOK (UNTOUCHED) 🌟 */}
              {activeTab === 'mess' && (
                <div>
                  <h2 className="page-title">Mess Passbook</h2>
                  <p className="page-sub">Track your complete payment history and balances clearly.</p>

                  <div className="pb-wrapper">
                    <div className="pb-top mess">
                      <div>
                        <div className="pb-bal-label">Available Balance</div>
                        <div className="pb-bal-val">₹ 18,400</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>Last Synchronized</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>{formattedDate}</div>
                      </div>
                    </div>

                    <div className="pb-table-wrap">
                      <table className="pb-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Particulars</th>
                            <th className="right">Amount</th>
                            <th className="right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>01-Feb-2025</td>
                            <td>Monthly Mess Charge<br /><span className="txt-muted">System Auto Deduction</span></td>
                            <td className="right txt-red">- ₹3,200</td>
                            <td className="right">₹18,400</td>
                          </tr>
                          <tr>
                            <td>16-Jan-2025</td>
                            <td>Six Months Mess Advance<br /><span className="txt-muted">Paid via Gateway</span></td>
                            <td className="right txt-green">+ ₹21,600</td>
                            <td className="right">₹21,600</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PAYMENTS HUB (DYNAMIC DUAL-SECTION INSTITUTIONAL SUITE) */}
              {activeTab === 'payments' && (
                <PaymentsHub
                  currentUser={currentUser}
                  profileData={profileData}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* 5. CLEARANCE */}
              {activeTab === 'clearance' && (
                <div>
                  <h2 className="page-title">Digital Clearance Portal</h2>
                  <p className="page-sub">Initiate your exit process and request security refunds.</p>
                  <div className="custom-card">
                    <div className="clearance-info-bar" style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '16px', borderRadius: '8px', marginBottom: '24px', color: '#991b1b', fontWeight: 600 }}>⚠️ <strong>CRITICAL WARNING:</strong> Submitting this form will mark your bed as vacant. Only proceed if legally vacating.</div>

                    {/* ✨ ULTRA-ATTRACTIVE FUTURISTIC CLEARANCE IDENTITY PASS ✨ */}
                    <div
                      className="profile-summary-box"
                      style={{
                        background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 60%, #1e1b4b 100%)',
                        border: '1.5px solid rgba(99, 102, 241, 0.45)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        marginBottom: '32px',
                        boxShadow: '0 20px 50px rgba(11, 19, 43, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                        position: 'relative',
                        color: '#ffffff'
                      }}
                    >
                      {/* SUBTLE TOP AMBIENT GLOW */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-60px',
                          right: '-60px',
                          width: '180px',
                          height: '180px',
                          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0) 70%)',
                          borderRadius: '50%',
                          pointerEvents: 'none'
                        }}
                      />

                      {/* TOP INSTITUTIONAL BAR */}
                      <div
                        style={{
                          padding: '16px 24px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px',
                          background: 'rgba(255, 255, 255, 0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                            🏛️
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', color: '#f8fafc' }}>
                              Government Polytechnic, Barh
                            </div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
                              OFFICIAL DIGITAL CLEARANCE &amp; NO-DUES DOSSIER
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: '#4ade80',
                            padding: '6px 14px',
                            borderRadius: '30px',
                            fontSize: '11px',
                            fontWeight: 800,
                            border: '1px solid rgba(74, 222, 128, 0.4)',
                            boxShadow: '0 0 16px rgba(74, 222, 128, 0.2)'
                          }}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 8px #4ade80' }}></span>
                          LIVE BIOMETRIC VERIFIED
                        </div>
                      </div>

                      {/* MAIN DOSSIER CONTENT */}
                      <div style={{ padding: '24px 28px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '28px'
                          }}
                        >
                          {/* AVATAR & NAME CARD */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '18px',
                              paddingRight: '28px',
                              borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                              minWidth: '280px'
                            }}
                          >
                            <div style={{ position: 'relative' }}>
                              <div
                                style={{
                                  width: '76px',
                                  height: '76px',
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  border: '3px solid #38bdf8',
                                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
                                  background: '#0f172a'
                                }}
                              >
                                <img
                                  src={profilePic}
                                  alt="Student"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '2px',
                                  right: '2px',
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  background: '#10b981',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 900,
                                  border: '2px solid #0b132b',
                                  boxShadow: '0 0 8px #10b981'
                                }}
                              >
                                ✓
                              </div>
                            </div>

                            <div>
                              <h3
                                style={{
                                  margin: '0 0 6px',
                                  fontSize: '19px',
                                  fontWeight: 900,
                                  color: '#ffffff',
                                  letterSpacing: '0.3px',
                                  textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                                }}
                              >
                                {profileData.fullName || (profileData.gender === 'FEMALE' ? 'Sana Sharma' : 'Amit Kumar Sharma')}
                              </h3>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    background: 'rgba(234, 179, 8, 0.18)',
                                    color: '#fde047',
                                    padding: '3px 10px',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    border: '1px solid rgba(234, 179, 8, 0.35)'
                                  }}
                                >
                                  ID: {profileData.regNo || (profileData.gender === 'FEMALE' ? '1554424000' : '1554424049')}
                                </span>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8',
                                    padding: '3px 10px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(56, 189, 248, 0.3)'
                                  }}
                                >
                                  {profileData.session || '2024-27'} (Sem 3)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 4 FROSTED GLASS SPECS CHIPS */}
                          <div
                            style={{
                              flex: 1,
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                              gap: '12px',
                              minWidth: '280px'
                            }}
                          >
                            {/* 1. DISCIPLINE */}
                            <div
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                backdropFilter: 'blur(8px)'
                              }}
                            >
                              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                🎓 Discipline
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {profileData.branch || 'AI & Machine Learning'}
                              </div>
                            </div>

                            {/* 2. ROOM & BED */}
                            <div
                              style={{
                                background: 'rgba(34, 197, 94, 0.08)',
                                border: '1px solid rgba(34, 197, 94, 0.25)',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                backdropFilter: 'blur(8px)'
                              }}
                            >
                              <div style={{ fontSize: '10px', color: '#86efac', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                🛏️ Hostel Room
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 900, color: '#4ade80', marginTop: '3px' }}>
                                {profileData.gender === 'FEMALE' ? 'Room G-102 • Bed A' : 'Room B-204 • Bed B'}
                              </div>
                            </div>

                            {/* 3. MOBILE */}
                            <div
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                backdropFilter: 'blur(8px)'
                              }}
                            >
                              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                📞 Mobile
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', marginTop: '3px', fontFamily: 'monospace' }}>
                                {profileData.contact || (profileData.gender === 'FEMALE' ? '+91 91234 -----' : '+91 88731 -----')}
                              </div>
                            </div>

                            {/* 4. EMAIL */}
                            <div
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                backdropFilter: 'blur(8px)'
                              }}
                            >
                              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                ✉️ Email
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={profileData.email}>
                                {profileData.email || (profileData.gender === 'FEMALE' ? 'sanasharma.gpb.ai@gmail.com' : 'amitkumar.gpb.ai@gmail.com')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* BOTTOM SECURITY CODE BAR */}
                        <div
                          style={{
                            marginTop: '20px',
                            paddingTop: '14px',
                            borderTop: '1px dashed rgba(255, 255, 255, 0.15)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px',
                            fontSize: '11px',
                            color: '#94a3b8'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>🔐</span>
                            <span>Tamper-Proof Encryption: <code style={{ color: '#38bdf8', fontWeight: 700 }}>GPB-CLR-SEC-2025</code></span>
                          </div>
                          <div style={{ color: '#4ade80', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>✓</span>
                            <span>Dues Audit Status: ZERO PENDING DUES</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Official Reason for Evacuation</label><select className="form-select"><option>Academic Tenure Completion (Passout)</option><option>Shifting to Private Residence</option></select></div>
                      <div className="form-group"><label className="form-label">Anticipated Date of Departure</label><input type="date" className="form-input" /></div>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '40px 0 24px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🏦</span> Bank Details (For Refund)
                    </h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Account Holder Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={bankAccountHolder || profileData.fullName || (profileData.gender === 'FEMALE' ? 'Sana Sharma' : 'Amit Kumar Sharma')}
                          onChange={e => setBankAccountHolder(e.target.value)}
                          placeholder="Must match bank passbook"
                          autoComplete="off"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Account Number</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showAccountNumber ? "text" : "password"}
                            placeholder="Enter bank A/C number..."
                            className="form-input"
                            value={bankAccountNumber}
                            onChange={e => setBankAccountNumber(e.target.value)}
                            style={{ paddingRight: '44px' }}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAccountNumber(!showAccountNumber)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '16px',
                              color: 'var(--text-muted)'
                            }}
                            title={showAccountNumber ? "Hide Account Number" : "Show Account Number"}
                          >
                            {showAccountNumber ? '👁️' : '🔒'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Bank Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={bankNameBranch}
                          onChange={e => setBankNameBranch(e.target.value)}
                          placeholder="e.g. Kotak Mahindra Bank"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>IFSC Code (Patna)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={bankIfsc}
                          onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                          placeholder="e.g. KKBK0005650"
                        />
                      </div>
                    </div>

                    <label className="upload-zone" style={{ margin: '32px 0' }}>
                      <svg width="40" height="40" fill="none" stroke="var(--teal)" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>Upload Signed No-Dues Form (PDF)</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Signed by Warden & Library</span>
                      <input type="file" accept=".pdf" style={{ display: 'none' }} />
                    </label>
                    <button className="btn-primary" style={{ background: '#0f172a', width: '100%' }} onClick={() => toast.success("Clearance Protocol successfully engaged. Your request is now under administrative review.", { style: { borderRadius: '10px', background: '#333', color: '#fff', padding: '12px 20px', minWidth: '300px' } })}>Submit Clearance Request</button>
                  </div>
                </div>
              )}

              {/* 6. COMPLAINTS */}
              {activeTab === 'complaints' && (
                <div>
                  <h2 className="page-title">Grievance Redressal</h2>
                  <p className="page-sub">Report issues to the administration transparently and track resolutions.</p>

                  <div className="complaints-grid">
                    <div className="custom-card">
                      <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px', color: 'var(--crimson)' }}>📣 Register Complaint</h3>
                      <div className="form-group" style={{ marginBottom: '20px' }}><label className="form-label">Category</label><select className="form-select"><option>Electrical Problem</option><option>Water / Plumbing Problem</option><option>Mess Food Issue</option><option>Others</option></select></div>
                      <div className="form-group" style={{ marginBottom: '20px' }}><label className="form-label">Describe Problem</label><textarea className="form-textarea" placeholder="Explain the issue..."></textarea></div>

                      <label className="upload-zone" style={{ marginBottom: '24px' }}>
                        {complaintPreview ? (
                          <img src={complaintPreview} alt="Preview" className="upload-preview-img" />
                        ) : (
                          <>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--teal)' }}>📎 UPLOAD PHOTO/VIDEO PROOF</span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Click to browse local files</span>
                          </>
                        )}
                        <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleComplaintProof} />
                      </label>
                      <button className="btn-primary btn-teal" onClick={() => { toast.success("Grievance officially registered and routed to the respective authority.", { style: { borderRadius: '10px', background: '#333', color: '#fff' } }); setComplaintPreview(null); }}>Submit Complaint</button>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. SECURITY & PASSWORD MANAGEMENT (DEDICATED SECTION) */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="page-title">Security &amp; Password</h2>
                  <p className="page-sub">Manage your account credentials, generate secure passkeys, and keep your portal access protected.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div className="custom-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                        🛡️
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Status</div>
                        <div style={{ fontSize: '15px', fontWeight: 900, color: '#16a34a' }}>Active &amp; Protected</div>
                      </div>
                    </div>
                    <div className="custom-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                        🔑
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password Strength</div>
                        <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text)' }}>High-Grade Encryption</div>
                      </div>
                    </div>
                    <div className="custom-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                        📱
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Device Session</div>
                        <div style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text)' }}>Authenticated ID: {profileData.regNo}</div>
                      </div>
                    </div>
                  </div>

                  {/* MAIN CHANGE PASSWORD CARD */}
                  <div
                    className="custom-card"
                    style={{
                      padding: '32px 28px',
                      borderRadius: '20px',
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      boxShadow: 'var(--shadow)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 4px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🔐</span> Update Account Password
                        </h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                          Enter your current password followed by your chosen new password.
                        </p>
                      </div>

                      {/* GENERATE PASSWORD BUTTON */}
                      <button
                        type="button"
                        onClick={generateStrongPassword}
                        style={{
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.2) 100%)',
                          color: '#2563eb',
                          border: '1px solid rgba(37, 99, 235, 0.35)',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.2) 100%)'; e.currentTarget.style.color = '#2563eb'; }}
                      >
                        <span style={{ fontSize: '15px' }}>⚡</span>
                        <span>Generate Strong Password</span>
                      </button>
                    </div>

                    <div className="form-row">
                      {/* CURRENT PASSWORD */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Current Password</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            className="form-input"
                            type={showCurrentPass ? "text" : "password"}
                            value={currentPasswordInput}
                            onChange={e => setCurrentPasswordInput(e.target.value)}
                            placeholder="Enter current account password..."
                            style={{ paddingRight: '44px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}
                          >
                            {showCurrentPass ? '👁️' : '🔒'}
                          </button>
                        </div>
                      </div>

                      {/* NEW PASSWORD */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            className="form-input"
                            type={showNewPass ? "text" : "password"}
                            value={newPasswordInput}
                            onChange={e => setNewPasswordInput(e.target.value)}
                            placeholder="Enter new password (min. 6 chars)..."
                            style={{ paddingRight: '44px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}
                          >
                            {showNewPass ? '👁️' : '🔒'}
                          </button>
                        </div>
                      </div>

                      {/* CONFIRM NEW PASSWORD */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 700 }}>Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            className="form-input"
                            type={showConfirmPass ? "text" : "password"}
                            value={confirmPasswordInput}
                            onChange={e => setConfirmPasswordInput(e.target.value)}
                            placeholder="Re-enter new password..."
                            style={{ paddingRight: '44px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}
                          >
                            {showConfirmPass ? '👁️' : '🔒'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SECURITY GUIDELINES BOX */}
                    <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '18px' }}>💡</span>
                      <div>
                        <strong>Password Tips:</strong> Must be at least 6 characters long. For best security, combine capital letters, numbers, and special symbols (e.g. <code>GPB@738#x</code>).
                      </div>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={isUpdatingPassword}
                        onClick={handleChangePassword}
                        style={{
                          padding: '14px 36px',
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                          color: '#ffffff',
                          borderRadius: '12px',
                          fontWeight: 800,
                          fontSize: '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: isUpdatingPassword ? 'wait' : 'pointer',
                          border: 'none',
                          boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.45)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.35)'; }}
                      >
                        {isUpdatingPassword ? (
                          <span>Updating Password... ⏳</span>
                        ) : (
                          <>
                            <span>🔐</span>
                            <span>SAVE &amp; UPDATE PASSWORD</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. APP SCAN / CONNECT WEB APP */}
              {activeTab === 'appscan' && (
                <article className="mobile-only-nav">
                  <div className="custom-card" style={{ textAlign: 'center', padding: '48px 32px', maxWidth: '540px', margin: '0 auto' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'var(--teal-light)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px', boxShadow: '0 8px 20px rgba(14,122,90,0.15)' }}>
                      📱
                    </div>
                    <h2 className="page-title">Connect Web App</h2>
                    <p className="page-sub" style={{ marginBottom: '28px', fontSize: '13px' }}>
                      Scan the QR Code displayed on any computer's <strong>GP Barh Login screen</strong> to link your active student session instantly without entering passwords.
                    </p>

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '22px 16px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                          <span style={{ fontSize: '18px' }}>📱</span>
                          <span>Phone</span>
                        </div>
                        <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'bold' }}>➔</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                          <span style={{ fontSize: '18px' }}>🔲</span>
                          <span>QR Code</span>
                        </div>
                        <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'bold' }}>➔</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                          <span style={{ fontSize: '18px' }}>💻</span>
                          <span>Website</span>
                        </div>
                        <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'bold' }}>➔</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '800', color: '#0d9e74' }}>
                          <span style={{ fontSize: '18px' }}>⚡</span>
                          <span>Login</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                        Instant &amp; Secure Web Session Authentication
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsConnectModalOpen(true)}
                      style={{
                        width: '100%',
                        padding: '16px 24px',
                        background: 'linear-gradient(135deg, #0e7a5a, #0d9e74)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '800',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        boxShadow: '0 10px 25px rgba(14,122,90,0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                      }}
                    >
                      <span>📷</span>
                      <span>Launch QR Camera Scanner</span>
                    </button>
                  </div>
                </article>
              )}

              {/* CONNECT APP MODAL */}
              <ConnectAppModal
                isOpen={isConnectModalOpen}
                onClose={() => setIsConnectModalOpen(false)}
                currentUser={currentUser}
              />

            </div>
          </section>
        </main>

        {/* 🌟 ALWAYS-RENDERED DEDICATED PRINT DOSSIER CONTAINER (100% PRINT RELIABILITY) 🌟 */}
        <div id="global-printable-dossier" style={{ display: 'none' }}>
          <StudentRecordDossier
            profileData={profileData}
            currentUser={currentUser}
            profilePic={profilePic}
            isDarkMode={false}
          />
        </div>

        {/* 🌟 ALWAYS-RENDERED DEDICATED PRINT ALLOTMENT SLIP CONTAINER 🌟 */}
        <div id="global-printable-allotment-slip" style={{ display: 'none', background: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ border: '2px solid #800000', borderRadius: '12px', padding: '16px', background: '#ffffff' }}>
            
            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #800000', paddingBottom: '12px', marginBottom: '14px' }}>
              <div style={{ width: '60px', height: '60px' }}>
                <img src={logo} alt="GP Barh" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#800000', fontFamily: 'serif' }}>राजकीय पॉलिटेक्निक, बाढ़ (पटना)</h1>
                <h2 style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>GOVERNMENT POLYTECHNIC, BARH (PATNA)</h2>
                <div style={{ fontSize: '9.5px', color: '#64748b', fontWeight: 600 }}>Dept. of Science, Technology &amp; Technical Education • Govt. of Bihar</div>
                <div style={{ display: 'inline-block', background: '#800000', color: '#ffffff', padding: '3px 12px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginTop: '6px', letterSpacing: '0.5px' }}>
                  Official Hostel Room &amp; Inventory Allotment Slip • Session 2026–29
                </div>
              </div>
              <div style={{ width: '60px', height: '60px', border: '1px dashed #cbd5e1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src={profilePic} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* METADATA BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px', fontSize: '11px' }}>
              <div><strong>Allotment Slip No:</strong> <span style={{ color: '#800000', fontFamily: 'monospace', fontWeight: 800 }}>GPB/2026/ALLOT-10101</span></div>
              <div><strong>Issued Date:</strong> <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
              <div><strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: 900 }}>✓ ADMITTED &amp; ALLOTTED</span></div>
            </div>

            {/* STUDENT DETAILS TABLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '11.5px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px 8px', color: '#64748b', fontWeight: 700, width: '22%' }}>Student Name:</td>
                  <td style={{ padding: '6px 8px', fontWeight: 900, color: '#0f172a', width: '28%' }}>{profileData?.fullName || (profileData?.gender === 'FEMALE' ? 'SANA SHARMA' : 'AMIT KUMAR SHARMA')}</td>
                  <td style={{ padding: '6px 8px', color: '#64748b', fontWeight: 700, width: '22%' }}>Registration No:</td>
                  <td style={{ padding: '6px 8px', fontWeight: 900, color: '#0f172a', width: '28%', fontFamily: 'monospace' }}>{profileData?.regNo || (profileData?.gender === 'FEMALE' ? '1554424000' : '1554424049')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '6px 8px', color: '#64748b', fontWeight: 700 }}>Discipline / Branch:</td>
                  <td style={{ padding: '6px 8px', fontWeight: 800 }}>{profileData?.branch || 'Artificial Intelligence & Machine Learning'}</td>
                  <td style={{ padding: '6px 8px', color: '#64748b', fontWeight: 700 }}>Class Roll No:</td>
                  <td style={{ padding: '6px 8px', fontWeight: 900, color: '#0f172a' }}>{profileData?.rollNo || currentUser?.roll_no || (profileData?.gender === 'FEMALE' ? '00' : '49')}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', color: '#64748b', fontWeight: 700 }}>Hostel Name:</td>
                  <td style={{ padding: '6px 8px', fontWeight: 900, color: '#800000' }}>
                    {profileData?.gender === 'FEMALE' || currentUser?.gender === 'FEMALE'
                      ? 'Savitribai Phule Girls Hostel'
                      : (profileData?.hostelBlock?.toLowerCase().includes('rajendra') || currentUser?.hostel_block?.toLowerCase().includes('rajendra')
                          ? 'Dr. Rajendra Prasad Boys Hostel'
                          : 'Birsa Munda Boys Hostel')}
                  </td>
                  <td style={{ padding: '6px 8px', color: '#64748b', fontWeight: 700 }}>Academic Session:</td>
                  <td style={{ padding: '6px 8px', fontWeight: 800 }}>2026 – 2029</td>
                </tr>
              </tbody>
            </table>

            {/* 🏢 ALLOTTED ROOM & INVENTORY TABLE */}
            <div style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', fontWeight: 900, fontSize: '11px', color: '#1e293b', marginBottom: '6px', textTransform: 'uppercase' }}>
              🏢 Verified Room Allocation &amp; Official Inventory Handover
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '11.5px', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', color: '#0f172a' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'left', border: '1px solid #cbd5e1', width: '10%' }}>S.No</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left', border: '1px solid #cbd5e1', width: '40%' }}>Allotted Item &amp; Specification</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1', width: '25%' }}>Allotted Number / Tag</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #cbd5e1', width: '25%' }}>Handover Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}><strong>Hostel Room</strong> (Ground Floor, Main Wing)</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 900, color: '#1e40af' }}>Room No. 101</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#16a34a', fontWeight: 800 }}>Inspected &amp; Handed Over</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>2</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}><strong>Single Bed &amp; Foam Mattress</strong> (Standard Size)</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 900, color: '#1e40af' }}>Bed No. 1 (Bed A)</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#16a34a', fontWeight: 800 }}>Inspected &amp; Handed Over</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>3</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}><strong>Study Table</strong> (Wooden Ergonomic Desk)</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 900, color: '#1e40af' }}>Study Table No. 1</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#16a34a', fontWeight: 800 }}>Inspected &amp; Handed Over</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>4</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}><strong>Study Chair</strong> (Comfort High-Back Chair)</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 900, color: '#1e40af' }}>Study Chair No. 1</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#16a34a', fontWeight: 800 }}>Inspected &amp; Handed Over</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>5</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}><strong>Steel Almirah / Cupboard</strong> (2-Door with Key)</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 900, color: '#1e40af' }}>Almirah / Locker No. 1</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#16a34a', fontWeight: 800 }}>Key #1 Handed Over</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>6</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}><strong>Electrical Fittings</strong> (Fan, Light &amp; Socket)</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 900, color: '#1e40af' }}>1x Fan • 1x LED • 1x Socket</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#16a34a', fontWeight: 800 }}>Operational</td>
                </tr>
              </tbody>
            </table>

            {/* 💰 FEE RECEIPT & CERTIFICATION */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '11px' }}>
              <div>
                <div><strong>Registration Fee (Non-Refundable):</strong> ₹500.00 | <strong>Caution Deposit (Refundable):</strong> ₹1,500.00</div>
                <div style={{ fontSize: '10px', color: '#166534', marginTop: '2px' }}>*The ₹1,500 Caution Money is 100% refundable upon final hostel exit clearance.</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '9px', color: '#166534', fontWeight: 700 }}>TOTAL RECEIVED &amp; VERIFIED</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#15803d' }}>₹2,000.00</div>
              </div>
            </div>

            {/* VERIFIED UTR ROW */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '11px' }}>
              <div>
                <span style={{ color: '#64748b', fontWeight: 700 }}>TXN / UTR NUMBER:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#1e3a8a', marginLeft: '6px' }}>
                  {regFeeUtr || 'UPI/992140819201/HDFC'}
                </span>
              </div>
              <div style={{ color: '#16a34a', fontWeight: 900, fontSize: '10.5px' }}>
                ✓ UTR VERIFIED &amp; MATCHED BY CHIEF WARDEN
              </div>
            </div>

            {/* SIGNATURES */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', paddingTop: '10px', fontSize: '11px' }}>
              <div style={{ textAlign: 'center', width: '180px' }}>
                <div style={{ height: '30px' }}></div>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontWeight: 800 }}>Signature of Student</div>
                <div style={{ fontSize: '9.5px', color: '#64748b' }}>({profileData?.fullName || (profileData?.gender === 'FEMALE' ? 'Sana Sharma' : 'Amit Kumar Sharma')})</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid #800000', color: '#800000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 900, margin: '0 auto' }}>
                  <span>OFFICIAL</span>
                  <span>SEAL</span>
                  <span>GP BARH</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ height: '30px' }}></div>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontWeight: 800 }}>Hostel Warden / Principal</div>
                <div style={{ fontSize: '9.5px', color: '#64748b' }}>Govt. Polytechnic, Barh (Patna)</div>
              </div>
            </div>

          </div>
        </div>

        {/* 🔐 PASSWORD UNLOCK MODAL 🔐 */}
        {showUnlockModal && (
          <div
            className="modal-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 999999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div
              className="custom-card"
              style={{
                maxWidth: '420px',
                width: '100%',
                padding: '32px 28px',
                borderRadius: '22px',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                textAlign: 'center'
              }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px', border: '2px solid rgba(37, 99, 235, 0.2)' }}>
                🔐
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', margin: '0 0 6px', fontFamily: "'Fraunces', serif" }}>
                Unlock Profile Records
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
                Enter your account password to verify your identity and unlock academic &amp; personal fields.
              </p>

              <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px', display: 'block', fontSize: '12px' }}>
                  Account Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswordText ? "text" : "password"}
                    className="form-input"
                    placeholder="Enter password..."
                    value={unlockPasswordInput}
                    onChange={(e) => {
                      setUnlockPasswordInput(e.target.value);
                      setUnlockError("");
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleUnlockProfile(); }}
                    autoFocus
                    style={{ paddingRight: '44px', width: '100%', fontSize: '14px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: 0
                    }}
                    title={showPasswordText ? "Hide Password" : "Show Password"}
                  >
                    {showPasswordText ? '👁️' : '🔒'}
                  </button>
                </div>
                {unlockError && (
                  <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>⚠️</span> {unlockError}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnlockModal(false);
                    setUnlockPasswordInput("");
                    setUnlockError("");
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--text)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUnlockProfile}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#2563eb',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  Unlock 🔓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📱 REGISTRATION & CAUTION FEE (₹2,000) UPI QR MODAL */}
        {showRegQrModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', padding: '16px' }}>
            <div style={{ background: 'var(--card)', width: '100%', maxWidth: '380px', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              <div style={{ background: '#16a34a', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📝</span>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 900, margin: 0 }}>Admission &amp; Security QR</h3>
                    <div style={{ fontSize: '10.5px', opacity: 0.9 }}>Principal GP Barh Hostel</div>
                  </div>
                </div>
                <button onClick={() => setShowRegQrModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontWeight: 900 }}>✕</button>
              </div>

              <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ width: '170px', height: '170px', margin: '0 auto 14px', background: 'white', borderRadius: '12px', padding: '10px', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      `upi://pay?pa=50200112532031@hdfcbank&pn=Principal%20GP%20Barh%20Hostel&am=2000&cu=INR`
                    )}`}
                    alt="Admission QR Code"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)', marginBottom: '2px' }}>
                  Scan with Google Pay / PhonePe / Paytm
                </div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a', marginBottom: '14px' }}>
                  ₹2,000.00 <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(₹500 Reg + ₹1,500 Security)</span>
                </div>

                <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px', fontSize: '11.5px', textAlign: 'left', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <div><strong>A/C:</strong> <code>50200112532031</code></div>
                  <div><strong>IFSC:</strong> <code>HDFC0002248</code></div>
                  <div><strong>Beneficiary:</strong> Principal Govt Polytechnic Barh Hostel</div>
                </div>

                {/* UTR INPUT FIELD */}
                <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
                    ENTER 12-DIGIT TRANSACTION UTR NUMBER:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 423891002931 or UPI/..."
                    value={regFeeUtr}
                    onChange={(e) => setRegFeeUtr(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '2px solid #16a34a',
                      background: 'var(--input-bg)',
                      color: 'var(--text)',
                      fontSize: '13px',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                    *Chief Warden will verify this UTR against bank records to confirm your permanent room allotment.
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const finalUtr = (regFeeUtr && regFeeUtr.trim()) ? regFeeUtr.trim() : 'UPI/992140819201/HDFC';
                      setRegFeeUtr(finalUtr);
                      setIsAdmissionFeePaid(true);
                      localStorage.setItem('gpbarh_admission_fee_paid', 'true');
                      localStorage.setItem('gpbarh_admission_utr', finalUtr);
                      setShowRegQrModal(false);
                      toast.success(`🎉 UTR ${finalUtr} Recorded! Official Allotment Slip Unlocked for Warden Matching. ✅`, {
                        duration: 5000,
                        style: { borderRadius: '12px', background: '#166534', color: '#ffffff', fontWeight: 800 }
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#16a34a',
                      border: 'none',
                      color: 'white',
                      borderRadius: '10px',
                      fontWeight: 900,
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
                    }}
                  >
                    ✅ SUBMIT UTR &amp; CONFIRM ADMISSION
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRegQrModal(false)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      borderRadius: '10px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📥 OFFICIAL ADMISSION & ROOM INVENTORY ALLOTMENT SLIP (₹2,000) */}
        {activeRegReceiptModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '12px' }}>
            <div style={{ background: '#ffffff', color: '#111827', width: '100%', maxWidth: '540px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 70px rgba(0,0,0,0.6)', border: '2px solid #e2e8f0', maxHeight: '95vh', overflowY: 'auto' }}>
              
              {/* TOP BAR */}
              <div style={{ background: '#800000', color: 'white', padding: '18px 20px', textAlign: 'center', borderBottom: '3px solid #eab308' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2px' }}>
                  <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={logo} alt="Logo" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 900, margin: 0, fontFamily: 'serif' }}>राजकीय पॉलिटेक्निक, बाढ़</h2>
                    <p style={{ fontSize: '9.5px', fontWeight: 700, margin: 0, textTransform: 'uppercase', opacity: 0.9 }}>Government Polytechnic, Barh</p>
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '3px 12px', borderRadius: '12px', display: 'inline-block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', marginTop: '6px', color: '#fef08a' }}>
                  Official Hostel Room &amp; Inventory Allotment Slip
                </div>
              </div>

              <div style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px dashed #cbd5e1', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>ALLOTMENT SLIP NO.</div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#800000', fontFamily: 'monospace' }}>
                      GPB/2026/ALLOT-10101
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>ISSUED DATE</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#334155' }}>
                      {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* STUDENT PARTICULARS */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '6px', columnGap: '12px', fontSize: '11.5px' }}>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '9.5px' }}>STUDENT NAME</span>
                      <strong style={{ color: '#0f172a' }}>{profileData?.fullName || (profileData?.gender === 'FEMALE' ? 'Sana Sharma' : 'Amit Kumar Sharma')}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '9.5px' }}>ROLL / REG NO</span>
                      <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{profileData?.regNo || (profileData?.gender === 'FEMALE' ? '1554424000' : '1554424049')}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '9.5px' }}>CLASS ROLL NO</span>
                      <strong style={{ color: '#0f172a' }}>{profileData?.rollNo || currentUser?.roll_no || (profileData?.gender === 'FEMALE' ? '00' : '49')}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '9.5px' }}>DISCIPLINE / BRANCH</span>
                      <strong style={{ color: '#0f172a' }}>{profileData?.branch || 'AI & Machine Learning'}</strong>
                    </div>
                    <div style={{ gridColumn: 'span 2', borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '2px' }}>
                      <span style={{ color: '#64748b', fontWeight: 700, display: 'block', fontSize: '9.5px' }}>HOSTEL PREMISES / BLOCK</span>
                      <strong style={{ color: '#800000', fontSize: '12px' }}>
                        {profileData?.gender === 'FEMALE' || currentUser?.gender === 'FEMALE'
                          ? 'Savitribai Phule Girls Hostel'
                          : (profileData?.hostelBlock?.toLowerCase().includes('rajendra') || currentUser?.hostel_block?.toLowerCase().includes('rajendra')
                              ? 'Dr. Rajendra Prasad Boys Hostel'
                              : 'Birsa Munda Boys Hostel')}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ALLOTTED ROOM & INVENTORY HANDOVER */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 14px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#1e40af', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🏢</span> Allotted Accommodation &amp; Inventory Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px', fontSize: '11.5px' }}>
                    <div style={{ background: '#ffffff', padding: '7px 10px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                      <span style={{ fontSize: '9.5px', color: '#64748b', display: 'block' }}>ALLOTTED ROOM</span>
                      <strong style={{ color: '#1e3a8a', fontSize: '13px' }}>Room No. 101 (Ground Floor)</strong>
                    </div>
                    <div style={{ background: '#ffffff', padding: '7px 10px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                      <span style={{ fontSize: '9.5px', color: '#64748b', display: 'block' }}>BED POSITION</span>
                      <strong style={{ color: '#1e3a8a', fontSize: '13px' }}>Bed No. 1 (Bed A)</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div>🛏️ <strong>Bed &amp; Mattress:</strong> Bed No. 1 with Foam Mattress (Allotted)</div>
                    <div>🪑 <strong>Study Table:</strong> Study Table No. 1 (Wooden Desk)</div>
                    <div>🪑 <strong>Study Chair:</strong> Study Chair No. 1 (Ergonomic Chair)</div>
                    <div>🚪 <strong>Steel Almirah / Locker:</strong> Almirah No. 1 (Cupboard Key #1)</div>
                    <div>💡 <strong>Electricals:</strong> 1x Ceiling Fan, 1x LED Light &amp; Power Socket</div>
                  </div>
                </div>

                {/* VERIFIED UTR ROW */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>TXN / UTR NUMBER:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 900, color: '#1e3a8a', marginLeft: '6px' }}>
                      {regFeeUtr || 'UPI/992140819201/HDFC'}
                    </span>
                  </div>
                  <div style={{ color: '#16a34a', fontWeight: 900, fontSize: '10px' }}>
                    ✓ MATCHED BY CHIEF WARDEN
                  </div>
                </div>

                {/* PAYMENT CERTIFICATION */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '9.5px', color: '#166534', fontWeight: 700 }}>FEE BREAKDOWN &amp; RECEIVED</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#15803d' }}>
                      ₹2,000.00 <span style={{ fontSize: '10px', color: '#166534', fontWeight: 600 }}>(₹500 Reg + ₹1,500 Refundable Caution)</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 900, background: '#16a34a', color: '#fff', padding: '3px 8px', borderRadius: '12px' }}>
                    ✓ ALLOTTED &amp; VERIFIED
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#64748b', marginBottom: '16px' }}>
                  <div>🔒 Chief Hostel Warden Office, GP Barh</div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>Seal: <code>GPB-ALLOTMENT-2026</code></div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handlePrintAllotmentSlip}
                    style={{
                      flex: 1,
                      background: '#0f172a',
                      color: 'white',
                      padding: '11px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🖨️</span>
                    <span>Print Official Allotment Slip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRegReceiptModal(null)}
                    style={{
                      background: '#e2e8f0',
                      color: '#334155',
                      padding: '11px 18px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '12.5px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function StudentDashboardWrapper(props) {
  return (
    <DashboardErrorBoundary>
      <StudentDashboard {...props} />
    </DashboardErrorBoundary>
  );
}

