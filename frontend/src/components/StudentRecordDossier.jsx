// src/components/StudentRecordDossier.jsx
import React, { useMemo } from 'react';
import logo from '../assets/logo.png.png';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DEFAULT_MONTHLY_MEALS = [72, 75, 69, 78, 81, 74, 70, 77, 79, 76, 73, 78];

function buildDailyLog(len = 30) {
  const leaveDays = new Set([4, 11, 18, 25]);
  return Array.from({ length: len }, (_, i) => ({
    day: i + 1,
    status: leaveDays.has(i + 1) ? "leave" : "present",
  }));
}

function CircularBadge({ percent, size = 54, stroke = 5, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(percent, 100) / 100) * c;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#800000"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        lineHeight: 1.1,
        color: 'var(--text)'
      }}>
        <strong style={{ fontSize: '12px', fontWeight: 800 }}>{percent}%</strong>
        {label ? <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{label}</span> : null}
      </div>
    </div>
  );
}

function StudentRecordDossier({
  profileData = {},
  currentUser = {},
  profilePic = null,
  isDarkMode = false,
  allotmentInfo = null
}) {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const isFemale = String(profileData?.gender || currentUser?.gender || '').toUpperCase() === 'FEMALE';
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
  const avatarSrc = profilePic || defaultAvatar;

  const fullName = profileData?.fullName || currentUser?.full_name || (isFemale ? 'SANA SHARMA' : 'AMIT SHARMA');
  
  const getCleanRegNo = () => {
    const r1 = String(profileData?.regNo || '');
    if (r1 && !r1.includes('@')) return r1;
    const r2 = String(currentUser?.reg_no || currentUser?.registration_no || '');
    if (r2 && !r2.includes('@')) return r2;
    return isFemale ? '1554424000' : '1554424049';
  };
  const regNo = getCleanRegNo();
  const rawRoll = profileData?.rollNo || currentUser?.roll_no || (isFemale ? '00' : '49');
  const rollNo = String(rawRoll || '').replace('#', '').trim() || (isFemale ? '00' : '49');
  const branch = profileData?.branch || currentUser?.branch || 'Artificial Intelligence & Machine Learning';
  const session = profileData?.session || profileData?.semester || currentUser?.semester || currentUser?.session || '2024-27';

  const getMaskedContact = () => {
    const c1 = String(profileData?.contact || '').trim();
    if (c1 && !c1.includes('42022') && !c1.includes('56789') && !c1.includes('-----')) return c1;
    const c2 = String(currentUser?.mobile || currentUser?.phone || currentUser?.contact || '').trim();
    if (c2 && !c2.includes('42022') && !c2.includes('56789') && !c2.includes('-----')) return c2;
    return isFemale ? '+91 91234 -----' : '+91 88731 -----';
  };
  const contact = getMaskedContact();
  
  const getCleanEmail = () => {
    const e1 = String(profileData?.email || '').trim();
    if (e1 && !e1.includes('arwal28') && !e1.includes('sanasharma31') && !e1.includes('student.female@') && !e1.includes('student@')) return e1;
    const e2 = String(currentUser?.email || '').trim();
    if (e2 && !e2.includes('arwal28') && !e2.includes('sanasharma31') && !e2.includes('student.female@') && !e2.includes('student@')) return e2;
    return isFemale ? 'sanasharma.gpb.ai@gmail.com' : 'amitkumar.gpb.ai@gmail.com';
  };
  const email = getCleanEmail();

  const getCleanAddress = () => {
    const a1 = String(profileData?.address || '').trim();
    if (a1 && !a1.includes('Saksohara') && !a1.includes('Agwanpur') && !a1.includes('PIN -')) return a1;
    const a2 = String(currentUser?.address || '').trim();
    if (a2 && !a2.includes('Saksohara') && !a2.includes('Agwanpur') && !a2.includes('PIN -')) return a2;
    return 'Vill - Agwanpur, P.O - Agwanpur, Dist - Patna, Bihar - 803213';
  };
  const address = getCleanAddress();
  const pincode = profileData?.pincode || currentUser?.pincode || '804401';

  const bloodGroup = profileData?.bloodGroup || currentUser?.blood_group || 'O+';
  const hostelBlock = allotmentInfo?.hostel_name || allotmentInfo?.hostelBlock || profileData?.hostelBlock || currentUser?.hostel_block || (isFemale ? 'Savitribai Phule Girls Hostel' : 'Birsa Munda Boys Hostel');
  const roomBed = (allotmentInfo?.room_number && allotmentInfo?.bed_code)
    ? `Room ${allotmentInfo.room_number} • Bed ${allotmentInfo.bed_code}`
    : (allotmentInfo?.roomNo ? `Room ${allotmentInfo.roomNo} • Bed ${allotmentInfo.bedNo || 'A'}` : (profileData?.roomNumber ? `Room ${profileData.roomNumber} • Bed ${profileData.bedNumber || 'A'}` : (isFemale ? 'Room 101 • Bed A' : 'Room 101 • Bed 1 (Bed A)')));

  // Mess Analytics Data
  const mess = allotmentInfo?.mess || {};
  const monthlyPresent = mess.monthlyPresent ?? 26;
  const monthlyTotal = mess.monthlyTotal ?? 30;
  const monthlyPct = useMemo(
    () => Number(((monthlyPresent / monthlyTotal) * 100).toFixed(1)),
    [monthlyPresent, monthlyTotal]
  );

  const breakfast = mess.breakfast ?? 26;
  const lunch = mess.lunch ?? 26;
  const dinner = mess.dinner ?? 26;
  const totalMeals = mess.totalMeals ?? (breakfast + lunch + dinner);

  const annualPresent = mess.annualPresent ?? 214;
  const annualTotal = mess.annualTotal ?? 240;
  const annualPct = useMemo(
    () => Number(((annualPresent / annualTotal) * 100).toFixed(1)),
    [annualPresent, annualTotal]
  );

  const leaveDays = mess.leaveDays ?? 4;
  const monthlyMeals = mess.monthlyMealTrend || DEFAULT_MONTHLY_MEALS;
  const maxMeals = Math.max(...monthlyMeals);
  const dailyLog = mess.dailyLog || buildDailyLog(30);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        /* 🏷️ CHIPS STYLING 🏷️ */
        .srd-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }
        .srd-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 6px 12px;
          font-size: 12.5px;
          color: var(--text);
          font-weight: 600;
          transition: 0.2s;
        }
        .srd-chip:hover {
          border-color: #800000;
        }

        /* 🎨 PERSONAL & ACADEMIC FORM GRID 🎨 */
        .srd-form-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px 32px;
          box-shadow: var(--shadow-sm);
        }
        .srd-form-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .srd-form-title {
          font-family: 'Fraunces', serif;
          font-size: 19px;
          font-weight: 800;
          color: var(--text);
          margin: 0;
          letter-spacing: -0.2px;
        }
        .srd-lock-badge {
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #fecdd3;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
        }
        .srd-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px 24px;
        }
        @media (max-width: 768px) {
          .srd-form-grid {
            grid-template-columns: 1fr;
          }
        }
        .srd-field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .srd-field-label {
          font-size: 11.5px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }
        .srd-field-box {
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 14.5px;
          font-weight: 600;
          color: var(--text);
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: 0.2s ease;
          display: flex;
          align-items: center;
        }
        .srd-field-box.textarea {
          min-height: 80px;
          align-items: flex-start;
          line-height: 1.5;
        }

        /* 📊 MESS ATTENDANCE & ANALYTICS 📊 */
        .srd-sec-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .srd-sec-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Fraunces', serif;
        }
        .srd-sec-title::before {
          content: "";
          width: 4px;
          height: 18px;
          background: #800000;
          border-radius: 2px;
          display: inline-block;
        }

        .srd-metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }
        .srd-metric-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow-sm);
        }
        .srd-metric-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        /* BAR CHART */
        .srd-chart-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }
        .srd-bars-container {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          height: 140px;
          padding-top: 20px;
          border-bottom: 1px solid var(--border);
        }
        .srd-bar-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
        }
        .srd-bar {
          width: 100%;
          max-width: 28px;
          background: linear-gradient(180deg, #d97706, #800000);
          border-radius: 6px 6px 0 0;
          transition: height 0.3s ease;
        }
        .srd-bar-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 700;
          margin-top: 8px;
        }

        /* 30-DAY GRID */
        .srd-daily-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
          gap: 8px;
          margin-top: 14px;
        }
        .srd-day-chip {
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }
        .srd-day-chip.present {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        .srd-day-chip.leave {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        /* ⚠️ NOTICE BOX (HIGH AESTHETICS & TYPOGRAPHY) ⚠️ */
        .srd-notice {
          border: 1px solid var(--border);
          border-left: 5px solid #800000;
          background: var(--card);
          border-radius: 18px;
          padding: 24px 28px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          position: relative;
        }
        .srd-notice-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .srd-notice-title {
          font-size: 15px;
          font-weight: 900;
          color: #800000;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin: 0;
          font-family: 'DM Sans', -apple-system, sans-serif;
        }
        .srd-notice-body {
          font-size: 13.5px;
          line-height: 1.7;
          color: var(--text);
          font-weight: 500;
          margin: 0 0 18px;
        }
        .srd-notice-body strong {
          color: #800000;
          font-weight: 800;
        }
        .srd-notice-tags {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .srd-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 24px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2px;
          border: 1px solid transparent;
        }
        .srd-pill-blue {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }
        .srd-pill-red {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }
        .srd-pill-green {
          background: #f0fdf4;
          color: #15803d;
          border-color: #bbf7d0;
        }
      `}</style>

      {/* 🌟 1. TOP STUDENT RECORD CARD (IMAGE MATCH + CHIPS) 🌟 */}
      <div
        className="no-print custom-card prof-header-simple"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '20px 24px',
          borderRadius: '20px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* AVATAR WITH BADGE */}
            <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--border)', overflow: 'hidden', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ position: 'absolute', bottom: '0', right: '0', width: '20px', height: '20px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                🎓
              </div>
            </div>

            {/* NAME & ID */}
            <div className="prof-name-area">
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text)', margin: '0 0 2px', letterSpacing: '0.3px', fontFamily: "'Fraunces', serif" }}>
                {fullName}
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <span>ID: {regNo}</span> • <span>Roll: {rollNo}</span>
              </p>
            </div>
          </div>

          {/* PRINT PDF BUTTON */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handlePrint}
              style={{
                background: '#800000',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '14px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(128, 0, 0, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <span>🖨️</span>
              <span>PRINT PDF</span>
            </button>
          </div>
        </div>

        {/* QUICK DETAILS CHIP ROW */}
        <div className="srd-chip-row">
          <span className="srd-chip">
            <span style={{ color: '#800000' }}>📄</span>
            <span style={{ color: 'var(--text-muted)' }}>Branch:</span>
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>{branch}</span>
          </span>
          <span className="srd-chip">
            <span style={{ color: '#800000' }}>🏠</span>
            <span style={{ color: 'var(--text-muted)' }}>Hostel:</span>
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>{hostelBlock}</span>
          </span>
          <span className="srd-chip">
            <span style={{ color: '#800000' }}>🛏️</span>
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>{roomBed}</span>
          </span>
          <span className="srd-chip">
            <span style={{ color: '#800000' }}>📅</span>
            <span style={{ color: 'var(--text-muted)' }}>Session:</span>
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>{session}</span>
          </span>
          <span className="srd-chip">
            <span style={{ color: '#800000' }}>🩸</span>
            <span style={{ color: 'var(--text-muted)' }}>Blood:</span>
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>{bloodGroup}</span>
          </span>
          <span className="srd-chip">
            <span style={{ color: '#800000' }}>📞</span>
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>{contact}</span>
          </span>
        </div>
      </div>

      {/* 🌟 2. PERSONAL & ACADEMIC RECORDS (FULL FORM GRID WITH ALL HOSTEL/ROOM DETAILS) 🌟 */}
      <div className="no-print srd-form-card">
        <div className="srd-form-head">
          <h3 className="srd-form-title">Personal &amp; Academic Records</h3>
          <span className="srd-lock-badge">
            <span>🔒</span> LOCKED (READ-ONLY)
          </span>
        </div>

        <div className="srd-form-grid">
          {/* FULL NAME */}
          <div className="srd-field-group">
            <label className="srd-field-label">Full Name</label>
            <div className="srd-field-box">{fullName}</div>
          </div>

          {/* REGISTRATION NUMBER */}
          <div className="srd-field-group">
            <label className="srd-field-label">Registration Number</label>
            <div className="srd-field-box" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{regNo}</div>
          </div>

          {/* BRANCH / DEPARTMENT */}
          <div className="srd-field-group">
            <label className="srd-field-label">Branch / Department</label>
            <div className="srd-field-box">{branch}</div>
          </div>

          {/* ACADEMIC SESSION */}
          <div className="srd-field-group">
            <label className="srd-field-label">Academic Session</label>
            <div className="srd-field-box">{session}</div>
          </div>

          {/* ALLOTTED HOSTEL BLOCK */}
          <div className="srd-field-group">
            <label className="srd-field-label">Allotted Hostel Block</label>
            <div className="srd-field-box" style={{ color: '#166534', fontWeight: 700 }}>🏢 {hostelBlock}</div>
          </div>

          {/* ROOM & BED NUMBER */}
          <div className="srd-field-group">
            <label className="srd-field-label">Room &amp; Bed Number</label>
            <div className="srd-field-box" style={{ color: '#1e40af', fontWeight: 700 }}>🛏️ {roomBed}</div>
          </div>

          {/* CONTACT NUMBER */}
          <div className="srd-field-group">
            <label className="srd-field-label">Contact Number</label>
            <div className="srd-field-box">{contact}</div>
          </div>

          {/* EMAIL ADDRESS */}
          <div className="srd-field-group">
            <label className="srd-field-label">Email Address</label>
            <div className="srd-field-box">{email}</div>
          </div>

          {/* BLOOD GROUP */}
          <div className="srd-field-group">
            <label className="srd-field-label">Blood Group</label>
            <div className="srd-field-box">{bloodGroup}</div>
          </div>

          {/* HOME AREA PINCODE */}
          <div className="srd-field-group">
            <label className="srd-field-label">Home Area Pincode</label>
            <div className="srd-field-box">{pincode}</div>
          </div>

          {/* FULL PERMANENT ADDRESS */}
          <div className="srd-field-group" style={{ gridColumn: '1 / -1' }}>
            <label className="srd-field-label">Full Permanent Address</label>
            <div className="srd-field-box textarea">{address}</div>
          </div>
        </div>
      </div>

      {/* 🌟 3. MESS ATTENDANCE & DIETARY ANALYTICS (ON-SCREEN) 🌟 */}
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="srd-sec-head">
          <div className="srd-sec-title">Mess Attendance &amp; Dietary Analytics</div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Biometric &amp; RFID Dining Log</span>
        </div>

        {/* 4 STAT CARDS */}
        <div className="srd-metric-grid">
          <div className="srd-metric-card">
            <CircularBadge percent={monthlyPct} />
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Monthly Attendance</p>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>{monthlyPresent} / {monthlyTotal} Days</h4>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>{monthlyPct}% Current Month</p>
            </div>
          </div>

          <div className="srd-metric-card">
            <div className="srd-metric-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              🍽️
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Meals Consumed</p>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>{totalMeals} Meals</h4>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>B: <b style={{ color: 'var(--text)' }}>{breakfast}</b></span>
                <span>L: <b style={{ color: 'var(--text)' }}>{lunch}</b></span>
                <span>D: <b style={{ color: 'var(--text)' }}>{dinner}</b></span>
              </div>
            </div>
          </div>

          <div className="srd-metric-card">
            <CircularBadge percent={annualPct} label="Annual" />
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Annual Cumulative</p>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>{annualPresent} / {annualTotal} Days</h4>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Across Session</p>
            </div>
          </div>

          <div className="srd-metric-card">
            <div className="srd-metric-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              📝
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Approved Leaves / Outpass</p>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>{leaveDays} Days Absent</h4>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>Pre-approved on Record</p>
            </div>
          </div>
        </div>

        {/* VISUAL CHARTS & 30-DAY ATTENDANCE TRACKER */}
        <div className="srd-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>Monthly Meal Attendance Trend (Jan – Dec)</h5>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Session {session}</span>
          </div>

          <div className="srd-bars-container">
            {monthlyMeals.map((val, i) => (
              <div className="srd-bar-col" key={MONTHS[i]}>
                <div className="srd-bar" style={{ height: `${(val / maxMeals) * 100}%` }} title={`${MONTHS[i]}: ${val} meals`} />
                <span className="srd-bar-label">{MONTHS[i]}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>Daily Activity Tracker — Current Month (30 Days)</h5>
              <div style={{ display: 'flex', gap: '14px', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#16a34a' }}></span>
                  Present ({monthlyPresent}d)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#d97706' }}></span>
                  Leave / Outpass ({leaveDays}d)
                </span>
              </div>
            </div>

            <div className="srd-daily-grid">
              {dailyLog.map((d) => (
                <div key={d.day} className={`srd-day-chip ${d.status}`} title={`Day ${d.day}: ${d.status === 'present' ? 'Present' : 'Leave / Outpass'}`}>
                  {d.day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🌟 4. INSTITUTIONAL MESS POLICY & NOTICE BOX 🌟 */}
        <div className="srd-notice">
          <div className="srd-notice-header">
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <h4 className="srd-notice-title">
              Institutional Mess Policy &amp; Usage Notice
            </h4>
          </div>

          <p className="srd-notice-body">
            Please Note: As per Govt. Polytechnic Hostel &amp; Mess Regulations, monthly mess subscriptions and recurring meal charges are strictly <strong>NON-REFUNDABLE</strong> once billed. The attendance metrics displayed above reflect official biometric &amp; RFID mess logging records. Rebates are applicable strictly on pre-approved leave/outpass submissions exceeding the mandatory threshold.
          </p>

          <div className="srd-notice-tags">
            <div className="srd-pill srd-pill-blue">
              <span>💧</span>
              <span>Official Biometric Logged</span>
            </div>
            <div className="srd-pill srd-pill-red">
              <span>🚫</span>
              <span>Non-Refundable Subscription</span>
            </div>
            <div className="srd-pill srd-pill-green">
              <span>📊</span>
              <span>Audited Mess Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 5. OFFICIAL PRINTABLE STUDENT RECORD SHEET (PRINT-ONLY) 🌟 */}
      <div
        id="student-record-document"
        className="student-record-printable-card hidden print:block"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
          border: '2px solid #cbd5e1',
          fontFamily: "'DM Sans', -apple-system, sans-serif"
        }}
      >
        {/* INSTITUTIONAL HEADER */}
        <div style={{ background: '#800000', color: '#ffffff', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #facc15' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ffffff', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={logo} alt="GP Barh Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 900, margin: 0, letterSpacing: '0.5px' }}>
                GOVERNMENT POLYTECHNIC, BARH
              </h1>
              <p style={{ fontSize: '11px', margin: '2px 0 0', color: '#fef08a', fontWeight: 700 }}>
                DEPARTMENT OF SCIENCE, TECHNOLOGY &amp; TECHNICAL EDUCATION, GOVT. OF BIHAR
              </p>
              <p style={{ fontSize: '10px', margin: '2px 0 0', opacity: 0.85, fontWeight: 500 }}>
                Campus: Agwanpur, Barh, Patna, Bihar - 803213
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.25)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#fef08a', fontWeight: 800, display: 'block' }}>Document Ref:</span>
            <strong style={{ fontSize: '12px', fontFamily: 'monospace' }}>GPB/HST/{session.slice(0,4)}/{regNo.slice(-4)}</strong>
          </div>
        </div>

        {/* SUB-HEADER BANNER */}
        <div style={{ background: '#f8fafc', padding: '10px 28px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <strong style={{ color: '#800000', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 900 }}>
            OFFICIAL HOSTEL &amp; MESS ALLOTMENT DOSSIER
          </strong>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Date of Issue: <strong>{today}</strong></span>
        </div>

        {/* MAIN BODY: PHOTO + DETAILS */}
        <div style={{ padding: '24px 28px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* LEFT: STUDENT PHOTO ID CARD */}
          <div style={{ width: '150px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '130px', height: '155px', borderRadius: '12px', border: '2px solid #0f172a', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={avatarSrc} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textAlign: 'center', width: '100%' }}>
              BLOOD GROUP: {bloodGroup}
            </div>
            <div style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textAlign: 'center', width: '100%' }}>
              GENDER: {isFemale ? 'FEMALE' : 'MALE'}
            </div>
          </div>

          {/* RIGHT: STUDENT PARTICULARS TABLE */}
          <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden' }}>
              <tbody>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', width: '35%', fontSize: '11px', textTransform: 'uppercase' }}>Registration No.</td>
                  <td style={{ padding: '9px 14px', fontWeight: 900, color: '#8b0000', fontFamily: 'monospace', fontSize: '14px' }}>{regNo}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Class Roll No.</td>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#0f172a' }}>{rollNo}</td>
                </tr>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Branch</td>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#0f172a' }}>{branch}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Academic Session</td>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#0f172a' }}>{session}</td>
                </tr>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Hostel &amp; Room</td>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#166534' }}>{hostelBlock} • {roomBed}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Contact Mobile</td>
                  <td style={{ padding: '9px 14px', fontWeight: 700, color: '#0f172a' }}>{contact}</td>
                </tr>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Email Address</td>
                  <td style={{ padding: '9px 14px', fontWeight: 700, color: '#0f172a' }}>{email}</td>
                </tr>
                <tr>
                  <td style={{ padding: '9px 14px', fontWeight: 800, color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>Permanent Address</td>
                  <td style={{ padding: '9px 14px', fontWeight: 600, color: '#334155', lineHeight: 1.4 }}>{address}</td>
                </tr>
              </tbody>
            </table>

            {/* VERIFICATION NOTE */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>✅</span>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>
                This is a computer-generated official student record verified by Government Polytechnic, Barh (Patna).
              </div>
            </div>
          </div>
        </div>

        {/* SIGNATURE BLOCK */}
        <div style={{ background: '#f8fafc', borderTop: '2px dashed #cbd5e1', padding: '20px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px' }}>
          <div style={{ textAlign: 'center', width: '180px' }}>
            <div style={{ height: '32px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Signature of Student</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>({fullName})</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #800000', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#800000', fontSize: '8px', fontWeight: 900, textAlign: 'center', padding: '2px', textTransform: 'uppercase' }}>
              OFFICIAL SEAL<br />GP BARH
            </div>
          </div>

          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ height: '32px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>Chief Warden / Principal</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>Govt. Polytechnic, Barh (Patna)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentRecordDossier;
