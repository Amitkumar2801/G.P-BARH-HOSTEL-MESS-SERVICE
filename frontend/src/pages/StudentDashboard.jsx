// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png.png';
import toast, { Toaster } from 'react-hot-toast';

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

  /* PASSBOOK UI (CLEAN TABLE STYLE) */
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
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('registration');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

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
          toast.success(`Transaction of ${amount} Completed Successfully`, { style: { borderRadius: '10px', background: '#333', color: '#fff' }});
          if (callback) callback();
        }, 2000);
      }, 2000);
    }, 1500);
  };

  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
  const [profilePic, setProfilePic] = useState(defaultAvatar);
  const [complaintPreview, setComplaintPreview] = useState(null);

  const [profileData, setProfileData] = useState({
    fullName: "", regNo: "1554424049", branch: "", bloodGroup: "", contact: "", email: "", address: ""
  });

  const [paymentSelection, setPaymentSelection] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentCycle, setPaymentCycle] = useState("");

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
          <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'}}>
            <div style={{background: 'var(--card)', width: '90%', maxWidth: '420px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid var(--border)'}}>
              <div style={{background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'DM Sans', sans-serif"}}>
                  <div style={{width: '28px', height: '28px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
                  </div>
                  SecurePay Gateway
                </div>
                <div style={{fontSize: '12px', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px'}}>GP Barh</div>
              </div>
              <div style={{padding: '40px 32px', textAlign: 'center'}}>
                {paymentStep === 1 && (
                  <div className="animate-fade-in">
                    <div style={{fontSize: '56px', marginBottom: '24px', display: 'inline-block', animation: 'pulse 2s infinite'}}>🏦</div>
                    <h3 style={{fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: 'var(--text)'}}>Connecting to Secure Server...</h3>
                    <p style={{color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500}}>Establishing 256-bit encrypted connection to bank.</p>
                  </div>
                )}
                {paymentStep === 2 && (
                  <div className="animate-fade-in">
                    <div style={{margin: '0 auto 32px', width: '64px', height: '64px', border: '5px solid var(--hover-bg)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                    <h3 style={{fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: 'var(--text)'}}>Processing Payment of {paymentAmount}</h3>
                    <p style={{color: '#dc2626', fontSize: '14px', fontWeight: 700}}>Please do not refresh or close this window.</p>
                  </div>
                )}
                {paymentStep === 3 && (
                  <div className="animate-fade-in">
                    <div style={{width: '72px', height: '72px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)'}}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <h3 style={{fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: 'var(--text)'}}>Payment Authorized!</h3>
                    <p style={{color: 'var(--text-muted)', fontSize: '15px', fontWeight: 600}}>Redirecting back to your dashboard...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`overlay ${isSidebarOpen ? 'show' : ''}`} style={{display: isSidebarOpen ? 'block' : 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90}} onClick={() => setIsSidebarOpen(false)}></div>

        {/* ================= SIDEBAR ================= */}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-profile">
            <div className="avatar-wrap">
              <div className="avatar-circle">
                <img src={profilePic} alt="Profile" style={{opacity: profilePic === defaultAvatar ? 0.5 : 1}} />
              </div>
            </div>
            <div className="student-name">{profileData.fullName || 'Student Profile'}</div>
            <div className="student-reg">ID: {profileData.regNo}</div>
          </div>

          <nav className="nav-list">
            {[
              { id: 'registration', name: 'Registration', icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></> },
              { id: 'profile', name: 'Manage Profile', icon: <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>, locked: !isRegistered },
              { id: 'hostel', name: 'Hostel Passbook', icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></> },
              { id: 'mess', name: 'Mess Passbook', icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></> },
              { id: 'payments', name: 'Payments Hub', icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></> },
              { id: 'clearance', name: 'Clearance Portal', icon: <path d="M5 13l4 4L19 7"/> },
              { id: 'complaints', name: 'Complaints', icon: <><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></> },
              { id: 'appscan', name: 'Connect App', className: 'mobile-only-nav', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></> }
            ].map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''} ${tab.className || ''}`}
                onClick={() => { 
                  if (tab.locked) {
                    toast.error("Access Restricted: Please complete your portal registration payment to unlock this section.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }});
                    setActiveTab('registration');
                  } else {
                    setActiveTab(tab.id); 
                  }
                  setIsSidebarOpen(false); 
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>{tab.icon}</svg>
                {tab.name}
                {tab.locked && <span style={{ marginLeft: 'auto', fontSize: '13px' }}>🔒</span>}
              </button>
            ))}
          </nav>
          <button className="logout-btn" onClick={() => navigate("/")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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

              {/* 0. GP BARH TWO-SIDED REGISTRATION */}
              {activeTab === 'registration' && (
                <div className="gp-reg-hero">
                  <div className="gp-reg-left">
                    <div className="gp-reg-badge">Mandatory Action</div>
                    <h2 className="gp-reg-title">Unlock Your<br/>GP Barh Workspace</h2>
                    <p className="gp-reg-desc">Complete your preliminary registration to access your full profile dashboard, live passbooks, automated payments, and priority grievance redressal.</p>
                    
                    <ul className="gp-reg-features">
                      <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Dynamic Profile Photo & Info sync</li>
                      <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Real-time Hostel & Mess Passbooks</li>
                      <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Instant Automated Clearance Processing</li>
                    </ul>
                    
                    {!isRegistered ? (
                       <div className="gp-reg-action-bar">
                         <div className="gp-price-block">
                           <div className="gp-price">₹500 <span>/ one-time</span></div>
                           <div style={{fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600}}>*Non-refundable portal fee</div>
                         </div>
                         <button className="btn-pay-hero" onClick={() => { 
                           simulatePayment("₹500", () => {
                             setIsRegistered(true); 
                             setActiveTab('profile'); 
                           });
                         }}>Pay & Unlock Now →</button>
                       </div>
                    ) : (
                       <div className="gp-reg-action-bar" style={{ display: 'block', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '24px', borderRadius: '16px' }}>
                          <h3 style={{ color: '#16a34a', marginBottom: '8px', fontSize: '18px', fontWeight: 800 }}>✅ Payment Verified</h3>
                          <p style={{ color: '#15803d', marginBottom: '16px', fontWeight: 600 }}>Your GP Barh Hostel & Mess portal is fully activated.</p>
                          <button className="btn-pay-hero" style={{background: 'var(--teal)', width: '100%'}} onClick={() => setActiveTab('profile')}>
                            Go to Manage Profile
                          </button>
                       </div>
                    )}
                  </div>
                  <div className="gp-reg-right">
                     <div className="glass-security-card">
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛡️</div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>Institutional Grade Security</h3>
                        <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>All personal data, transactions, and payment portals are end-to-end encrypted under Govt. Polytechnic Barh network standards.</p>
                     </div>
                  </div>
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
                          <img src={profilePic} alt="Avatar" style={{ opacity: profilePic === defaultAvatar ? 0.3 : 1 }}/>
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
                          <button className="btn-primary" style={{ padding: '12px 32px' }} onClick={() => toast.success("Profile records successfully updated.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }})}>Save Profile</button>
                       </div>
                    </div>

                    <div className="custom-card">
                       <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '8px 0 24px', color: 'var(--text)' }}>Personal Information</h3>
                       <div className="form-row">
                         <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" type="text" value={profileData.fullName} onChange={e => setProfileData({...profileData, fullName: e.target.value})} placeholder="e.g. Amit Sharma" /></div>
                         <div className="form-group"><label className="form-label">Registration Number</label><input className="form-input" type="text" value={profileData.regNo} disabled /></div>
                       </div>
                       <div className="form-row">
                         <div className="form-group"><label className="form-label">Branch & Semester</label><input className="form-input" type="text" value={profileData.branch} onChange={e => setProfileData({...profileData, branch: e.target.value})} placeholder="e.g. AI & ML (4th Sem)" /></div>
                         <div className="form-group"><label className="form-label">Blood Group</label>
                           <select className="form-select" value={profileData.bloodGroup} onChange={e => setProfileData({...profileData, bloodGroup: e.target.value})}>
                             <option value="">Select Group</option><option>O+</option><option>O-</option><option>A+</option><option>B+</option><option>AB+</option>
                           </select>
                         </div>
                       </div>
                       <div className="form-row">
                         <div className="form-group"><label className="form-label">Contact Number</label><input className="form-input" type="tel" value={profileData.contact} onChange={e => setProfileData({...profileData, contact: e.target.value})} placeholder="+91 88731 42022" /></div>
                         <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} placeholder="amitkumar.gpb.ai@gmail.com" /></div>
                       </div>
                       <div className="form-group">
                         <label className="form-label">Full Permanent Address</label>
                         <textarea className="form-textarea" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} placeholder="Village, P.O, District, State, Pincode"></textarea>
                       </div>
                    </div>
                  </div>

                  {/* HIDDEN PRINT SECTION (ONLY SHOWS DURING PDF GENERATION/PRINT) */}
                  <div id="print-only-section">
                     <div style={{ textAlign: 'center', borderBottom: '3px solid #1e293b', paddingBottom: '24px', marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#0f172a', fontFamily: 'serif' }}>GOVERNMENT POLYTECHNIC, BARH</h1>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '8px 0 0', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Hostel & Mess Administration — Verified Student Profile</h2>
                     </div>
                     
                     <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                        <div style={{ width: '150px', flexShrink: 0 }}>
                           <img src={profilePic} alt="Profile" style={{ width: '150px', height: '180px', objectFit: 'cover', border: '2px solid #cbd5e1', borderRadius: '8px' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                           <table className="print-table" style={{ borderCollapse: 'collapse', color: '#0f172a', fontSize: '14px', marginBottom: '32px' }}>
                              <tbody>
                                 <tr><td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 700, width: '35%', background: '#f8fafc' }}>Full Name</td><td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{profileData.fullName || 'NOT DISCLOSED'}</td></tr>
                                 <tr><td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 700, background: '#f8fafc' }}>Registration ID</td><td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{profileData.regNo}</td></tr>
                                 <tr><td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 700, background: '#f8fafc' }}>Branch & Semester</td><td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{profileData.branch || 'NOT DISCLOSED'}</td></tr>
                                 <tr><td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 700, background: '#f8fafc' }}>Blood Group</td><td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{profileData.bloodGroup || 'NOT DISCLOSED'}</td></tr>
                                 <tr><td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 700, background: '#f8fafc' }}>Registered Mobile</td><td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{profileData.contact || 'NOT DISCLOSED'}</td></tr>
                                 <tr><td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 700, background: '#f8fafc' }}>Email Address</td><td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{profileData.email || 'NOT DISCLOSED'}</td></tr>
                                 <tr><td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 700, background: '#f8fafc' }}>Permanent Address</td><td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{profileData.address || 'NOT DISCLOSED'}</td></tr>
                              </tbody>
                           </table>
                           <div style={{ padding: '24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                              <h4 style={{ margin: '0 0 16px 0', color: '#166534', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>✅ Registration Verified & Fee Settled</h4>
                              <div style={{ fontSize: '14px', marginBottom: '8px', color: '#15281e' }}>Paid Amount: <strong>₹500.00 (Non-Refundable)</strong></div>
                              <div style={{ fontSize: '14px', marginBottom: '8px', color: '#15281e' }}>Transaction ID: <strong>GPB-REG-{Math.floor(Math.random() * 100000000)}</strong></div>
                              <div style={{ fontSize: '14px', color: '#15281e' }}>Generation Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong></div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {/* 2 & 3. PASSBOOKS (CLEAN TABLE UI) */}
              {(activeTab === 'hostel' || activeTab === 'mess') && (
                <div>
                  <h2 className="page-title">{activeTab === 'hostel' ? 'Hostel Passbook' : 'Mess Passbook'}</h2>
                  <p className="page-sub">Track your complete payment history and balances clearly.</p>

                  <div className="pb-wrapper">
                    <div className={`pb-top ${activeTab === 'mess' ? 'mess' : ''}`}>
                      <div>
                        <div className="pb-bal-label">Available Balance</div>
                        <div className="pb-bal-val">{activeTab === 'hostel' ? '₹ 4,000' : '₹ 18,400'}</div>
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
                                <td>{activeTab === 'hostel' ? 'Monthly Room Rent' : 'Monthly Mess Charge'}<br/><span className="txt-muted">System Auto Deduction</span></td>
                                <td className="right txt-red">- ₹{activeTab === 'hostel' ? '500' : '3,200'}</td>
                                <td className="right">₹{activeTab === 'hostel' ? '4,000' : '18,400'}</td>
                             </tr>
                             <tr>
                                <td>16-Jan-2025</td>
                                <td>{activeTab === 'hostel' ? 'Term Security & Rent Deposit' : 'Six Months Mess Advance'}<br/><span className="txt-muted">Paid via Gateway</span></td>
                                <td className="right txt-green">+ ₹{activeTab === 'hostel' ? '4,500' : '21,600'}</td>
                                <td className="right">₹{activeTab === 'hostel' ? '4,500' : '21,600'}</td>
                             </tr>
                          </tbody>
                       </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PAYMENTS HUB */}
              {activeTab === 'payments' && (
                <div>
                  <h2 className="page-title">Digital Payments Hub</h2>
                  <p className="page-sub">Direct access to pay your dues, advances, and fines.</p>

                  <div className="wallet-card">
                    <div>
                      <div className="wallet-label">Prepaid Wallet Balance</div>
                      <div className="wallet-amount">₹ 1,200</div>
                      <div className="wallet-warn">Upcoming Deduction: <span>₹4,150</span> on 1st</div>
                    </div>
                    <button className="topup-btn-g" onClick={() => handlePaySelect('topup', 'Top-up Wallet Balance', 'Custom', false)}>Deposit Funds 💳</button>
                  </div>

                  <div className="sec-title">📌 One-Time Payments</div>
                  <div className="pay-grid">
                    <div className={`pay-card ${paymentSelection?.id === 'security' ? 'selected' : ''}`} onClick={() => handlePaySelect('security', 'Security Deposit', '₹1,500', false)}>
                      <div className="pay-card-icon pi-purple">🔒</div><div className="pay-card-name">Security Deposit</div><div className="pay-card-amount">₹1,500</div><div className="pay-card-sub">Refundable corpus</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                    <div className={`pay-card ${paymentSelection?.id === 'misc' ? 'selected' : ''}`} onClick={() => handlePaySelect('misc', 'Generator & Misc', '₹500', false)}>
                      <div className="pay-card-icon pi-amber">⚡</div><div className="pay-card-name">Generator & Misc</div><div className="pay-card-amount">₹500</div><div className="pay-card-sub">Annual maintenance</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                  </div>

                  <div className="sec-title">📅 Recurring Memberships</div>
                  <div className="fine-note">⚠️ <strong>Late fine auto-activation:</strong> Applies dynamically after the 5th of each active month.</div>
                  <div className="pay-grid">
                    <div className={`pay-card ${paymentSelection?.id === 'm_hostel' ? 'selected' : ''}`} onClick={() => handlePaySelect('m_hostel', 'Monthly Hostel Rent', '₹750', true)}>
                      <div className="pay-card-icon pi-green">🏠</div><div className="pay-card-name">Monthly Hostel Rent</div><div className="pay-card-amount">₹750</div><div className="pay-card-sub">Due every 1st</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                    <div className={`pay-card ${paymentSelection?.id === 'm_mess' ? 'selected' : ''}`} onClick={() => handlePaySelect('m_mess', 'Monthly Mess Bill', '₹3,400', true)}>
                      <div className="pay-card-icon pi-amber">🍽️</div><div className="pay-card-name">Monthly Mess Bill</div><div className="pay-card-amount">₹3,400</div><div className="pay-card-sub">Due every 1st</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                  </div>

                  <div className="sec-title">🎓 Term/Semester Renewals</div>
                  <div className="pay-grid">
                    <div className={`pay-card ${paymentSelection?.id === 'sem_hostel' ? 'selected' : ''}`} onClick={() => { handlePaySelect('sem_hostel', 'Hostel Semester Advance', 'Full Sem', false); setPaymentCycle(""); }}>
                      <div className="pay-card-icon pi-green">🏠</div><div className="pay-card-name">Hostel Advance</div><div className="pay-card-amount">Full Term</div><div className="pay-card-sub">Pay in full & save</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                    <div className={`pay-card ${paymentSelection?.id === 'sem_mess' ? 'selected' : ''}`} onClick={() => { handlePaySelect('sem_mess', 'Mess Semester Advance', 'Full Sem', false); setPaymentCycle(""); }}>
                      <div className="pay-card-icon pi-amber">🍽️</div><div className="pay-card-name">Mess Advance</div><div className="pay-card-amount">Full Term</div><div className="pay-card-sub">Pay in full & save</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                  </div>

                  <div className="pay-action-bar">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Invoice</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginTop: '4px' }}>{paymentSelection ? paymentSelection.name : 'No selection made'}</div>

                      {/* Dynamic Inputs inside Action Bar */}
                      {paymentSelection?.id === 'topup' && (
                        <input type="number" placeholder="Enter Custom Amount (₹)" value={customAmount} onChange={e => setCustomAmount(e.target.value)} className="form-input" style={{ marginTop: '16px', maxWidth: '300px' }} />
                      )}
                      {(paymentSelection?.id === 'sem_hostel' || paymentSelection?.id === 'sem_mess') && (
                        <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                          <button onClick={() => setPaymentCycle("Jan-May")} className={`form-input ${paymentCycle === 'Jan-May' ? 'btn-teal' : ''}`} style={{ width: 'auto', cursor: 'pointer', color: paymentCycle === 'Jan-May' ? '#fff' : 'inherit' }}>Odd Term: Jan-May (5 Mths)</button>
                          <button onClick={() => setPaymentCycle("Jul-Dec")} className={`form-input ${paymentCycle === 'Jul-Dec' ? 'btn-teal' : ''}`} style={{ width: 'auto', cursor: 'pointer', color: paymentCycle === 'Jul-Dec' ? '#fff' : 'inherit' }}>Even Term: Jul-Dec (6 Mths)</button>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '220px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Total Amount Payable</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--teal)', marginBottom: '16px', fontFamily: 'DM Sans' }}>{getSelectedAmountStr()}</div>
                      <button className="btn-teal btn-primary" disabled={!paymentSelection || ((paymentSelection?.id === 'sem_hostel' || paymentSelection?.id === 'sem_mess') && !paymentCycle)} onClick={() => simulatePayment(getSelectedAmountStr(), () => setPaymentSelection(null))}>Proceed & Pay securely</button>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. CLEARANCE */}
              {activeTab === 'clearance' && (
                <div>
                  <h2 className="page-title">Digital Clearance Portal</h2>
                  <p className="page-sub">Initiate your exit process and request security refunds.</p>
                  <div className="custom-card">
                    <div className="clearance-info-bar" style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '16px', borderRadius: '8px', marginBottom: '24px', color: '#991b1b', fontWeight: 600}}>⚠️ <strong>CRITICAL WARNING:</strong> Submitting this form will mark your bed as vacant. Only proceed if legally vacating.</div>

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
                      <div className="form-group"><label className="form-label">Anticipated Date of Departure</label><input type="date" className="form-input"/></div>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '40px 0 24px', color: 'var(--text)' }}>Bank Details (For Refund)</h3>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Account Holder Name</label><input type="text" className="form-input" placeholder="Must match bank passbook"/></div>
                      <div className="form-group"><label className="form-label">Account Number</label><input type="password" placeholder="Enter A/C Number" className="form-input"/></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Bank Name & Branch</label><input type="text" className="form-input" placeholder="e.g. State Bank of India, Barh"/></div>
                      <div className="form-group"><label className="form-label">IFSC Code</label><input type="text" className="form-input" placeholder="e.g. SBIN0001234"/></div>
                    </div>

                    <label className="upload-zone" style={{ margin: '32px 0' }}>
                       <svg width="40" height="40" fill="none" stroke="var(--teal)" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                       <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>Upload Signed No-Dues Form (PDF)</span>
                       <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Signed by Warden & Library</span>
                       <input type="file" accept=".pdf" style={{ display: 'none' }} />
                    </label>
                    <button className="btn-primary" style={{ background: '#0f172a', width: '100%' }} onClick={() => toast.success("Clearance Protocol successfully engaged. Your request is now under administrative review.", { style: { borderRadius: '10px', background: '#333', color: '#fff', padding: '12px 20px', minWidth: '300px' }})}>Submit Clearance Request</button>
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
                      <button className="btn-primary btn-teal" onClick={() => { toast.success("Grievance officially registered and routed to the respective authority.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }}); setComplaintPreview(null); }}>Submit Complaint</button>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. APP SCAN */}
              {activeTab === 'appscan' && (
                <article className="mobile-only-nav">
                   <div className="custom-card" style={{ textAlign: 'center', padding: '56px 40px', maxWidth: '500px', margin: '0 auto' }}>
                      <h2 className="page-title">Link Mobile App</h2>
                      <p className="page-sub" style={{marginBottom: '40px'}}>Scan inside the GP Barh Android App to sync your session.</p>

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
