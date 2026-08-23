// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png.png';
import toast, { Toaster } from 'react-hot-toast';
import RoomAllocationGrid from '../components/RoomAllocationGrid';

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

  /* PRINT CSS */
  @page { margin: 0; size: A4; }
  @media print {
    body { background: white !important; margin: 0 !important; }
    .sidebar, .header, .hamburger, .theme-toggle, .pay-action-bar, .update-btn { display: none !important; }
    .my-dashboard-wrapper { display: block !important; height: auto !important; overflow: visible !important; background: white !important; }
    .scroll-content { padding: 0 !important; overflow: visible !important; background: white !important;}
    .main-content-area { margin: 0 !important; background: white !important; }
    .custom-card { border: none !important; box-shadow: none !important; padding: 0 !important; background: white !important;}
    #non-print-profile-elements { display: none !important; }
    #print-only-section { display: block !important; width: 100% !important; max-width: 100% !important; padding: 2cm !important; box-sizing: border-box !important; }
    .page-title, .page-sub { display: none !important; }
    .print-table { table-layout: fixed !important; width: 100% !important; word-break: break-word !important; }
  }
  #print-only-section { display: none; }

  @media (min-width: 1025px) { .mobile-only-nav { display: none !important; } }
  @media (max-width: 1024px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); box-shadow: 10px 0 30px rgba(0,0,0,0.5); }
    .main-content-area { margin-left: 0; }
    .hamburger { display: block; }
    .date-chip { display: none; }
    .header { padding: 0 16px; }
    .header-title { font-size: 16px; max-width: 220px; }
    .header-sub { display: none; }
    .scroll-content { padding: 20px 16px; }
    .custom-card { padding: 24px; }
    .form-row, .complaints-grid, .summary-grid { grid-template-columns: 1fr; }
    .pay-action-bar { flex-direction: column; align-items: stretch; text-align: center; }
    
    .prof-header-simple { flex-direction: column; text-align: center; gap: 16px; padding: 24px; }
    .prof-header-simple .prof-name-area p { justify-content: center; }

    .gp-reg-hero { flex-direction: column; min-height: auto; }
    .gp-reg-left { padding: 32px 24px; }
    .gp-reg-right { padding: 40px 24px; }
    .gp-reg-action-bar { flex-direction: column; align-items: stretch; gap: 16px; }
  }
  #print-only-section { display: none; }
  
  @media print {
    body * { visibility: hidden; }
    #print-only-section, #print-only-section * { 
      visibility: visible !important; 
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #print-only-section {
      display: block !important;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 10px;
      margin: 0;
      background: #ffffff !important;
      color: #0f172a !important;
    }
    .sidebar, .header, .toast-container, .modal-backdrop, #non-print-profile-elements {
      display: none !important;
    }
  }
  
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRegistered, setIsRegistered] = useState(true);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      id: 1,
      full_name: 'Amit Kumar Sharma',
      reg_no_email: '1554424049',
      gender: 'MALE',
      role: 'student'
    };
  });

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
    const saved = localStorage.getItem('user');
    let u = {};
    if (saved) {
      try { u = JSON.parse(saved); } catch (e) { }
    }
    const cleanName = (u.full_name && !u.full_name.includes('Chief Warden')) ? u.full_name : "AMIT SHARMA";
    const userGender = u.gender ? (u.gender.toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE') : 'MALE';
    const userBlock = u.hostel_block || u.hostelBlock || (userGender === 'FEMALE' ? 'Savitribai Phule Girls Hostel' : 'Birsa Munda Block');
    return {
      fullName: cleanName,
      regNo: u.reg_no || u.reg_no_email || "1554424049",
      branch: u.branch || "Artificial Intelligence & Machine Learning",
      session: u.session || u.semester || "2024-27",
      semester: u.session || u.semester || "2024-27",
      bloodGroup: u.blood_group || "O+",
      contact: u.mobile || "+91 88731 42022",
      email: u.email || (u.reg_no_email && u.reg_no_email.includes('@') ? u.reg_no_email : "amitkumar.gpb.ai@gmail.com"),
      address: u.address || "Village, P.O, District, State, Pincode",
      gender: userGender,
      hostelBlock: userBlock
    };
  });

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
          profile_pic: profilePic
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
      blood_group: profileData.bloodGroup
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success("Profile records successfully saved & synced! ✅", {
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
          <div className="sidebar-profile">
            <div className="avatar-wrap">
              <div className="avatar-circle">
                <img src={profilePic} alt="Profile" style={{ opacity: profilePic === defaultAvatar ? 0.5 : 1 }} />
              </div>
            </div>
            <div className="student-name">{profileData.fullName || 'Student Profile'}</div>
            <div className="student-reg">ID: {profileData.regNo}</div>
          </div>

          <nav className="nav-list">
            {[
              { id: 'seat-allocation', name: 'Seat & Room Allocation', icon: <><path d="M2 4v16M2 8h20M22 4v16M6 8v5a2 2 0 002 2h8a2 2 0 002-2V8" /></> },
              { id: 'profile', name: 'Manage Profile', icon: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></> },
              { id: 'payments', name: 'Payments Hub', icon: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></> },
              { id: 'hostel', name: 'Hostel Passbook', icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></> },
              { id: 'mess', name: 'Mess Passbook', icon: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></> },
              { id: 'clearance', name: 'Clearance Portal', icon: <path d="M5 13l4 4L19 7" /> },
              { id: 'complaints', name: 'Complaints', icon: <><path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></> },
              { id: 'appscan', name: 'Connect App', className: 'mobile-only-nav', icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></> }
            ].map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''} ${tab.className || ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsSidebarOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>{tab.icon}</svg>
                {tab.name}
              </button>
            ))}
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

          <section className="scroll-content">
            <div className="content-wrapper">

              {/* 0. SEAT & ROOM ALLOCATION SECTION (ABOVE MANAGE PROFILE) */}
              {activeTab === 'seat-allocation' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 className="page-title">Hostel Seat &amp; Room Allocation</h2>
                    <p className="page-sub">Interactive Cinema-style bed booking engine with real-time floor architecture.</p>
                  </div>
                  <RoomAllocationGrid
                    gender={profileData.gender || currentUser?.gender || 'MALE'}
                    studentId={currentUser?.id || 1}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}

              {/* 1. MANAGE PROFILE (SIMPLE UI) */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="page-title">Manage Profile</h2>
                  <p className="page-sub">Keep your academic and personnel records updated.</p>

                  <div id="non-print-profile-elements">
                    <div className="prof-header-simple">
                      <div className="prof-avatar-wrap">
                        <img src={profilePic} alt="Avatar" style={{ opacity: profilePic === defaultAvatar ? 0.3 : 1 }} />
                        <label className="prof-avatar-edit" htmlFor="mainAvatarInput" title="Update Photo">
                          <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                          <input type="file" id="mainAvatarInput" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                        </label>
                      </div>
                      <div className="prof-name-area">
                        <h2>{profileData.fullName || 'Student Name'}</h2>
                        <p><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> {profileData.branch || 'Configuration Pending'}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button className="btn-primary" style={{ padding: '12px 24px', background: 'var(--input-bg)', color: 'var(--text)', border: '1px solid var(--border)', boxShadow: 'none' }} onClick={() => window.print()}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> PDF
                        </button>
                        <button className="btn-primary" style={{ padding: '12px 32px' }} onClick={handleSaveProfile}>Save Profile</button>
                      </div>
                    </div>

                    <div className="custom-card">
                      <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '8px 0 24px', color: 'var(--text)' }}>Personal &amp; Academic Records</h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Full Name</label>
                          <input className="form-input" type="text" value={profileData.fullName} onChange={e => setProfileData({ ...profileData, fullName: e.target.value })} placeholder="e.g. AMIT SHARMA" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Registration Number</label>
                          <input className="form-input" type="text" value={profileData.regNo} onChange={e => setProfileData({ ...profileData, regNo: e.target.value })} placeholder="1554424049" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Branch / Department</label>
                          <select className="form-select" value={profileData.branch} onChange={e => setProfileData({ ...profileData, branch: e.target.value })}>
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
                            value={profileData.session || profileData.semester || ""}
                            onChange={e => setProfileData({ ...profileData, session: e.target.value, semester: e.target.value })}
                            placeholder="e.g. 2024-27"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Hostel &amp; Block Selection</label>
                          <select
                            className="form-select"
                            value={profileData.hostelBlock || (profileData.gender === 'FEMALE' ? 'Savitribai Phule Girls Hostel' : 'Birsa Munda Block')}
                            onChange={e => {
                              const selected = e.target.value;
                              const isFem = selected === 'Savitribai Phule Girls Hostel';
                              setProfileData({
                                ...profileData,
                                hostelBlock: selected,
                                gender: isFem ? 'FEMALE' : 'MALE'
                              });
                            }}
                          >
                            {profileData.gender === 'FEMALE' ? (
                              <option value="Savitribai Phule Girls Hostel">👩 Savitribai Phule Girls Hostel</option>
                            ) : (
                              <>
                                <option value="Birsa Munda Block">👨 Birsa Munda Block</option>
                                <option value="Dr. Rajendra Prasad Block">👨 Dr. Rajendra Prasad Block</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Blood Group</label>
                          <select className="form-select" value={profileData.bloodGroup || "O+"} onChange={e => setProfileData({ ...profileData, bloodGroup: e.target.value })}>
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
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Contact Number</label>
                          <input className="form-input" type="tel" value={profileData.contact} onChange={e => setProfileData({ ...profileData, contact: e.target.value })} placeholder="+91 88731 42022" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email Address</label>
                          <input className="form-input" type="email" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} placeholder="amitkumar.gpb.ai@gmail.com" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Full Permanent Address</label>
                        <textarea className="form-textarea" value={profileData.address} onChange={e => setProfileData({ ...profileData, address: e.target.value })} placeholder="Village, P.O, District, State, Pincode"></textarea>
                      </div>
                    </div>
                  </div>

                  {/* 🌟 ULTRA-PREMIUM COLORFUL PRINTABLE DOSSIER (ONLY VISIBLE ON PRINT / PDF) 🌟 */}
                  <div id="print-only-section" style={{ background: '#ffffff', color: '#0f172a', padding: '16px', fontFamily: 'Arial, sans-serif' }}>
                    {/* INSTITUTIONAL CREST HEADER */}
                    <div style={{ border: '3px solid #800000', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <div style={{ background: 'linear-gradient(135deg, #720e0e 0%, #8b0000 100%)', color: '#ffffff', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #eab308' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '64px', height: '64px', background: '#ffffff', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                            <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                          <div>
                            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, fontFamily: 'serif', letterSpacing: '0.5px' }}>राजकीय पॉलिटेक्निक, बाढ़</h1>
                            <h2 style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>GOVERNMENT POLYTECHNIC, BARH</h2>
                            <p style={{ margin: '2px 0 0', fontSize: '9px', color: '#fef08a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dept. of Science, Technology &amp; Technical Education • Govt. of Bihar</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.25)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                          <div style={{ fontSize: '9px', color: '#fef08a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>HOSTEL ALLOTMENT &amp; IDENTITY CARD</div>
                          <div style={{ fontSize: '12px', fontWeight: 900, color: '#ffffff' }}>SESSION {profileData.session || profileData.semester || '2024–27'}</div>
                        </div>
                      </div>

                      {/* SUB-BANNER */}
                      <div style={{ background: '#f8fafc', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                        <span>Official Student Identification &amp; Hostel Admission Record</span>
                        <span style={{ color: '#800000' }}>Date Issued: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    {/* TWO COLUMN CONTENT AREA */}
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>
                      {/* LEFT COLUMN: PHOTO & SECURITY STAMPS */}
                      <div style={{ width: '180px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '160px', height: '190px', borderRadius: '12px', border: '3px solid #800000', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', background: '#f1f5f9', position: 'relative' }}>
                          <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', bottom: 0, insetInline: 0, background: 'rgba(128,0,0,0.85)', color: '#ffffff', textAlign: 'center', fontSize: '9px', fontWeight: 800, padding: '3px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Verified Resident
                          </div>
                        </div>

                        {/* BLOOD GROUP BADGE */}
                        <div style={{ width: '100%', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '10px', padding: '8px 12px', textAlign: 'center' }}>
                          <div style={{ fontSize: '9px', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase' }}>Blood Group</div>
                          <div style={{ fontSize: '18px', fontWeight: 900, color: '#b91c1c' }}>{profileData.bloodGroup || 'O+'}</div>
                        </div>

                        {/* DIGITAL QR BADGE */}
                        <div style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '28px', lineHeight: 1 }}>📱</div>
                          <div style={{ fontSize: '8px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginTop: '4px' }}>Digital ID: {profileData.regNo}</div>
                        </div>
                      </div>

                      {/* RIGHT COLUMN: DETAILED INFO TABLE */}
                      <div style={{ flex: 1 }}>
                        <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', color: '#0f172a', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
                          <tbody>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', width: '35%', fontSize: '11px', textTransform: 'uppercase' }}>Full Name</td>
                              <td style={{ padding: '10px 14px', fontWeight: 900, color: '#0f172a', fontSize: '15px' }}>{profileData.fullName || 'AMIT SHARMA'}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#800000', fontSize: '11px', textTransform: 'uppercase' }}>Registration Number</td>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#800000', fontFamily: 'monospace', fontSize: '14px' }}>{profileData.regNo}</td>
                            </tr>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Branch / Discipline</td>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#1e293b' }}>{profileData.branch || 'Artificial Intelligence & Machine Learning'}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Academic Session</td>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#1e293b' }}>{profileData.session || profileData.semester || '2024–27'}</td>
                            </tr>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Gender &amp; Assigned Hostel</td>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#1e293b' }}>
                                {profileData.gender === 'FEMALE'
                                  ? '👩 Female (Savitribai Phule Girls Hostel)'
                                  : `👨 Male (GP Barh Boys Hostel - ${profileData.hostelBlock || 'Birsa Munda Block'})`}
                              </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Registered Mobile</td>
                              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1e293b' }}>{profileData.contact}</td>
                            </tr>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Email Address</td>
                              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1e293b' }}>{profileData.email}</td>
                            </tr>
                            <tr>
                              <td style={{ padding: '10px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Permanent Address</td>
                              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#334155', lineHeight: 1.4 }}>{profileData.address}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* OFFICIAL INSTITUTIONAL VERIFICATION FOOTER */}
                    <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900 }}>✓</div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 900, color: '#166534', textTransform: 'uppercase' }}>Official Hostel Resident Verification</div>
                            <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 600 }}>Dossier digitally verified by Government Polytechnic, Barh (Patna) Portal.</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '4px 10px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
                          SESSION {profileData.session || profileData.semester || '2024–27'}
                        </div>
                      </div>
                    </div>

                    {/* SIGNATURE BLOCK */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '2px dashed #cbd5e1' }}>
                      <div style={{ textAlign: 'center', width: '200px' }}>
                        <div style={{ height: '40px', borderBottom: '1px solid #0f172a', marginBottom: '6px' }}></div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Signature of Student</div>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>({profileData.fullName || 'AMIT SHARMA'})</div>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px solid #800000', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#800000', fontSize: '8px', fontWeight: 900, textAlign: 'center', padding: '4px', textTransform: 'uppercase' }}>
                          OFFICIAL SEAL<br />GP BARH
                        </div>
                      </div>

                      <div style={{ textAlign: 'center', width: '220px' }}>
                        <div style={{ height: '40px', borderBottom: '1px solid #0f172a', marginBottom: '6px' }}></div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Chief Warden / Superintendent</div>
                        <div style={{ fontSize: '9px', color: '#64748b' }}>Govt. Polytechnic, Barh (Patna)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 🌟 2. HOSTEL PASSBOOK (BANK STATEMENT & AUTO-DEDUCTION LEDGER) 🌟 */}
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

              {/* 3. PAYMENTS HUB (SIMPLE / BLANK STANDBY) */}
              {activeTab === 'payments' && (
                <div>
                  <h2 className="page-title">Payments Hub</h2>
                  <p className="page-sub">Direct access to pay your dues, advances, and fines.</p>

                  <div className="custom-card" style={{ textAlign: 'center', padding: '80px 24px', minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '52px', marginBottom: '16px' }}>💳</div>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
                      Payments Hub
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                      This section is currently kept blank. Aap jab bolenge, tab isse naye design ke sath customize kar denge.
                    </p>
                  </div>
                </div>
              )}

              {/* 5. CLEARANCE */}
              {activeTab === 'clearance' && (
                <div>
                  <h2 className="page-title">Digital Clearance Portal</h2>
                  <p className="page-sub">Initiate your exit process and request security refunds.</p>
                  <div className="custom-card">
                    <div className="clearance-info-bar" style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '16px', borderRadius: '8px', marginBottom: '24px', color: '#991b1b', fontWeight: 600 }}>⚠️ <strong>CRITICAL WARNING:</strong> Submitting this form will mark your bed as vacant. Only proceed if legally vacating.</div>

                    <div className="profile-summary-box" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>📋 Automated Profile Authentication</h3>
                      <div className="form-row" style={{ marginBottom: 0, rowGap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>STUDENT NAME</div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>{profileData.fullName || 'Not Disclosed'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>REGISTRATION ID</div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>{profileData.regNo}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>BRANCH & SEM</div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>{profileData.branch || 'Not Disclosed'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>MOBILE NO</div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>{profileData.contact || 'Not Disclosed'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Official Reason for Evacuation</label><select className="form-select"><option>Academic Tenure Completion (Passout)</option><option>Shifting to Private Residence</option></select></div>
                      <div className="form-group"><label className="form-label">Anticipated Date of Departure</label><input type="date" className="form-input" /></div>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '40px 0 24px', color: 'var(--text)' }}>Bank Details (For Refund)</h3>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Account Holder Name</label><input type="text" className="form-input" placeholder="Must match bank passbook" /></div>
                      <div className="form-group"><label className="form-label">Account Number</label><input type="password" placeholder="Enter A/C Number" className="form-input" /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Bank Name & Branch</label><input type="text" className="form-input" placeholder="e.g. State Bank of India, Barh" /></div>
                      <div className="form-group"><label className="form-label">IFSC Code</label><input type="text" className="form-input" placeholder="e.g. SBIN0001234" /></div>
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

              {/* 7. APP SCAN */}
              {activeTab === 'appscan' && (
                <article className="mobile-only-nav">
                  <div className="custom-card" style={{ textAlign: 'center', padding: '56px 40px', maxWidth: '500px', margin: '0 auto' }}>
                    <h2 className="page-title">Link Mobile App</h2>
                    <p className="page-sub" style={{ marginBottom: '40px' }}>Scan inside the GP Barh Android App to sync your session.</p>

                    <div style={{ width: '240px', height: '240px', border: '3px solid var(--teal)', margin: '0 auto 32px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--teal-light)', boxShadow: '0 10px 25px rgba(14,122,90,0.15)' }}>
                      <div style={{ fontSize: '80px' }}>📱</div>
                    </div>
                  </div>
                </article>
              )}

            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default StudentDashboard;
