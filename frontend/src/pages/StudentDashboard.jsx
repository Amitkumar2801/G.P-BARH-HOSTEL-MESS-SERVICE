// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png.png';

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
    --text: #111827;
    --text-muted: #6b7280;
    --border: #e5e7eb;
    --input-bg: #f9fafb;
    --hover-bg: #f3f4f6;
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
  .sidebar { width: var(--sidebar-w); background: #111827; display: flex; flex-direction: column; flex-shrink: 0; height: 100vh; position: fixed; left: 0; top: 0; z-index: 100; transition: transform 0.3s ease; border-right: 1px solid #1f2937; }
  .sidebar-profile { padding: 32px 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: center; }
  .avatar-wrap { position: relative; width: 80px; height: 80px; margin: 0 auto 12px; }
  .avatar-circle { width: 100%; height: 100%; border-radius: 50%; border: 2px solid var(--crimson); background: #1f2937; display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
  .avatar-edit { position: absolute; bottom: 0; right: 0; width: 26px; height: 26px; background: var(--crimson); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #111827; }
  .avatar-edit svg { width: 12px; height: 12px; stroke: #fff; fill: none; stroke-width: 2.5; }
  .student-name { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .student-reg { font-size: 12px; color: #9ca3af; font-family: monospace; }
  .update-btn { margin-top: 12px; padding: 6px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; font-size: 11px; color: rgba(255,255,255,0.7); cursor: pointer; transition: .15s; }
  .update-btn:hover { background: rgba(255,255,255,0.1); }

  .nav-list { flex: 1; padding: 16px 12px; overflow-y: auto; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; color: #9ca3af; transition: 0.2s; margin-bottom: 6px; background: transparent; border: none; width: 100%; text-align: left; }
  .nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
  .nav-item.active { background: var(--crimson); color: #fff; box-shadow: 0 4px 12px rgba(139,13,13,0.2); }
  .nav-item svg { width: 18px; height: 18px; flex-shrink: 0; }

  .logout-btn { margin: 16px; padding: 14px; background: #dc2626; border: none; border-radius: 8px; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; text-transform: uppercase; letter-spacing: 1px; }
  .logout-btn:hover { background: #b91c1c; }

  /* MAIN CONTENT */
  .main-content-area { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: var(--bg); transition: 0.3s; }
  .header { height: var(--header-h); background: var(--crimson); display: flex; align-items: center; justify-content: space-between; padding: 0 28px; flex-shrink: 0; z-index: 10; }
  .header-left { display: flex; align-items: center; gap: 16px; }
  .logo-placeholder { width: 44px; height: 44px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
  .logo-placeholder img { width: 100%; height: 100%; object-fit: contain; }
  .header-title { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 700; color: #fff; line-height: 1.2; }
  .header-sub { font-size: 10px; color: #fca5a5; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }

  .header-right { display: flex; align-items: center; gap: 16px; }
  .theme-toggle { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; transition: 0.2s; }
  .theme-toggle:hover { background: rgba(0,0,0,0.4); }
  .date-chip { background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 6px 16px; font-size: 12px; font-weight: 600; color: #fff; }
  .status-toggle { display: flex; align-items: center; gap: 8px; background: #22c55e; border-radius: 20px; padding: 6px 16px; font-size: 12px; font-weight: 700; color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; animation: pulse 2s infinite; }

  /* SCROLLABLE AREA */
  .scroll-content { flex: 1; overflow-y: auto; padding: 32px 40px; }
  .content-wrapper { width: 100%; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

  .page-title { font-family: 'Fraunces', serif; font-size: 28px; font-weight: 700; color: var(--crimson); margin-bottom: 4px; text-align: center; }
  .page-sub { font-size: 14px; color: var(--text-muted); margin-bottom: 28px; font-weight: 500; text-align: center; }

  .custom-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; box-shadow: var(--shadow); transition: 0.3s; }

  /* FORM ELEMENTS */
  .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-bottom: 24px; }
  .form-group { display: flex; flex-direction: column; gap: 8px; }
  .form-label { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; color: var(--text-muted); text-transform: uppercase; }
  .form-input, .form-select, .form-textarea { padding: 14px 16px; border: 1px solid var(--border); border-radius: 10px; font-size: 14px; color: var(--text); background: var(--input-bg); transition: 0.2s; outline: none; width: 100%; font-weight: 500; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--teal); box-shadow: 0 0 0 3px var(--teal-light); }
  .form-input[disabled] { opacity: 0.7; cursor: not-allowed; }
  .form-textarea { resize: vertical; min-height: 100px; }

  .btn-primary { padding: 14px 28px; background: #2563eb; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; text-transform: uppercase; letter-spacing: 0.5px; }
  .btn-primary:hover { background: #1d4ed8; transform: translateY(-1px); }
  .btn-teal { background: var(--teal); }
  .btn-teal:hover { background: var(--teal-mid); }

  /* PAYMENTS HUB SPECIFIC (RESTORED EXACTLY) */
  .wallet-card { background: linear-gradient(135deg, #0e7a5a 0%, #0d9e74 100%); border-radius: 16px; padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; color: #fff; }
  .wallet-label { font-size: 12px; letter-spacing: .08em; color: rgba(255,255,255,0.8); margin-bottom: 4px; font-weight: 600; text-transform: uppercase; }
  .wallet-amount { font-family: 'Fraunces', serif; font-size: 38px; font-weight: 700; }
  .wallet-warn { font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 4px; }
  .wallet-warn span { color: #fca5a5; font-weight: 700; }
  .topup-btn-g { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.35); color: #fff; border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: .15s; }
  .topup-btn-g:hover { background: rgba(255,255,255,0.25); }

  .sec-title { font-size: 12px; font-weight: 700; letter-spacing: .08em; color: var(--text-muted); margin: 24px 0 12px; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
  .pay-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 16px; }

  .pay-card { background: var(--card); border: 1.5px solid var(--border); border-radius: 12px; padding: 20px; cursor: pointer; transition: .15s; position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; }
  .pay-card:hover { border-color: #9ca3af; transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .pay-card.selected { border-color: var(--teal); border-width: 2px; background: var(--teal-light); }

  .pay-card-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 12px; }
  .pi-green { background: #e1f5ee; } .pi-amber { background: #faeeda; } .pi-blue { background: #e6f1fb; } .pi-purple { background: #eeedfe; }

  .pay-card-name { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
  .pay-card-amount { font-size: 20px; font-weight: 700; color: var(--teal); margin-bottom: 4px; }
  .pay-card-sub { font-size: 12px; color: var(--text-muted); }

  .check-mark { position: absolute; top: 12px; right: 12px; width: 20px; height: 20px; border-radius: 50%; background: var(--teal); display: none; align-items: center; justify-content: center; }
  .check-mark svg { width: 12px; height: 12px; stroke: #fff; fill: none; stroke-width: 2.5; }
  .pay-card.selected .check-mark { display: flex; }

  .fine-note { font-size: 13px; color: #92400e; padding: 12px 16px; background: #fef3c7; border-radius: 8px; border-left: 3px solid #f59e0b; margin-bottom: 16px; font-weight: 500; }
  .pay-action-bar { background: var(--input-bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px 24px; margin-top: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }

  /* CLEARANCE & PROFILE SUMMARY */
  .profile-summary-box { background: var(--teal-light); border: 1px solid var(--teal); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
  .summary-title { font-size: 12px; font-weight: 700; color: var(--teal-mid); text-transform: uppercase; margin-bottom: 12px; text-align: center; letter-spacing: 1px; }
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; }
  .clearance-info-bar { background: #fef3c7; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #92400e; margin-bottom: 24px; }

  /* PASSBOOK TABLES */
  .passbook-header { background: var(--crimson); color: white; padding: 24px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center; }
  .passbook-header.mess { background: var(--teal); }
  .table-container { overflow-x: auto; width: 100%; border: 1px solid var(--border); border-top: none; border-radius: 0 0 12px 12px; background: var(--card); }
  table { width: 100%; border-collapse: collapse; min-width: 800px; }
  th { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; padding: 16px; border-bottom: 2px solid var(--border); text-align: left; }
  td { padding: 16px; font-size: 14px; border-bottom: 1px solid var(--border); color: var(--text); font-weight: 600; }
  tr:hover td { background: var(--input-bg); }

  /* UPLOAD ZONE */
  .upload-zone { border: 2px dashed var(--border); border-radius: 12px; padding: 32px 20px; text-align: center; background: var(--input-bg); cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .upload-zone:hover { border-color: var(--teal); background: var(--teal-light); }
  .upload-preview-img { max-height: 150px; border-radius: 8px; box-shadow: var(--shadow); object-fit: cover; }

  /* COMPLAINTS GRID */
  .complaints-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .c-status-card { border: 1px solid var(--border); border-radius: 12px; padding: 20px; background: var(--card); border-left: 4px solid #f59e0b; box-shadow: var(--shadow); }
  .c-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #fef3c7; color: #92400e; margin-bottom: 12px; text-transform: uppercase; }

  /* RESPONSIVE */
  .hamburger { display: none; background: none; border: none; cursor: pointer; color: white; padding: 8px; }
  .hamburger svg { width: 24px; height: 24px; }

  /* PRINT CSS */
  @media print {
    .sidebar, .header, .hamburger, .theme-toggle, .pay-action-bar, .update-btn { display: none !important; }
    .my-dashboard-wrapper { display: block !important; height: auto !important; overflow: visible !important; background: white !important; }
    .scroll-content { padding: 0 !important; overflow: visible !important; background: white !important;}
    .main-content-area { margin: 0 !important; background: white !important; }
    .custom-card { border: none !important; box-shadow: none !important; padding: 0 !important; background: white !important;}
    #non-print-profile-elements { display: none !important; }
    #print-only-section { display: block !important; }
    .page-title, .page-sub { display: none !important; }
  }
  #print-only-section { display: none; }

  @media (min-width: 1024px) { .mobile-only-nav { display: none !important; } }
  @media (max-width: 1024px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .main-content-area { margin-left: 0; }
    .hamburger { display: block; }
    .date-chip { display: none; }
    .header { padding: 0 16px; }
    .scroll-content { padding: 16px; }
    .custom-card { padding: 20px; }
    .form-row, .complaints-grid, .summary-grid { grid-template-columns: 1fr; }
    .pay-action-bar { flex-direction: column; align-items: stretch; text-align: center; }
  }
  @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
`;

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('registration'); // Registration is default tab initially
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // New state to track registration payment
  const navigate = useNavigate();

  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
  const [profilePic, setProfilePic] = useState(defaultAvatar);
  const [complaintPreview, setComplaintPreview] = useState(null);

  const [profileData, setProfileData] = useState({
    fullName: "", regNo: "1554424049", branch: "", bloodGroup: "", contact: "", email: "", address: ""
  });

  // Payment Logic States
  const [paymentSelection, setPaymentSelection] = useState(null); // {id, name, amt, baseAmt, isMonthly}
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

  // Calculate dynamic display string for selected payment
  const getSelectedAmountStr = () => {
    if (!paymentSelection) return "None";
    if (paymentSelection.id === 'topup') return customAmount ? `₹\${customAmount}` : 'Custom';
    if (paymentSelection.id === 'sem_hostel' || paymentSelection.id === 'sem_mess') {
      return paymentCycle ? (paymentCycle === 'Jan-May' ? (paymentSelection.id === 'sem_hostel' ? '₹3,750' : '₹17,000') : (paymentSelection.id === 'sem_hostel' ? '₹4,500' : '₹20,400')) : 'Pending Cycle';
    }
    if (paymentSelection.isMonthly && isLate) {
      let base = parseInt(paymentSelection.amt.replace(/[^0-9]/g, ''));
      return `₹\${base + lateFine} (Incl. Late Fine)`;
    }
    return paymentSelection.amt;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      <div className={`my-dashboard-wrapper \${isDarkMode ? 'dark-theme' : ''}`}>

        {/* OVERLAY FOR MOBILE */}
        <div className={`overlay \${isSidebarOpen ? 'show' : ''}`} style={{display: isSidebarOpen ? 'block' : 'none'}} onClick={() => setIsSidebarOpen(false)}></div>

        {/* ================= SIDEBAR ================= */}
        <aside className={`sidebar \${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-profile">
            <div className="avatar-wrap">
              <div className="avatar-circle"><img src={profilePic} alt="Profile" style={{opacity: profilePic === defaultAvatar ? 0.3 : 1}} /></div>
              <label htmlFor="sidebarAvatarInput" className="avatar-edit">
                <svg viewBox="0 0 12 12"><path d="M8 2l2 2-6 6H2V8l6-6z"/></svg>
                <input type="file" id="sidebarAvatarInput" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="student-name">{profileData.fullName || 'Student Name'}</div>
            <div className="student-reg">Reg: {profileData.regNo}</div>
            <button className="update-btn" onClick={() => { setActiveTab(isRegistered ? 'profile' : 'registration'); setIsSidebarOpen(false); }}>UPDATE PROFILE</button>
          </div>

          <nav className="nav-list">
            {[
              { id: 'registration', name: 'Registration', icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></> },
              { id: 'profile', name: 'Manage Profile', icon: <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>, locked: !isRegistered },
              { id: 'payments', name: 'Payments Hub', icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></> },
              { id: 'hostel', name: 'Hostel Passbook', icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></> },
              { id: 'mess', name: 'Mess Passbook', icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></> },
              { id: 'clearance', name: 'Hostel Clearance', icon: <path d="M5 13l4 4L19 7"/> },
              { id: 'complaints', name: 'Complaints', icon: <><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></> },
              { id: 'appscan', name: 'App Web Scan', className: 'mobile-only-nav', icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></> }
            ].map(tab => (
              <button
                key={tab.id}
                className={`nav-item \${activeTab === tab.id ? 'active' : ''} \${tab.className || ''}`}
                onClick={() => { 
                  if (tab.locked) {
                    alert("🔒 Please complete your ₹500 Registration payment first to unlock Manage Profile.");
                    setActiveTab('registration');
                  } else {
                    setActiveTab(tab.id); 
                  }
                  setIsSidebarOpen(false); 
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>{tab.icon}</svg>
                {tab.name}
                {tab.locked && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>🔒</span>}
              </button>
            ))}
          </nav>
          <button className="logout-btn" onClick={() => navigate("/")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log Out
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
              <div>
                <h1 className="header-title">Government Polytechnic, Barh</h1>
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

              {/* 0. REGISTRATION */}
              {activeTab === 'registration' && (
                <div>
                  <h2 className="page-title">Preliminary Registration</h2>
                  <p className="page-sub">Complete your registration to unlock the portal features.</p>

                  <div className="custom-card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    {isRegistered ? (
                       <div style={{ padding: '20px' }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                          <h3 style={{ fontSize: '20px', color: 'var(--teal)', marginBottom: '8px' }}>Registration Complete</h3>
                          <p style={{ color: 'var(--text-muted)' }}>You have successfully paid the ₹500 non-refundable registration fee.</p>
                          <button className="btn-teal btn-primary" style={{ marginTop: '24px' }} onClick={() => setActiveTab('profile')}>Go to Manage Profile</button>
                       </div>
                    ) : (
                       <div style={{ padding: '20px' }}>
                          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                          <h3 style={{ fontSize: '20px', color: 'var(--crimson)', marginBottom: '8px' }}>Action Required</h3>
                          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Please pay the non-refundable registration fee of <strong>₹500</strong> to unlock Profile Management.</p>
                          
                          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text)', marginBottom: '24px' }}>₹ 500</div>
                          
                          <button className="btn-primary" onClick={() => { 
                            alert("Redirecting to Mock Payment Gateway... Processing ₹500..."); 
                            setIsRegistered(true); 
                            setTimeout(() => {
                              alert("Payment Successful! Profile section unlocked."); 
                              setActiveTab('profile'); 
                            }, 500);
                          }}>Pay Registration Fee Now</button>
                       </div>
                    )}
                  </div>
                </div>
              )}

              {/* 1. PROFILE */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="page-title">Manage Profile</h2>
                  <p className="page-sub">Keep your academic and personnel records updated.</p>

                  <div className="custom-card" id="non-print-profile-elements">
                    <div style={{ display: 'flex', flexDirection: window.innerWidth > 768 ? 'row' : 'column', gap: '32px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
                        <div className="big-avatar" onClick={() => document.getElementById('mainAvatarInput').click()}>
                          {profilePic !== defaultAvatar ? <img src={profilePic} alt="Profile" /> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="8" r="4.5"/><path d="M3 21c0-4.5 4-8 9-8s9 3.5 9 8"/></svg>}
                        </div>
                        <span className="upload-hint" onClick={() => document.getElementById('mainAvatarInput').click()}>UPLOAD PROFILE PHOTO</span>
                        <input type="file" id="mainAvatarInput" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div className="form-row">
                          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" type="text" value={profileData.fullName} onChange={e => setProfileData({...profileData, fullName: e.target.value})} placeholder="e.g. Amit Kumar" /></div>
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
                        <div className="form-group" style={{ marginBottom: '24px' }}>
                          <label className="form-label">Full Permanent Address</label>
                          <textarea className="form-textarea" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} placeholder="Vill, City, State, Pincode"></textarea>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <button className="btn-primary" style={{ background: '#2563eb', flex: 1 }} onClick={() => alert("Profile Saved successfully!")}>💾 Save Profile Data</button>
                          <button className="btn-primary" style={{ background: 'var(--teal)', flex: 1 }} onClick={() => window.print()}>📄 Download Profile PDF</button>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* HIDDEN PRINT SECTION (ONLY SHOWS DURING PDF GENERATION/PRINT) */}
                  <div id="print-only-section" style={{ padding: '40px', background: '#fff', color: '#000' }}>
                     <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '24px', margin: 0, color: '#000' }}>Government Polytechnic, Barh</h1>
                        <h2 style={{ fontSize: '18px', fontWeight: 500, margin: '8px 0 0', color: '#000' }}>Hostel & Mess Management - Student Profile details</h2>
                     </div>
                     
                     <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                        <img src={profilePic} alt="Profile" style={{ width: '120px', height: '120px', objectFit: 'cover', border: '1px solid #000' }} />
                        <div style={{ width: '100%' }}>
                           <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000' }}>
                              <tbody>
                                 <tr><td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 600, width: '35%' }}>Full Name</td><td style={{ padding: '8px', border: '1px solid #ddd' }}>{profileData.fullName || 'N/A'}</td></tr>
                                 <tr><td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 600 }}>Registration No.</td><td style={{ padding: '8px', border: '1px solid #ddd' }}>{profileData.regNo}</td></tr>
                                 <tr><td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 600 }}>Branch & Sem</td><td style={{ padding: '8px', border: '1px solid #ddd' }}>{profileData.branch || 'N/A'}</td></tr>
                                 <tr><td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 600 }}>Blood Group</td><td style={{ padding: '8px', border: '1px solid #ddd' }}>{profileData.bloodGroup || 'N/A'}</td></tr>
                                 <tr><td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 600 }}>Contact Number</td><td style={{ padding: '8px', border: '1px solid #ddd' }}>{profileData.contact || 'N/A'}</td></tr>
                                 <tr><td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 600 }}>Email Address</td><td style={{ padding: '8px', border: '1px solid #ddd' }}>{profileData.email || 'N/A'}</td></tr>
                                 <tr><td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 600 }}>Permanent Address</td><td style={{ padding: '8px', border: '1px solid #ddd' }}>{profileData.address || 'N/A'}</td></tr>
                              </tbody>
                           </table>
                           <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', border: '2px dashed #64748b' }}>
                              <h4 style={{ margin: '0 0 12px 0', color: '#000', fontSize: '16px' }}>Payment Confirmation</h4>
                              <div style={{ fontSize: '14px', marginBottom: '4px', color: '#000' }}>Registration Fee: <strong>₹500.00</strong></div>
                              <div style={{ fontSize: '14px', marginBottom: '4px', color: '#000' }}>Payment Status: <strong>PAID (Non-Refundable)</strong></div>
                              <div style={{ fontSize: '14px', color: '#000' }}>Date of Registration: <strong>{new Date().toLocaleDateString('en-IN')}</strong></div>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                </div>
              )}

              {/* 2. PAYMENTS HUB (RECREATED WITH CARDS) */}
              {activeTab === 'payments' && (
                <div>
                  <h2 className="page-title" style={{color: 'var(--text)'}}>Payments Hub</h2>
                  <p className="page-sub">Smart payment gateway. Late fine applies automatically after 5th of every month.</p>

                  <div className="wallet-card">
                    <div>
                      <div className="wallet-label">MY PREPAID WALLET BALANCE</div>
                      <div className="wallet-amount">₹ 1,200</div>
                      <div className="wallet-warn">Deduction due on 1st: <span>₹4,150</span> — Please top up!</div>
                    </div>
                    <button className="topup-btn-g" onClick={() => handlePaySelect('topup', 'Top-up Wallet Balance', 'Custom', false)}>+ Top Up Wallet</button>
                  </div>

                  <div className="sec-title">📌 One-Time Dues</div>
                  <div className="pay-grid">
                    <div className={`pay-card \${paymentSelection?.id === 'security' ? 'selected' : ''}`} onClick={() => handlePaySelect('security', 'Security Deposit', '₹1,500', false)}>
                      <div className="pay-card-icon pi-purple">🔒</div><div className="pay-card-name">Security Deposit</div><div className="pay-card-amount">₹1,500</div><div className="pay-card-sub">One-time only</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                    <div className={`pay-card \${paymentSelection?.id === 'misc' ? 'selected' : ''}`} onClick={() => handlePaySelect('misc', 'Misc / Generator Fee', '₹500', false)}>
                      <div className="pay-card-icon pi-amber">⚡</div><div className="pay-card-name">Misc / Generator Fee</div><div className="pay-card-amount">₹500</div><div className="pay-card-sub">One-time charge</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                    <div className={`pay-card \${paymentSelection?.id === 'topup' ? 'selected' : ''}`} onClick={() => handlePaySelect('topup', 'Top-up Wallet Balance', 'Custom', false)}>
                      <div className="pay-card-icon pi-blue">💳</div><div className="pay-card-name">Top-up Wallet</div><div className="pay-card-amount">Custom</div><div className="pay-card-sub">Add balance to wallet</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                  </div>

                  <div className="sec-title">📅 Monthly Dues</div>
                  <div className="fine-note">⚠️ <strong>Late fine</strong> applies automatically after 5th of every month.</div>
                  <div className="pay-grid">
                    <div className={`pay-card \${paymentSelection?.id === 'm_hostel' ? 'selected' : ''}`} onClick={() => handlePaySelect('m_hostel', 'Monthly Hostel Rent', '₹750', true)}>
                      <div className="pay-card-icon pi-green">🏠</div><div className="pay-card-name">Monthly Hostel Rent</div><div className="pay-card-amount">₹750</div><div className="pay-card-sub">Per month</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                    <div className={`pay-card \${paymentSelection?.id === 'm_mess' ? 'selected' : ''}`} onClick={() => handlePaySelect('m_mess', 'Monthly Mess Bill', '₹3,400', true)}>
                      <div className="pay-card-icon pi-amber">🍽️</div><div className="pay-card-name">Monthly Mess Bill</div><div className="pay-card-amount">₹3,400</div><div className="pay-card-sub">Per month</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                  </div>

                  <div className="sec-title">🎓 Full Semester Advance</div>
                  <div className="pay-grid">
                    <div className={`pay-card \${paymentSelection?.id === 'sem_hostel' ? 'selected' : ''}`} onClick={() => { handlePaySelect('sem_hostel', 'Hostel Rent', 'Full Sem', false); setPaymentCycle(""); }}>
                      <div className="pay-card-icon pi-green">🏠</div><div className="pay-card-name">Hostel Rent</div><div className="pay-card-amount">Full Sem</div><div className="pay-card-sub">Advance payment</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                    <div className={`pay-card \${paymentSelection?.id === 'sem_mess' ? 'selected' : ''}`} onClick={() => { handlePaySelect('sem_mess', 'Mess Bill', 'Full Sem', false); setPaymentCycle(""); }}>
                      <div className="pay-card-icon pi-amber">🍽️</div><div className="pay-card-name">Mess Bill</div><div className="pay-card-amount">Full Sem</div><div className="pay-card-sub">Advance payment</div><div className="check-mark"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div>
                    </div>
                  </div>

                  <div className="pay-action-bar">
                    <div style={{ flex: 1 }}>
                      <div className="sel-info">Selected: <span style={{ color: 'var(--text)', fontWeight: 700 }}>{paymentSelection ? paymentSelection.name : 'None'}</span></div>

                      {/* Dynamic Inputs inside Action Bar */}
                      {paymentSelection?.id === 'topup' && (
                        <input type="number" placeholder="Enter Amount (₹)" value={customAmount} onChange={e => setCustomAmount(e.target.value)} className="form-input" style={{ marginTop: '12px', maxWidth: '300px' }} />
                      )}
                      {(paymentSelection?.id === 'sem_hostel' || paymentSelection?.id === 'sem_mess') && (
                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                          <button onClick={() => setPaymentCycle("Jan-May")} className={`form-input \${paymentCycle === 'Jan-May' ? 'btn-teal' : ''}`} style={{ width: 'auto', cursor: 'pointer', color: paymentCycle === 'Jan-May' ? '#fff' : 'inherit' }}>Jan-May (5 Mths)</button>
                          <button onClick={() => setPaymentCycle("Jul-Dec")} className={`form-input \${paymentCycle === 'Jul-Dec' ? 'btn-teal' : ''}`} style={{ width: 'auto', cursor: 'pointer', color: paymentCycle === 'Jul-Dec' ? '#fff' : 'inherit' }}>Jul-Dec (6 Mths)</button>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--teal)', marginBottom: '8px' }}>{getSelectedAmountStr()}</div>
                      <button className="btn-teal btn-primary" disabled={!paymentSelection || ((paymentSelection?.id === 'sem_hostel' || paymentSelection?.id === 'sem_mess') && !paymentCycle)} onClick={() => alert("Redirecting to Gateway...")}>Proceed to Pay Securely →</button>
                    </div>
                  </div>

                  {/* DOWNLOADS */}
                  <div className="custom-card" style={{ marginTop: '32px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>📄 Statements & Legacy Receipts</div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Statement Category</label><select className="form-select"><option>Hostel Fee Receipts</option><option>Mess Fee Receipts</option></select></div>
                      <div className="form-group"><label className="form-label">Semester / Year</label><select className="form-select"><option>Semester 1 (1st Year)</option><option>Semester 2 (1st Year)</option></select></div>
                    </div>
                    <button className="btn-primary" style={{ background: 'transparent', border: '2px solid var(--teal)', color: 'var(--teal)' }} onClick={() => alert('Generating PDF...')}>Generate Official PDF</button>
                  </div>
                </div>
              )}

              {/* 3 & 4. PASSBOOKS */}
              {(activeTab === 'hostel' || activeTab === 'mess') && (
                <div>
                  <h2 className="page-title" style={{color: activeTab === 'hostel' ? 'var(--crimson)' : 'var(--teal)'}}>{activeTab === 'hostel' ? 'Hostel' : 'Mess'} Passbook Ledger</h2>
                  <p className="page-sub">Monthly deduction history and available balance.</p>

                  <div className={`passbook-header \${activeTab === 'mess' ? 'mess' : ''}`}>
                    <div>
                      <div style={{ fontSize: '11px', opacity: 0.8, letterSpacing: '1px' }}>AVAILABLE BALANCE</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'monospace' }}>{activeTab === 'hostel' ? '₹ 4,000' : '₹ 18,400'}</div>
                    </div>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Date</th><th>Particulars</th><th>Credit (+)</th><th>Debit (-)</th><th>Balance</th></tr></thead>
                      <tbody>
                        <tr>
                          <td>01-Feb-2025</td>
                          <td>{activeTab === 'hostel' ? 'Room Rent (February)' : 'Monthly Mess Bill (January)'}</td>
                          <td>-</td>
                          <td style={{color: '#dc2626'}}>{activeTab === 'hostel' ? '₹500' : '₹3,200'}</td>
                          <td>{activeTab === 'hostel' ? '₹4,000' : '₹18,400'}</td>
                        </tr>
                        <tr>
                          <td>16-Jan-2025</td>
                          <td>{activeTab === 'hostel' ? 'Advance Deposit' : '6 Months Advance'}</td>
                          <td style={{color: 'var(--teal)'}}>{activeTab === 'hostel' ? '₹4,500' : '₹21,600'}</td>
                          <td>-</td>
                          <td>{activeTab === 'hostel' ? '₹4,500' : '₹21,600'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. CLEARANCE */}
              {activeTab === 'clearance' && (
                <div>
                  <div className="custom-card">
                    <h2 className="page-title" style={{color: 'var(--crimson)', textAlign: 'center'}}>Hostel Clearance & Vacate Portal</h2>
                    <p className="page-sub" style={{textAlign: 'center'}}>Only for permanent leave, course completion, or shifting permanently.</p>

                    <div className="clearance-info-bar">⚠️ This form is <strong>irreversible</strong>. Once submitted, your hostel seat will be released. Please read all instructions carefully.</div>

                    <div className="profile-summary-box">
                      <div className="summary-title">Your Profile Summary</div>
                      <div className="summary-grid">
                        <div><strong>Name:</strong> {profileData.fullName || 'Not Set'}</div>
                        <div><strong>Reg No:</strong> {profileData.regNo}</div>
                        <div><strong>Branch:</strong> {profileData.branch || 'Not Set'}</div>
                        <div><strong>Phone:</strong> {profileData.contact || 'Not Set'}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Date of Application</div>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>{new Date().toLocaleDateString('en-IN')}</div>
                    </div>

                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Reason for Leaving</label><select className="form-select"><option>Course Completed (Passout)</option><option>Private Room Shifting</option></select></div>
                      <div className="form-group"><label className="form-label">Expected Date of Leaving</label><input type="date" className="form-input"/></div>
                    </div>

                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '32px 0 16px', color: 'var(--text)', textAlign: 'center' }}>Bank Details (For Security Deposit Refund)</h3>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">A/C Holder Name</label><input type="text" className="form-input" placeholder="Name on passbook"/></div>
                      <div className="form-group"><label className="form-label">Account Number</label><input type="text" className="form-input" placeholder="Account Number"/></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label className="form-label">Bank Name</label><input type="text" className="form-input" placeholder="Bank Name"/></div>
                      <div className="form-group"><label className="form-label">IFSC Code</label><input type="text" className="form-input" placeholder="IFSC Code"/></div>
                    </div>

                    <label className="upload-zone" style={{ margin: '24px 0' }}>
                       <svg width="32" height="32" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                       <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Upload Signed No-Dues Application (PDF)</span>
                       <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Form must be signed by Chief Warden & Library In-charge</span>
                       <input type="file" accept=".pdf" style={{ display: 'none' }} />
                    </label>
                    <button className="btn-primary btn-teal" onClick={() => alert("Clearance Initiated!")}>Submit Clearance Request</button>
                  </div>
                </div>
              )}

              {/* 6. COMPLAINTS */}
              {activeTab === 'complaints' && (
                <div>
                  <h2 className="page-title" style={{color: 'var(--crimson)', textAlign: 'center'}}>Complaints</h2>
                  <p className="page-sub" style={{textAlign: 'center'}}>Lodge a new complaint or track existing ones.</p>

                  <div className="complaints-grid">
                    <div className="custom-card" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--crimson)' }}>📣 Lodge a Complaint</h3>
                      <div className="form-group" style={{ marginBottom: '16px' }}><label className="form-label">Category</label><select className="form-select"><option>Electrical (Fan, Light)</option><option>Plumbing</option><option>Mess Food</option></select></div>
                      <div className="form-group" style={{ marginBottom: '16px' }}><label className="form-label">Description</label><textarea className="form-textarea" placeholder="Describe the exact issue..."></textarea></div>

                      <label className="upload-zone" style={{ marginBottom: '20px', padding: '20px' }}>
                        {complaintPreview ? (
                           <img src={complaintPreview} alt="Preview" className="upload-preview-img" />
                        ) : (
                           <>
                             <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>UPLOAD PROOF (PHOTO / VIDEO)</span>
                             <span style={{ fontSize: '11px', color: '#9ca3af' }}>Click to choose file</span>
                           </>
                        )}
                        <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleComplaintProof} />
                      </label>
                      <button className="btn-primary btn-teal" onClick={() => { alert("Complaint Logged!"); setComplaintPreview(null); }}>Submit Complaint</button>
                    </div>

                    <div className="custom-card" style={{ padding: '24px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--crimson)' }}>📌 My Complaint Status</h3>
                      <div className="c-status-card">
                         <div className="c-badge">PENDING</div>
                         <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>Water cooler not working</div>
                         <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Submitted: 2 hrs ago</div>
                         <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '8px', cursor: 'pointer' }}>📎 View Attached Proof</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. APP SCAN */}
              {activeTab === 'appscan' && (
                <article className="mobile-only-nav">
                   <div className="custom-card" style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
                      <h2 className="page-title">Connect to Mobile App</h2>
                      <p className="page-sub" style={{marginBottom: '32px'}}>Scan this unique QR code from your GP Barh Mobile App to sync your session.</p>

                      <div style={{ width: '220px', height: '220px', border: '2px solid var(--border)', margin: '0 auto 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--input-bg)' }}>
                         <div style={{ fontSize: '70px' }}>📱</div>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Waiting for device to scan...</p>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px' }}>Session ID: <strong style={{color: 'var(--teal)'}}>GPB-2026-1554424049</strong></div>
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
