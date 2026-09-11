// src/components/StudentRecordDossier.jsx
import React, { useState, useMemo } from 'react';
import logo from '../assets/logo.png.png';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Comprehensive 12-Month Realistic Academic Dataset
const ANNUAL_MESS_DATA = [
  { month: "Jan", full: "January", meals: 76, breakfast: 25, lunch: 26, dinner: 25, present: 26, absent: 5, pct: 83.9, tag: "Winter Session" },
  { month: "Feb", full: "February", meals: 70, breakfast: 23, lunch: 24, dinner: 23, present: 24, absent: 4, pct: 85.7, tag: "Regular" },
  { month: "Mar", full: "March", meals: 81, breakfast: 27, lunch: 27, dinner: 27, present: 27, absent: 4, pct: 87.1, tag: "Mid-Term" },
  { month: "Apr", full: "April", meals: 78, breakfast: 26, lunch: 26, dinner: 26, present: 26, absent: 4, pct: 86.7, tag: "Regular" },
  { month: "May", full: "May", meals: 84, breakfast: 28, lunch: 28, dinner: 28, present: 28, absent: 3, pct: 90.3, tag: "Exam Month" },
  { month: "Jun", full: "June", meals: 30, breakfast: 10, lunch: 10, dinner: 10, present: 10, absent: 20, pct: 33.3, tag: "Summer Vacation" },
  { month: "Jul", full: "July", meals: 65, breakfast: 22, lunch: 21, dinner: 22, present: 22, absent: 9, pct: 71.0, tag: "Semester Start" },
  { month: "Aug", full: "August", meals: 82, breakfast: 27, lunch: 28, dinner: 27, present: 28, absent: 3, pct: 90.3, tag: "Peak Attendance" },
  { month: "Sep", full: "September", meals: 78, breakfast: 26, lunch: 26, dinner: 26, present: 26, absent: 4, pct: 86.7, tag: "Current Month" },
  { month: "Oct", full: "October", meals: 54, breakfast: 18, lunch: 18, dinner: 18, present: 18, absent: 13, pct: 58.1, tag: "Festivals Break" },
  { month: "Nov", full: "November", meals: 75, breakfast: 25, lunch: 25, dinner: 25, present: 25, absent: 5, pct: 83.3, tag: "Regular" },
  { month: "Dec", full: "December", meals: 60, breakfast: 20, lunch: 20, dinner: 20, present: 20, absent: 11, pct: 64.5, tag: "Winter Recess" },
];

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
  const todayDate = new Date();
  const today = todayDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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

  // Calendar and View States (Monthly vs 1-Year View)
  const [activeTab, setActiveTab] = useState('month'); // 'month' | 'year'
  const [activeMonth, setActiveMonth] = useState(8); // 0-indexed: 8 = September 2026
  const [activeYear, setActiveYear] = useState(2026);
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(8);
  const [chartMode, setChartMode] = useState('stacked'); // 'stacked' | 'trend'

  // Calculate calendar grid for current active month
  const calendarData = useMemo(() => {
    const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
    const startDay = new Date(activeYear, activeMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const leaveSet = new Set([4, 11, 18, 25]);
    
    const rows = [];
    let currentRow = [];
    
    // Add empty slots before the 1st day
    for (let i = 0; i < startDay; i++) {
      currentRow.push({ empty: true, key: `empty-${i}` });
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const isLeave = leaveSet.has(d);
      currentRow.push({
        empty: false,
        day: d,
        status: isLeave ? 'leave' : 'present',
        key: `day-${d}`
      });
      
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }
    
    if (currentRow.length > 0) {
      while (currentRow.length < 7) {
        currentRow.push({ empty: true, key: `empty-tail-${currentRow.length}` });
      }
      rows.push(currentRow);
    }
    
    return { daysInMonth, rows };
  }, [activeMonth, activeYear]);

  const handlePrevMonth = () => {
    if (activeMonth === 0) {
      setActiveMonth(11);
      setActiveYear(prev => prev - 1);
    } else {
      setActiveMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (activeMonth === 11) {
      setActiveMonth(0);
      setActiveYear(prev => prev + 1);
    } else {
      setActiveMonth(prev => prev + 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeData = ANNUAL_MESS_DATA[hoveredMonthIdx] || ANNUAL_MESS_DATA[8];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        /* 🏷️ CHIPS STYLING 🏷️ */
        .srd-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          width: 100%;
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

        /* 🎨 UNIFIED CARD & FORM GRID 🎨 */
        .srd-unified-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 26px 30px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .srd-form-title {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 800;
          color: var(--text);
          margin: 0;
          letter-spacing: -0.2px;
        }
        .srd-form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px 22px;
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
          gap: 12px;
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

        /* VIEW SWITCHER TABS */
        .srd-view-switcher {
          display: flex;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 3px;
          gap: 4px;
        }
        .srd-view-tab {
          border: none;
          background: transparent;
          color: var(--text-muted);
          padding: 6px 14px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .srd-view-tab.active {
          background: #800000;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(128, 0, 0, 0.3);
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

        /* 🗓️ SLEEK CALENDAR WIDGET (IMAGE 1 EXACT MATCH) 🗓️ */
        .srd-cal-container {
          background: #14171c;
          color: #ffffff;
          border-radius: 24px;
          padding: 24px 28px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
          overflow: hidden;
        }
        .srd-cal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .srd-cal-top-tag {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
          color: #f97316;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .srd-cal-month-title {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.5px;
          color: #ffffff;
          margin: 0;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
        }
        .srd-cal-day-badge {
          background: #f97316;
          color: #000000;
          border-radius: 14px;
          padding: 8px 18px;
          display: flex;
          align-items: baseline;
          gap: 6px;
          box-shadow: 0 4px 16px rgba(249, 115, 22, 0.4);
        }
        .srd-cal-day-badge strong {
          font-size: 26px;
          font-weight: 900;
          line-height: 1;
        }
        .srd-cal-day-badge span {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .srd-cal-nav-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #ffffff;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
        }
        .srd-cal-nav-btn:hover {
          background: #f97316;
          color: #000;
        }

        .srd-cal-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 12px;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        .srd-cal-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0;
          margin-bottom: 10px;
          position: relative;
        }
        .srd-cal-cell {
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
          color: #e2e8f0;
          position: relative;
          z-index: 2;
        }
        .srd-cal-cell.empty {
          opacity: 0;
        }

        .srd-cal-cell.present {
          background: #f97316;
          color: #000000;
        }
        .srd-cal-cell.present.first-in-row {
          border-top-left-radius: 22px;
          border-bottom-left-radius: 22px;
        }
        .srd-cal-cell.present.last-in-row {
          border-top-right-radius: 22px;
          border-bottom-right-radius: 22px;
        }
        .srd-cal-cell.leave {
          background: rgba(255,255,255,0.08);
          color: #f87171;
          border-radius: 12px;
        }

        /* 🗓️ 1-YEAR (12-MONTH) OVERVIEW GRID 🗓️ */
        .srd-year-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .srd-year-month-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 16px 18px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: var(--shadow-sm);
        }
        .srd-year-month-card:hover {
          border-color: #800000;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(128, 0, 0, 0.12);
        }
        .srd-year-month-card.active {
          border-color: #800000;
          background: var(--input-bg);
          box-shadow: 0 0 0 2px rgba(128,0,0,0.2);
        }

        /* 📈 ADVANCED INTERACTIVE GRAPH STYLING 📈 */
        .srd-analytics-chart-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px 28px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .srd-chart-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .srd-chart-mode-pill {
          display: flex;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 2px;
          gap: 4px;
        }
        .srd-chart-btn {
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.2s;
        }
        .srd-chart-btn.active {
          background: var(--card);
          color: #800000;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border);
        }

        /* DYNAMIC HOVER DETAILS BOX */
        .srd-hover-detail-bar {
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .srd-hover-tag {
          font-size: 11px;
          font-weight: 800;
          background: rgba(128, 0, 0, 0.1);
          color: #800000;
          padding: 3px 10px;
          border-radius: 20px;
          text-transform: uppercase;
        }

        /* SVG CHART CONTAINER */
        .srd-svg-wrap {
          width: 100%;
          overflow-x: auto;
          position: relative;
        }

        /* ⚠️ NOTICE BOX ⚠️ */
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

      {/* 🌟 1. ALL-IN-ONE UNIFIED STUDENT PROFILE & DETAILS CARD (ON-SCREEN) 🌟 */}
      <div className="no-print srd-unified-card">
        {/* TOP PROFILE BAR */}
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
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', margin: '0 0 2px', letterSpacing: '0.3px', fontFamily: "'Fraunces', serif" }}>
                {fullName}
              </h2>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
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
        <div className="srd-chip-row" style={{ paddingTop: '14px' }}>
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

        {/* PERSONAL & ACADEMIC RECORDS */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <h3 className="srd-form-title" style={{ marginBottom: '18px' }}>
            Personal &amp; Academic Records
          </h3>

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
      </div>

      {/* 🌟 2. MESS ATTENDANCE & DIETARY ANALYTICS (ON-SCREEN) 🌟 */}
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="srd-sec-head">
          <div className="srd-sec-title">Mess Attendance &amp; Dietary Analytics</div>
          
          {/* VIEW SWITCHER: MONTH CALENDAR vs 1-YEAR OVERVIEW */}
          <div className="srd-view-switcher">
            <button
              type="button"
              className={`srd-view-tab ${activeTab === 'month' ? 'active' : ''}`}
              onClick={() => setActiveTab('month')}
            >
              📅 Monthly Calendar
            </button>
            <button
              type="button"
              className={`srd-view-tab ${activeTab === 'year' ? 'active' : ''}`}
              onClick={() => setActiveTab('year')}
            >
              🗓️ 1-Year (12 Months)
            </button>
          </div>
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

        {/* 🗓️ VIEW 1: MONTHLY CALENDAR WIDGET (IMAGE 1 EXACT DESIGN) 🗓️ */}
        {activeTab === 'month' && (
          <div className="srd-cal-container">
            <div className="srd-cal-header">
              <div>
                <div className="srd-cal-top-tag">MESS ATTENDANCE TRACKER</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button type="button" onClick={handlePrevMonth} className="srd-cal-nav-btn" title="Previous Month">❮</button>
                  <h4 className="srd-cal-month-title">{MONTH_NAMES[activeMonth]} {activeYear}</h4>
                  <button type="button" onClick={handleNextMonth} className="srd-cal-nav-btn" title="Next Month">❯</button>
                </div>
              </div>

              {/* HIGHLIGHT DAY BADGE */}
              <div className="srd-cal-day-badge">
                <strong>{monthlyPresent}</strong>
                <span>DAYS PRESENT</span>
              </div>
            </div>

            {/* WEEKDAY HEADERS */}
            <div className="srd-cal-weekdays">
              <span>SU</span>
              <span>MO</span>
              <span>TU</span>
              <span>WE</span>
              <span>TH</span>
              <span>FR</span>
              <span>SA</span>
            </div>

            {/* CALENDAR ROWS WITH CAPSULE STYLING */}
            {calendarData.rows.map((row, rIdx) => (
              <div className="srd-cal-row" key={`row-${rIdx}`}>
                {row.map((cell, cIdx) => {
                  if (cell.empty) {
                    return <div className="srd-cal-cell empty" key={cell.key} />;
                  }

                  const isPresent = cell.status === 'present';
                  const isLeave = cell.status === 'leave';

                  const prevCell = cIdx > 0 ? row[cIdx - 1] : null;
                  const nextCell = cIdx < 6 ? row[cIdx + 1] : null;

                  const isFirstInStreak = isPresent && (!prevCell || prevCell.empty || prevCell.status !== 'present');
                  const isLastInStreak = isPresent && (!nextCell || nextCell.empty || nextCell.status !== 'present');

                  let classNames = 'srd-cal-cell';
                  if (isPresent) {
                    classNames += ' present';
                    if (isFirstInStreak) classNames += ' first-in-row';
                    if (isLastInStreak) classNames += ' last-in-row';
                  } else if (isLeave) {
                    classNames += ' leave';
                  }

                  return (
                    <div
                      key={cell.key}
                      className={classNames}
                      title={`Day ${cell.day} ${MONTH_SHORT[activeMonth]}: ${isPresent ? 'Present (Meals Consumed)' : 'Leave / Outpass'}`}
                    >
                      {cell.day}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* LEGEND / STATUS BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f97316', fontWeight: 800 }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#f97316' }}></span>
                  Active Present ({monthlyPresent} Days)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontWeight: 800 }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)', border: '1px solid #f87171' }}></span>
                  Leave / Outpass ({leaveDays} Days)
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                Biometric Terminal Synced • GP Barh Mess
              </span>
            </div>
          </div>
        )}

        {/* 🗓️ VIEW 2: 1-YEAR (12-MONTHS) ANNUAL OVERVIEW GRID 🗓️ */}
        {activeTab === 'year' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="srd-year-grid">
              {ANNUAL_MESS_DATA.map((mData, mIdx) => {
                const isSelected = mIdx === activeMonth;

                return (
                  <div
                    key={mData.full}
                    className={`srd-year-month-card ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setActiveMonth(mIdx);
                      setActiveTab('month');
                    }}
                    title={`Click to view full calendar for ${mData.full}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{mData.full}</strong>
                      <span style={{ fontSize: '11px', fontWeight: 800, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px' }}>
                        {mData.pct}%
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Present: <b style={{ color: 'var(--text)' }}>{mData.present} Days</b> • Meals: <b style={{ color: '#800000' }}>{mData.meals}</b>
                    </div>

                    {/* MINI ATTENDANCE PROGRESS BAR */}
                    <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${mData.pct}%`, height: '100%', background: 'linear-gradient(90deg, #f97316, #800000)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 📊 🌟 NEW ADVANCED INTERACTIVE DATA GRAPH 🌟 📊 */}
        <div className="srd-analytics-chart-card">
          <div className="srd-chart-top-bar">
            <div>
              <h5 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: 'var(--text)', fontFamily: "'Fraunces', serif" }}>
                Annual 12-Month Dining &amp; Dietary Analytics
              </h5>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Interactive monthly meal volume &amp; category breakdown (Academic Session {session})
              </p>
            </div>

            {/* CHART MODE BUTTONS */}
            <div className="srd-chart-mode-pill">
              <button
                type="button"
                className={`srd-chart-btn ${chartMode === 'stacked' ? 'active' : ''}`}
                onClick={() => setChartMode('stacked')}
              >
                📊 Stacked Meals
              </button>
              <button
                type="button"
                className={`srd-chart-btn ${chartMode === 'trend' ? 'active' : ''}`}
                onClick={() => setChartMode('trend')}
              >
                📈 Trendline Curve
              </button>
            </div>
          </div>

          {/* DYNAMIC HOVER / SELECTED MONTH DETAIL CARD */}
          <div className="srd-hover-detail-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>🍽️</span>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--text)' }}>{activeData.full} 2026 Record:</strong>
                <span className="srd-hover-tag" style={{ marginLeft: '8px' }}>{activeData.tag}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '12.5px' }}>
              <span>Total Meals: <b style={{ color: '#800000', fontSize: '14px' }}>{activeData.meals}</b></span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }}></span>
                Breakfast: <b>{activeData.breakfast}</b>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></span>
                Lunch: <b>{activeData.lunch}</b>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#800000' }}></span>
                Dinner: <b>{activeData.dinner}</b>
              </span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>Attendance: <b style={{ color: '#16a34a' }}>{activeData.pct}%</b></span>
            </div>
          </div>

          {/* SVG DATA GRAPH */}
          <div className="srd-svg-wrap">
            <svg
              viewBox="0 0 780 220"
              style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}
            >
              <defs>
                <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#800000" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#800000" />
                </linearGradient>
              </defs>

              {/* GRID LINES & Y-AXIS LABELS */}
              {[90, 60, 30, 0].map((val) => {
                const y = 180 - (val / 90) * 140;
                return (
                  <g key={val}>
                    <line x1="45" y1={y} x2="760" y2={y} stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
                    <text x="35" y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-muted)" fontWeight="600">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* MODE 1: STACKED BARS WITH EXACT VALUES */}
              {chartMode === 'stacked' && (
                <g>
                  {ANNUAL_MESS_DATA.map((d, i) => {
                    const x = 55 + i * 58;
                    const bH = (d.breakfast / 90) * 140;
                    const lH = (d.lunch / 90) * 140;
                    const dH = (d.dinner / 90) * 140;
                    const totalH = bH + lH + dH;
                    const topY = 180 - totalH;
                    const isHovered = hoveredMonthIdx === i;

                    return (
                      <g
                        key={d.month}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={() => setHoveredMonthIdx(i)}
                        onClick={() => {
                          setActiveMonth(i);
                          setActiveTab('month');
                        }}
                      >
                        {/* HOVER HIGHLIGHT COLUMN */}
                        {isHovered && (
                          <rect
                            x={x - 6}
                            y="20"
                            width="40"
                            height="165"
                            rx="8"
                            fill="rgba(128, 0, 0, 0.08)"
                          />
                        )}

                        {/* DINNER SEGMENT (BOTTOM) */}
                        <rect
                          x={x}
                          y={180 - dH}
                          width="28"
                          height={dH}
                          fill={isHovered ? '#800000' : '#8b0000'}
                          rx="0"
                        />

                        {/* LUNCH SEGMENT (MIDDLE) */}
                        <rect
                          x={x}
                          y={180 - dH - lH}
                          width="28"
                          height={lH}
                          fill="#f59e0b"
                          rx="0"
                        />

                        {/* BREAKFAST SEGMENT (TOP) */}
                        <rect
                          x={x}
                          y={topY}
                          width="28"
                          height={bH}
                          fill="#0284c7"
                          rx="4"
                        />

                        {/* TOTAL MEAL VALUE ON TOP */}
                        <rect
                          x={x - 2}
                          y={topY - 20}
                          width="32"
                          height="16"
                          rx="4"
                          fill={isHovered ? '#800000' : 'var(--input-bg)'}
                          stroke="var(--border)"
                          strokeWidth="1"
                        />
                        <text
                          x={x + 14}
                          y={topY - 8}
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="800"
                          fill={isHovered ? '#ffffff' : 'var(--text)'}
                        >
                          {d.meals}
                        </text>

                        {/* MONTH LABEL */}
                        <text
                          x={x + 14}
                          y="198"
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight={isHovered ? '900' : '700'}
                          fill={isHovered ? '#800000' : 'var(--text-muted)'}
                        >
                          {d.month}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* MODE 2: SMOOTH SPLINE & AREA CURVE */}
              {chartMode === 'trend' && (() => {
                const points = ANNUAL_MESS_DATA.map((d, i) => {
                  const x = 70 + i * 58;
                  const y = 180 - (d.meals / 90) * 140;
                  return { x, y, d, i };
                });

                // Build SVG path
                const linePath = points.reduce((acc, p, i, arr) => {
                  if (i === 0) return `M ${p.x} ${p.y}`;
                  const prev = arr[i - 1];
                  const cx1 = prev.x + (p.x - prev.x) / 2;
                  const cy1 = prev.y;
                  const cx2 = prev.x + (p.x - prev.x) / 2;
                  const cy2 = p.y;
                  return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
                }, "");

                const areaPath = `${linePath} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                return (
                  <g>
                    {/* Glowing Area Fill */}
                    <path d={areaPath} fill="url(#areaGlow)" />
                    {/* Trend Line */}
                    <path d={linePath} fill="none" stroke="#800000" strokeWidth="3" strokeLinecap="round" />

                    {/* Data Points */}
                    {points.map(({ x, y, d, i }) => {
                      const isHovered = hoveredMonthIdx === i;
                      return (
                        <g
                          key={d.month}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredMonthIdx(i)}
                          onClick={() => {
                            setActiveMonth(i);
                            setActiveTab('month');
                          }}
                        >
                          {/* Point Circle */}
                          <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? 7 : 4.5}
                            fill={isHovered ? '#f97316' : '#800000'}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          {/* Value Tag */}
                          <text
                            x={x}
                            y={y - 12}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="800"
                            fill="var(--text)"
                          >
                            {d.meals}
                          </text>
                          {/* Month Label */}
                          <text
                            x={x}
                            y="198"
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight={isHovered ? '900' : '700'}
                            fill={isHovered ? '#800000' : 'var(--text-muted)'}
                          >
                            {d.month}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* GRAPH FOOTER SUMMARY CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#0284c7' }}></span>
              <span style={{ color: 'var(--text-muted)' }}>Breakfast (Morning):</span>
              <b style={{ color: 'var(--text)' }}>274 Total</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }}></span>
              <span style={{ color: 'var(--text-muted)' }}>Lunch (Afternoon):</span>
              <b style={{ color: 'var(--text)' }}>276 Total</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#800000' }}></span>
              <span style={{ color: 'var(--text-muted)' }}>Dinner (Night):</span>
              <b style={{ color: 'var(--text)' }}>274 Total</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ fontSize: '13px' }}>🏆</span>
              <span style={{ color: 'var(--text-muted)' }}>Annual Attendance:</span>
              <b style={{ color: '#16a34a' }}>89.1% Active</b>
            </div>
          </div>
        </div>

        {/* 🌟 3. INSTITUTIONAL MESS POLICY & NOTICE BOX 🌟 */}
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

      {/* 🌟 4. OFFICIAL PRINTABLE STUDENT RECORD SHEET (PRINT-ONLY) 🌟 */}
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
