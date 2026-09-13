// src/components/StudentRecordDossier.jsx
import React, { useState, useMemo } from 'react';
import logo from '../assets/logo.png.png';

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Comprehensive Multi-Year Realistic Academic Dataset (Single QR Scan = 4 Meals Active)
const MULTI_YEAR_MESS_DATA = {
  2026: [
    { month: "Jan", full: "January", daysTotal: 31, present: 26, leave: 5, pct: 83.9, tag: "Winter Session", mealsCovered: 104 },
    { month: "Feb", full: "February", daysTotal: 28, present: 24, leave: 4, pct: 85.7, tag: "Regular Session", mealsCovered: 96 },
    { month: "Mar", full: "March", daysTotal: 31, present: 27, leave: 4, pct: 87.1, tag: "Mid-Term Exams", mealsCovered: 108 },
    { month: "Apr", full: "April", daysTotal: 30, present: 26, leave: 4, pct: 86.7, tag: "Regular Session", mealsCovered: 104 },
    { month: "May", full: "May", daysTotal: 31, present: 28, leave: 3, pct: 90.3, tag: "End-Semester", mealsCovered: 112 },
    { month: "Jun", full: "June", daysTotal: 30, present: 20, leave: 10, pct: 66.7, tag: "Summer Session", mealsCovered: 80 },
    { month: "Jul", full: "July", daysTotal: 31, present: 22, leave: 9, pct: 71.0, tag: "Semester Start", mealsCovered: 88 },
    { month: "Aug", full: "August", daysTotal: 31, present: 28, leave: 3, pct: 90.3, tag: "Peak Attendance", mealsCovered: 112 },
    { month: "Sep", full: "September", daysTotal: 30, present: 26, leave: 4, pct: 86.7, tag: "Current Month", mealsCovered: 104 },
    { month: "Oct", full: "October", daysTotal: 31, present: 18, leave: 13, pct: 58.1, tag: "Puja/Diwali Break", mealsCovered: 72 },
    { month: "Nov", full: "November", daysTotal: 30, present: 25, leave: 5, pct: 83.3, tag: "Regular Session", mealsCovered: 100 },
    { month: "Dec", full: "December", daysTotal: 31, present: 20, leave: 11, pct: 64.5, tag: "Winter Break", mealsCovered: 80 },
  ],
  2027: [
    { month: "Jan", full: "January", daysTotal: 31, present: 27, leave: 4, pct: 87.1, tag: "Winter Session", mealsCovered: 108 },
    { month: "Feb", full: "February", daysTotal: 28, present: 25, leave: 3, pct: 89.3, tag: "Regular Session", mealsCovered: 100 },
    { month: "Mar", full: "March", daysTotal: 31, present: 28, leave: 3, pct: 90.3, tag: "Mid-Term Exams", mealsCovered: 112 },
    { month: "Apr", full: "April", daysTotal: 30, present: 27, leave: 3, pct: 90.0, tag: "Regular Session", mealsCovered: 108 },
    { month: "May", full: "May", daysTotal: 31, present: 29, leave: 2, pct: 93.5, tag: "End-Semester", mealsCovered: 116 },
    { month: "Jun", full: "June", daysTotal: 30, present: 12, leave: 18, pct: 40.0, tag: "Summer Vacation", mealsCovered: 48 },
    { month: "Jul", full: "July", daysTotal: 31, present: 24, leave: 7, pct: 77.4, tag: "Semester Start", mealsCovered: 96 },
    { month: "Aug", full: "August", daysTotal: 31, present: 28, leave: 3, pct: 90.3, tag: "Regular Session", mealsCovered: 112 },
    { month: "Sep", full: "September", daysTotal: 30, present: 26, leave: 4, pct: 86.7, tag: "Regular Session", mealsCovered: 104 },
    { month: "Oct", full: "October", daysTotal: 31, present: 19, leave: 12, pct: 61.3, tag: "Festival Break", mealsCovered: 76 },
    { month: "Nov", full: "November", daysTotal: 30, present: 26, leave: 4, pct: 86.7, tag: "Regular Session", mealsCovered: 104 },
    { month: "Dec", full: "December", daysTotal: 31, present: 22, leave: 9, pct: 71.0, tag: "Winter Break", mealsCovered: 88 },
  ],
  2028: [
    { month: "Jan", full: "January", daysTotal: 31, present: 28, leave: 3, pct: 90.3, tag: "Final Year Session", mealsCovered: 112 },
    { month: "Feb", full: "February", daysTotal: 29, present: 26, leave: 3, pct: 89.7, tag: "Regular Session", mealsCovered: 104 },
    { month: "Mar", full: "March", daysTotal: 31, present: 28, leave: 3, pct: 90.3, tag: "Project Submissions", mealsCovered: 112 },
    { month: "Apr", full: "April", daysTotal: 30, present: 28, leave: 2, pct: 93.3, tag: "Final Exams", mealsCovered: 112 },
    { month: "May", full: "May", daysTotal: 31, present: 30, leave: 1, pct: 96.8, tag: "Convocation Session", mealsCovered: 120 },
    { month: "Jun", full: "June", daysTotal: 30, present: 15, leave: 15, pct: 50.0, tag: "Internship Period", mealsCovered: 60 },
    { month: "Jul", full: "July", daysTotal: 31, present: 26, leave: 5, pct: 83.9, tag: "Placement Drive", mealsCovered: 104 },
    { month: "Aug", full: "August", daysTotal: 31, present: 29, leave: 2, pct: 93.5, tag: "Campus Recruitment", mealsCovered: 116 },
    { month: "Sep", full: "September", daysTotal: 30, present: 27, leave: 3, pct: 90.0, tag: "Final Projects", mealsCovered: 108 },
    { month: "Oct", full: "October", daysTotal: 31, present: 20, leave: 11, pct: 64.5, tag: "Festival Break", mealsCovered: 80 },
    { month: "Nov", full: "November", daysTotal: 30, present: 27, leave: 3, pct: 90.0, tag: "Regular Session", mealsCovered: 108 },
    { month: "Dec", full: "December", daysTotal: 31, present: 24, leave: 7, pct: 77.4, tag: "Valedictory Meet", mealsCovered: 96 },
  ]
};

const ANNUAL_MESS_DATA = MULTI_YEAR_MESS_DATA[2026];

function CircularBadge({ percent, size = 56, stroke = 5, label, color = "#800000" }) {
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
          opacity="0.5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
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
        <strong style={{ fontSize: '13px', fontWeight: 900, color }}>{percent}%</strong>
        {label ? <span style={{ fontSize: '8.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</span> : null}
      </div>
    </div>
  );
}

// Single field renderer used by the Personal & Academic Records grid.
// Having one definition (icon + label + value) means every record is
// authored once and rendered once — no second "quick glance" copy of
// the same data drifting out of sync elsewhere in the card.
function RecordField({ icon, label, value, tone, mono, span2, multiline }) {
  return (
    <div className="srd-field-group" style={span2 ? { gridColumn: '1 / -1' } : undefined}>
      <label className="srd-field-label">{label}</label>
      <div className={`srd-field-box${multiline ? ' textarea' : ''}`} style={{ color: tone || 'var(--text)', fontFamily: mono ? 'monospace' : undefined, fontWeight: mono ? 700 : 600 }}>
        {icon ? <span style={{ marginRight: '8px' }}>{icon}</span> : null}
        {value}
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
  
  const getCleanHostelBlock = () => {
    // 1. Direct specific block name from allotmentInfo
    const rawAllotmentBlock = String(allotmentInfo?.block_name || allotmentInfo?.block || allotmentInfo?.hostel_block || allotmentInfo?.hostelBlock || '').trim();
    if (rawAllotmentBlock && !rawAllotmentBlock.includes('&') && !rawAllotmentBlock.includes('Blocks)')) {
      return rawAllotmentBlock;
    }

    // 2. Check profileData and currentUser
    const rawProfileBlock = String(profileData?.hostelBlock || profileData?.hostel_block || currentUser?.hostel_block || currentUser?.hostelBlock || '').trim();
    if (rawProfileBlock && !rawProfileBlock.includes('&') && !rawProfileBlock.includes('Blocks)')) {
      return rawProfileBlock;
    }

    // 3. Wing-based detection (BIRSA vs RAJENDRA)
    const wingStr = String(allotmentInfo?.wing || allotmentInfo?.wing_name || '').toUpperCase();
    if (wingStr.includes('RAJENDRA') || wingStr.includes('RIGHT')) {
      return 'Dr. Rajendra Prasad Boys Hostel';
    }
    if (wingStr.includes('BIRSA') || wingStr.includes('LEFT')) {
      return 'Birsa Munda Boys Hostel';
    }

    // 4. Check if allotmentInfo hostel_name is already a specific single hostel
    const rawHostelName = String(allotmentInfo?.hostel_name || '').trim();
    if (rawHostelName && !rawHostelName.includes('&') && !rawHostelName.includes('Dr. Rajendra Prasad Blocks')) {
      return rawHostelName;
    }

    // 5. Keyword search in composite strings
    const combinedStr = `${rawAllotmentBlock} ${rawProfileBlock} ${rawHostelName} ${profileData?.hostelBlock || ''}`.toLowerCase();
    if (combinedStr.includes('rajendra')) {
      return 'Dr. Rajendra Prasad Boys Hostel';
    }
    if (combinedStr.includes('birsa')) {
      return 'Birsa Munda Boys Hostel';
    }
    if (combinedStr.includes('savitribai') || isFemale) {
      return 'Savitribai Phule Girls Hostel';
    }

    return isFemale ? 'Savitribai Phule Girls Hostel' : 'Birsa Munda Boys Hostel';
  };
  const hostelBlock = getCleanHostelBlock();

  const roomBed = (allotmentInfo?.room_number && allotmentInfo?.bed_code)
    ? `Room ${allotmentInfo.room_number} • Bed ${allotmentInfo.bed_code}`
    : (allotmentInfo?.roomNo ? `Room ${allotmentInfo.roomNo} • Bed ${allotmentInfo.bedNo || 'A'}` : (profileData?.roomNumber ? `Room ${profileData.roomNumber} • Bed ${profileData.bedNumber || 'A'}` : (isFemale ? 'Room 101 • Bed A' : 'Room 101 • Bed 1 (Bed A)')));

  // Calendar and View States
  const [activeTab, setActiveTab] = useState('month'); // 'month' | 'year'
  const [activeMonth, setActiveMonth] = useState(8); // 0-indexed: 8 = September 2026
  const [activeYear, setActiveYear] = useState(2026);
  const [selectedGraphYear, setSelectedGraphYear] = useState(2026);
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(8);
  const [chartMode, setChartMode] = useState('bars'); // 'bars' | 'trend'

  // Dynamic Real-Time Academic Dataset Calculations
  const currentYearData = MULTI_YEAR_MESS_DATA[activeYear] || MULTI_YEAR_MESS_DATA[2026];
  const currentMonthData = currentYearData[activeMonth] || currentYearData[8];

  const monthlyPresent = currentMonthData.present;
  const monthlyTotal = currentMonthData.daysTotal;
  const monthlyPct = currentMonthData.pct;
  const monthlyMealsCovered = currentMonthData.mealsCovered;
  const leaveDays = currentMonthData.leave;

  const annualTotalDaysPresent = useMemo(() => currentYearData.reduce((sum, m) => sum + m.present, 0), [currentYearData]);
  const annualTotalDaysTotal = useMemo(() => currentYearData.reduce((sum, m) => sum + m.daysTotal, 0), [currentYearData]);
  const annualTotalMeals = useMemo(() => currentYearData.reduce((sum, m) => sum + m.mealsCovered, 0), [currentYearData]);
  const annualPct = useMemo(
    () => Number(((annualTotalDaysPresent / annualTotalDaysTotal) * 100).toFixed(1)),
    [annualTotalDaysPresent, annualTotalDaysTotal]
  );

  // Calculate calendar grid for current active month
  const calendarData = useMemo(() => {
    const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
    const startDay = new Date(activeYear, activeMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const leaveSet = new Set([4, 11, 18, 25]);

    const rows = [];
    let currentRow = [];

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
        /* ============================================================
           BASE — fluid spacing units shared by every section so the
           same file reads correctly from a ~360px app webview up to a
           wide desktop monitor without separate mobile/desktop code.
           ============================================================ */
        .srd-shell {
          --pad-lg: clamp(16px, 3vw, 30px);
          --pad-md: clamp(14px, 2.4vw, 22px);
          --radius-lg: 20px;
          --radius-md: 14px;
        }

        /* 🎨 UNIFIED CARD & FORM GRID 🎨 */
        .srd-unified-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--pad-lg);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .srd-profile-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .srd-profile-id {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }
        .srd-avatar-wrap {
          position: relative;
          width: 64px;
          height: 64px;
          flex-shrink: 0;
        }
        .srd-name-area {
          min-width: 0;
        }
        .srd-name-area h2 {
          font-size: clamp(17px, 2.6vw, 20px);
          font-weight: 900;
          color: var(--text);
          margin: 0 0 4px;
          letter-spacing: 0.2px;
          font-family: 'Fraunces', serif;
          overflow-wrap: anywhere;
        }
        .srd-name-meta {
          margin: 0;
          font-size: 12.5px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          flex-wrap: wrap;
        }
        .srd-print-btn {
          background: #800000;
          color: #ffffff;
          border: none;
          padding: 11px 20px;
          border-radius: 14px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(128, 0, 0, 0.25);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          white-space: nowrap;
        }
        .srd-print-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(128, 0, 0, 0.32);
        }
        .srd-print-btn:active {
          transform: translateY(0);
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
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 16px 20px;
        }
        .srd-field-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
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
          overflow-wrap: anywhere;
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
          padding: 8px 14px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 36px;
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
          border-radius: 18px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .srd-metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.07);
          border-color: rgba(128, 0, 0, 0.3);
        }
        .srd-metric-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .srd-metric-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .srd-metric-badge-pill {
          font-size: 11px;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 20px;
          letter-spacing: 0.3px;
        }
        .srd-metric-label {
          font-size: 11.5px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin: 0 0 6px;
        }
        .srd-metric-hero-val {
          font-size: 26px;
          font-weight: 900;
          color: var(--text);
          line-height: 1.1;
          margin: 0 0 14px;
          font-family: 'DM Sans', sans-serif;
        }
        .srd-metric-progress-track {
          width: 100%;
          height: 6px;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 10px;
        }
        .srd-metric-progress-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .srd-metric-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 700;
        }

        /* 🗓️ SLEEK CALENDAR WIDGET (GP BARH BRAND IDENTITY) 🗓️ */
        .srd-cal-container {
          background: linear-gradient(145deg, #090d16 0%, #111827 50%, #1e2230 100%);
          color: #ffffff;
          border-radius: var(--radius-lg);
          padding: var(--pad-lg);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
          border: 1px solid rgba(139, 13, 13, 0.35);
          border-top: 3px solid #8B0D0D;
          position: relative;
          overflow: hidden;
        }
        .srd-cal-container::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(139, 13, 13, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .srd-cal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 24px;
          position: relative;
          z-index: 2;
        }
        .srd-cal-top-tag {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
          color: #fbbf24;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .srd-cal-month-title {
          font-size: clamp(18px, 3vw, 24px);
          font-weight: 900;
          letter-spacing: 0.5px;
          color: #ffffff;
          margin: 0;
          text-transform: uppercase;
          font-family: 'Fraunces', serif;
        }
        .srd-cal-day-badge {
          background: linear-gradient(135deg, #8B0D0D 0%, #b91c1c 60%, #991b1b 100%);
          border: 1px solid rgba(250, 204, 21, 0.4);
          color: #ffffff;
          border-radius: 14px;
          padding: 8px 18px;
          display: flex;
          align-items: baseline;
          gap: 6px;
          box-shadow: 0 4px 18px rgba(139, 13, 13, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2);
          white-space: nowrap;
        }
        .srd-cal-day-badge strong {
          font-size: 26px;
          font-weight: 900;
          line-height: 1;
          color: #fef08a;
          font-family: 'DM Sans', sans-serif;
        }
        .srd-cal-day-badge span {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #ffffff;
        }

        .srd-cal-nav-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          border-radius: 10px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .srd-cal-nav-btn:hover {
          background: #8B0D0D;
          border-color: #fbbf24;
          color: #ffffff;
          transform: scale(1.05);
        }

        .srd-cal-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 12px;
          font-weight: 800;
          color: #cbd5e1;
          letter-spacing: 1px;
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
        }
        .srd-cal-weekdays span:first-child,
        .srd-cal-weekdays span:last-child {
          color: #fbbf24;
        }

        .srd-cal-square-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          margin-bottom: 18px;
          position: relative;
          z-index: 2;
        }

        .srd-day-square {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 900;
          font-family: 'DM Sans', sans-serif;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
          position: relative;
        }
        .srd-day-square.empty {
          opacity: 0;
          pointer-events: none;
          visibility: hidden;
        }

        /* 🟩 PRESENT: VIBRANT GREEN 🟩 */
        .srd-day-square.present {
          background: linear-gradient(135deg, #15803d 0%, #16a34a 50%, #22c55e 100%);
          color: #ffffff;
          border: 1.5px solid #4ade80;
          box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.35);
        }
        .srd-day-square.present:hover {
          transform: translateY(-4px) scale(1.08);
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%);
          border-color: #ffffff;
          box-shadow: 0 8px 22px rgba(34, 197, 94, 0.6), 0 0 14px rgba(74, 222, 128, 0.6);
          z-index: 10;
        }

        /* 🟥 LEAVE / ABSENT: VIBRANT RED 🟥 */
        .srd-day-square.leave {
          background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #dc2626 100%);
          color: #ffffff;
          border: 1.5px solid #f87171;
          box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }
        .srd-day-square.leave:hover {
          transform: translateY(-4px) scale(1.08);
          background: linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%);
          border-color: #ffffff;
          box-shadow: 0 8px 22px rgba(239, 68, 68, 0.55), 0 0 14px rgba(248, 113, 113, 0.5);
          z-index: 10;
        }

        @media (max-width: 640px) {
          .srd-cal-square-grid {
            gap: 6px;
          }
          .srd-day-square {
            height: 46px;
            font-size: 16px;
            border-radius: 9px;
          }
        }

        .srd-cal-legend {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          flex-wrap: wrap;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        /* 🗓️ 1-YEAR (12-MONTH) OVERVIEW GRID 🗓️ */
        .srd-year-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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

        /* 📈 ANALYTICS GRAPH 📈 */
        .srd-analytics-chart-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--pad-lg);
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

        /* DYNAMIC HOVER DETAILS BOX */
        .srd-hover-detail-bar {
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        /* SVG CHART CONTAINER (MOBILE & APK OPTIMIZED) */
        .srd-svg-wrap {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          position: relative;
          padding-bottom: 8px;
          border-radius: 12px;
        }
        .srd-svg-wrap::-webkit-scrollbar {
          height: 6px;
        }
        .srd-svg-wrap::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.06);
          border-radius: 4px;
        }
        .srd-svg-wrap::-webkit-scrollbar-thumb {
          background: rgba(139, 13, 13, 0.35);
          border-radius: 4px;
        }

        /* ⚠️ NOTICE BOX ⚠️ */
        .srd-notice {
          border: 1px solid var(--border);
          border-left: 5px solid #800000;
          background: var(--card);
          border-radius: 18px;
          padding: var(--pad-lg);
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

        /* ============================================================
           RESPONSIVE — tablet
           ============================================================ */
        @media (max-width: 768px) {
          .srd-cal-day-badge {
            padding: 7px 14px;
          }
          .srd-cal-day-badge strong {
            font-size: 22px;
          }
        }

        /* ============================================================
           RESPONSIVE — phones & in-app webviews (~360–480px wide)
           ============================================================ */
        @media (max-width: 480px) {
          .srd-profile-top {
            flex-direction: column;
            align-items: stretch;
          }
          .srd-print-btn {
            width: 100%;
          }
          .srd-sec-head {
            flex-direction: column;
            align-items: stretch;
          }
          .srd-view-switcher {
            width: 100%;
          }
          .srd-view-tab {
            flex: 1;
          }
          .srd-cal-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .srd-cal-day-badge {
            align-self: flex-start;
          }
          .srd-cal-cell {
            height: 36px;
            font-size: 12.5px;
          }
          .srd-cal-weekdays {
            font-size: 10px;
          }
          .srd-year-grid {
            grid-template-columns: 1fr;
          }
          .srd-metric-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* 🌟 1. UNIFIED STUDENT PROFILE & DETAILS CARD (ON-SCREEN) 🌟
          Every data point below (name, IDs, branch, hostel, room,
          contact, blood group, address …) is authored in exactly one
          place — the Personal & Academic Records grid — so there is
          no second "quick glance" strip repeating the same values. */}
      <div className="no-print srd-shell srd-unified-card">
        {/* TOP PROFILE BAR */}
        <div className="srd-profile-top">
          <div className="srd-profile-id">
            {/* AVATAR WITH BADGE */}
            <div className="srd-avatar-wrap">
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--border)', overflow: 'hidden', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ position: 'absolute', bottom: '0', right: '0', width: '20px', height: '20px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                🎓
              </div>
            </div>

            {/* NAME & ID */}
            <div className="srd-name-area">
              <h2>{fullName}</h2>
              <p className="srd-name-meta">
                <span>ID: {regNo}</span> • <span>Roll: {rollNo}</span>
              </p>
            </div>
          </div>

          {/* PRINT PDF BUTTON */}
          <button type="button" onClick={handlePrint} className="srd-print-btn">
            <span>🖨️</span>
            <span>PRINT PDF</span>
          </button>
        </div>

        {/* PERSONAL & ACADEMIC RECORDS — single source of truth for all profile fields */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <h3 className="srd-form-title" style={{ marginBottom: '18px' }}>
            Personal &amp; Academic Records
          </h3>

          <div className="srd-form-grid">
            <RecordField label="Full Name" value={fullName} />
            <RecordField label="Registration Number" value={regNo} mono />
            <RecordField label="Class Roll Number" value={rollNo} />
            <RecordField label="Branch / Department" value={branch} icon="📄" />
            <RecordField label="Academic Session" value={session} icon="📅" />
            <RecordField label="Allotted Hostel Block" value={hostelBlock} icon="🏢" tone="#166534" />
            <RecordField label="Room & Bed Number" value={roomBed} icon="🛏️" tone="#1e40af" />
            <RecordField label="Contact Number" value={contact} icon="📞" />
            <RecordField label="Email Address" value={email} icon="✉️" />
            <RecordField label="Blood Group" value={bloodGroup} icon="🩸" />
            <RecordField label="Home Area Pincode" value={pincode} />
            <RecordField label="Full Permanent Address" value={address} icon="📍" span2 multiline />
          </div>
        </div>
      </div>

      {/* 🌟 2. MESS ATTENDANCE & DIETARY ANALYTICS (ON-SCREEN) 🌟 */}
      <div className="no-print srd-shell" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* 📊 ANNUAL MESS ATTENDANCE & MEAL DIETS GRAPH (2026 - 2027 - 2028) 📊 */}
        <div className="srd-analytics-chart-card">

          {/* TOP HEADER & MULTI-YEAR SELECTOR */}
          <div className="srd-chart-top-bar">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#090d16', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.8px', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
              <span style={{ fontSize: '13px' }}>📊</span>
              <span>ANNUAL MESS ATTENDANCE &amp; DIET GRAPH</span>
            </div>

            {/* YEAR SWITCHER TABS (2026 - 2027 - 2028) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px' }}>
              {[2026, 2027, 2028].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedGraphYear(yr)}
                  style={{
                    border: 'none',
                    background: selectedGraphYear === yr ? '#8B0D0D' : 'transparent',
                    color: selectedGraphYear === yr ? '#ffffff' : 'var(--text-muted)',
                    padding: '5px 12px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedGraphYear === yr ? '0 2px 6px rgba(139, 13, 13, 0.4)' : 'none'
                  }}
                >
                  {yr} {yr === 2026 ? '(Current)' : ''}
                </button>
              ))}
            </div>

            {/* LEGEND BADGES */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700 }}>
                <span style={{ width: '12px', height: '3px', background: '#2563eb', borderRadius: '2px' }}></span>
                Days Eaten (0-31)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 700 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', border: '2px solid #2563eb' }}></span>
                Monthly Peak Point
              </span>
            </div>
          </div>

          {/* CENTER GRAPH TITLE */}
          <h3 style={{
            textAlign: 'center',
            color: '#6366f1',
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            fontWeight: 800,
            margin: '8px 0 14px',
            letterSpacing: '0.2px',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            {fullName} 's Mess Attendance &amp; Activity Graph ({selectedGraphYear})
          </h3>

          {/* DYNAMIC 12-MONTH DATASET & HOVER DETAIL */}
          {(() => {
            const yearDataset = MULTI_YEAR_MESS_DATA[selectedGraphYear] || MULTI_YEAR_MESS_DATA[2026];
            const currentIdx = hoveredMonthIdx >= 0 && hoveredMonthIdx < yearDataset.length ? hoveredMonthIdx : 5; // Default June
            const selectedMonth = yearDataset[currentIdx] || yearDataset[0];
            const totalYearMeals = yearDataset.reduce((sum, m) => sum + m.mealsCovered, 0);

            return (
              <>
                {/* DYNAMIC SELECTED MONTH DETAIL BAR */}
                <div className="srd-hover-detail-bar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>🎯</span>
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--text)' }}>
                        Month: {selectedMonth.full} {selectedGraphYear}
                      </strong>
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '11px',
                        background: '#ede9fe',
                        color: '#6366f1',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 800
                      }}>
                        {selectedMonth.tag}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', flexWrap: 'wrap' }}>
                    <span>Days Eaten: <b style={{ color: '#2563eb', fontSize: '15px' }}>{selectedMonth.present} / {selectedMonth.daysTotal} Days</b></span>
                    <span style={{ color: 'var(--border)' }}>|</span>
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>
                      🍱 {selectedMonth.mealsCovered} Meals Served ({selectedMonth.pct}%)
                    </span>
                    <span style={{ color: 'var(--border)' }}>|</span>
                    <span style={{ color: '#dc2626' }}>🏖️ {selectedMonth.leave} Leaves</span>
                  </div>
                </div>

                {/* SVG ORIGINAL BEAUTIFUL PURPLE/BLUE WAVE GRAPH */}
                <div className="srd-svg-wrap">
                  <svg
                    viewBox="0 0 920 280"
                    style={{ width: '100%', minWidth: '720px', height: 'auto', display: 'block' }}
                  >
                    <defs>
                      <linearGradient id="purpleGlowFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.45" />
                        <stop offset="50%" stopColor="#c084fc" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* Y-AXIS TITLE */}
                    <text
                      transform="rotate(-90)"
                      x="-135"
                      y="18"
                      textAnchor="middle"
                      fill="#6366f1"
                      fontSize="11.5"
                      fontWeight="700"
                      letterSpacing="0.4px"
                    >
                      Days Eaten in Month (0 - 31 Days)
                    </text>

                    {/* HORIZONTAL PURPLE DOTTED GRID LINES & Y-AXIS DAYS VALUES (0 to 31) */}
                    {[31, 25, 20, 15, 10, 5, 0].map((val) => {
                      const y = 30 + ((31 - val) / 31) * 190;
                      return (
                        <g key={val}>
                          <line
                            x1="52"
                            y1={y}
                            x2="905"
                            y2={y}
                            stroke="#c7d2fe"
                            strokeOpacity="0.75"
                            strokeDasharray="2 3"
                            strokeWidth="1.2"
                          />
                          <text
                            x="44"
                            y={y + 4}
                            textAnchor="end"
                            fontSize="11"
                            fill="#6366f1"
                            fontWeight="700"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* SMOOTH SPLINE WAVE & DATA NODES */}
                    {(() => {
                      const startX = 65;
                      const stepX = (890 - startX) / (yearDataset.length - 1);
                      const points = yearDataset.map((d, i) => {
                        const x = startX + i * stepX;
                        const y = 30 + ((31 - d.present) / 31) * 190;
                        return { x, y, d, i };
                      });

                      const linePath = points.reduce((acc, p, i, arr) => {
                        if (i === 0) return `M ${p.x} ${p.y}`;
                        const prev = arr[i - 1];
                        const cx1 = prev.x + (p.x - prev.x) / 2;
                        const cy1 = prev.y;
                        const cx2 = prev.x + (p.x - prev.x) / 2;
                        const cy2 = p.y;
                        return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
                      }, "");

                      const areaPath = `${linePath} L ${points[points.length - 1].x} 220 L ${points[0].x} 220 Z`;

                      return (
                        <g>
                          {/* GRADIENT SHADED AREA UNDER CURVE */}
                          <path d={areaPath} fill="url(#purpleGlowFill)" />

                          {/* SMOOTH BLUE WAVE LINE */}
                          <path
                            d={linePath}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* DATA POINTS & MONTH LABELS */}
                          {points.map(({ x, y, d, i }) => {
                            const isHovered = hoveredMonthIdx === i;
                            const isHighPeak = d.present >= 27;

                            return (
                              <g
                                key={`point-${i}`}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredMonthIdx(i)}
                              >
                                {/* HOVER VERTICAL GUIDELINE */}
                                {isHovered && (
                                  <line
                                    x1={x}
                                    y1="25"
                                    x2={x}
                                    y2="220"
                                    stroke="#818cf8"
                                    strokeWidth="1.5"
                                    strokeDasharray="2 2"
                                  />
                                )}

                                {/* PEAK VALUE BADGE (DAYS EATEN) */}
                                <text
                                  x={x}
                                  y={y - 10}
                                  textAnchor="middle"
                                  fontSize="11.5"
                                  fontWeight="900"
                                  fill={isHovered ? '#1e40af' : '#6366f1'}
                                >
                                  {d.present}
                                </text>

                                {/* POINT CIRCLE */}
                                <circle
                                  cx={x}
                                  cy={y}
                                  r={isHovered ? 7 : (isHighPeak ? 5.5 : 4.5)}
                                  fill="#f59e0b"
                                  stroke="#3b82f6"
                                  strokeWidth={isHovered ? 2.5 : 1.8}
                                />

                                {/* X-AXIS MONTH NAME */}
                                <text
                                  x={x}
                                  y="244"
                                  textAnchor="middle"
                                  fontSize="12"
                                  fontWeight={isHovered ? '900' : '700'}
                                  fill={isHovered ? '#1e40af' : '#6366f1'}
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

                {/* GRAPH FOOTER SUMMARY TILES */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ fontSize: '16px' }}>⚡</span>
                    <span style={{ color: 'var(--text-muted)' }}>Daily QR Scan:</span>
                    <b style={{ color: '#16a34a' }}>1 Scan = All 4 Meals Active</b>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ fontSize: '16px' }}>🍱</span>
                    <span style={{ color: 'var(--text-muted)' }}>Total Annual Diets:</span>
                    <b style={{ color: '#8B0D0D' }}>{totalYearMeals} Diets Consumed ({selectedGraphYear})</b>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ fontSize: '16px' }}>🗓️</span>
                    <span style={{ color: 'var(--text-muted)' }}>Academic Cycle:</span>
                    <b style={{ color: 'var(--text)' }}>12 Months (0 - 31 Days Range)</b>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ fontSize: '16px' }}>🏆</span>
                    <span style={{ color: 'var(--text-muted)' }}>Peak Attendance:</span>
                    <b style={{ color: '#2563eb' }}>May &amp; Aug (28 Days • 112 Meals)</b>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        <div className="srd-sec-head">
          <div className="srd-sec-title">Mess Attendance &amp; Dining Records</div>

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

        {/* 4 REAL-TIME CLEAN MODERN METRIC CARDS */}
        <div className="srd-metric-grid">
          {/* CARD 1: MONTHLY ATTENDANCE */}
          <div className="srd-metric-card" style={{ borderTop: '3px solid #16a34a' }}>
            <div className="srd-metric-card-top">
              <div className="srd-metric-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
                📅
              </div>
              <span className="srd-metric-badge-pill" style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                {MONTH_NAMES[activeMonth]} {activeYear}
              </span>
            </div>

            <div className="srd-metric-label">Monthly Attendance</div>
            <div className="srd-metric-hero-val" style={{ color: '#166534' }}>
              {monthlyPresent} <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>/ {monthlyTotal} Days</span>
            </div>

            <div className="srd-metric-progress-track">
              <div
                className="srd-metric-progress-bar"
                style={{ width: `${monthlyPct}%`, background: 'linear-gradient(90deg, #16a34a, #22c55e)' }}
              />
            </div>
            <div className="srd-metric-footer" style={{ color: '#16a34a' }}>
              <span>✅ {monthlyPct}% Present</span>
              <span style={{ color: 'var(--text-muted)' }}>1 Scan = 4 Meals</span>
            </div>
          </div>

          {/* CARD 2: MONTHLY MEALS CONSUMED */}
          <div className="srd-metric-card" style={{ borderTop: '3px solid #ea580c' }}>
            <div className="srd-metric-card-top">
              <div className="srd-metric-icon-box" style={{ background: '#fef3c7', color: '#ea580c' }}>
                🍱
              </div>
              <span className="srd-metric-badge-pill" style={{ background: '#fef3c7', color: '#c2410c', border: '1px solid #fde68a' }}>
                4 Diets / Day
              </span>
            </div>

            <div className="srd-metric-label">Monthly Meals Consumed</div>
            <div className="srd-metric-hero-val" style={{ color: '#c2410c' }}>
              {monthlyMealsCovered} <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Meals Eaten</span>
            </div>

            <div className="srd-metric-progress-track">
              <div
                className="srd-metric-progress-bar"
                style={{ width: `${monthlyPct}%`, background: 'linear-gradient(90deg, #ea580c, #f59e0b)' }}
              />
            </div>
            <div className="srd-metric-footer" style={{ color: '#ea580c' }}>
              <span>🥞 Breakfast • 🍛 Lunch</span>
              <span>☕ Snacks • 🍲 Dinner</span>
            </div>
          </div>

          {/* CARD 3: ACADEMIC SESSION CUMULATIVE */}
          <div className="srd-metric-card" style={{ borderTop: '3px solid #6366f1' }}>
            <div className="srd-metric-card-top">
              <div className="srd-metric-icon-box" style={{ background: '#ede9fe', color: '#6366f1' }}>
                📈
              </div>
              <span className="srd-metric-badge-pill" style={{ background: '#ede9fe', color: '#4f46e5', border: '1px solid #ddd6fe' }}>
                Session {activeYear}
              </span>
            </div>

            <div className="srd-metric-label">Annual Cumulative Attendance</div>
            <div className="srd-metric-hero-val" style={{ color: '#4338ca' }}>
              {annualTotalDaysPresent} <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>/ {annualTotalDaysTotal} Days</span>
            </div>

            <div className="srd-metric-progress-track">
              <div
                className="srd-metric-progress-bar"
                style={{ width: `${annualPct}%`, background: 'linear-gradient(90deg, #4f46e5, #818cf8)' }}
              />
            </div>
            <div className="srd-metric-footer" style={{ color: '#6366f1' }}>
              <span>📊 {annualPct}% Consistency</span>
              <span style={{ color: 'var(--text-muted)' }}>{annualTotalMeals} Total Diets</span>
            </div>
          </div>

          {/* CARD 4: APPROVED LEAVES & OUTPASS REBATES */}
          <div className="srd-metric-card" style={{ borderTop: '3px solid #ef4444' }}>
            <div className="srd-metric-card-top">
              <div className="srd-metric-icon-box" style={{ background: '#fee2e2', color: '#dc2626' }}>
                🏖️
              </div>
              <span className="srd-metric-badge-pill" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                Rebated
              </span>
            </div>

            <div className="srd-metric-label">Approved Leaves / Outpass</div>
            <div className="srd-metric-hero-val" style={{ color: '#b91c1c' }}>
              {leaveDays} <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Days Leave</span>
            </div>

            <div className="srd-metric-progress-track">
              <div
                className="srd-metric-progress-bar"
                style={{ width: `${Math.min(100, (leaveDays / 30) * 100)}%`, background: 'linear-gradient(90deg, #dc2626, #f87171)' }}
              />
            </div>
            <div className="srd-metric-footer" style={{ color: '#dc2626' }}>
              <span>⚡ {leaveDays * 4} Meals Rebated</span>
              <span style={{ color: 'var(--text-muted)' }}>Pre-Approved</span>
            </div>
          </div>
        </div>

        {/* 🗓️ VIEW 1: MONTHLY CALENDAR WIDGET (ENHANCED COUNT & STREAK DESIGN) 🗓️ */}
        {activeTab === 'month' && (
          <div className="srd-cal-container">
            {/* TOP HEADER & MONTH CONTROLLER */}
            <div className="srd-cal-header">
              <div>
                <div className="srd-cal-top-tag">
                  <span>✨</span>
                  <span>DAILY MESS QR CHECK-IN TRACKER</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button type="button" onClick={handlePrevMonth} className="srd-cal-nav-btn" title="Previous Month">❮</button>
                  <h4 className="srd-cal-month-title">{MONTH_NAMES[activeMonth]} {activeYear}</h4>
                  <button type="button" onClick={handleNextMonth} className="srd-cal-nav-btn" title="Next Month">❯</button>
                </div>
              </div>

              {/* PROMINENT ATTENDANCE COUNT BADGES */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div className="srd-cal-day-badge">
                  <strong>{monthlyPresent}</strong>
                  <div>
                    <span style={{ display: 'block' }}>DAYS PRESENT</span>
                    <small style={{ fontSize: '9.5px', color: '#fef08a', opacity: 0.9 }}>1 Scan = 4 Meals</small>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🍱</span>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#38bdf8', display: 'block', lineHeight: 1 }}>{monthlyPresent * 4}</strong>
                    <span style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Meals Served</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🏖️</span>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#f87171', display: 'block', lineHeight: 1 }}>{leaveDays}</strong>
                    <span style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Leaves Taken</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WEEKDAY HEADERS */}
            <div className="srd-cal-weekdays">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* SQUARE BOX ATTENDANCE CALENDAR GRID */}
            <div className="srd-cal-square-grid">
              {calendarData.rows.flat().map((cell) => {
                if (cell.empty) {
                  return <div className="srd-day-square empty" key={cell.key} />;
                }

                const isPresent = cell.status === 'present';

                return (
                  <div
                    key={cell.key}
                    className={`srd-day-square ${isPresent ? 'present' : 'leave'}`}
                    title={`Day ${cell.day} ${MONTH_SHORT[activeMonth]} ${activeYear}: ${isPresent ? '✅ QR Scanned Present — 4 Meals Eaten (Breakfast, Lunch, Snacks, Dinner)' : '❌ Not Scanned / Leave (0 Meals)'}`}
                  >
                    {cell.day}
                  </div>
                );
              })}
            </div>

            {/* LIVE MEALS CONSUMPTION COUNTER BAR */}
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '14px 18px', marginBottom: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🥞</span>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Breakfast</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#f8fafc' }}>{monthlyPresent} <span style={{ fontSize: '11px', color: '#4ade80' }}>Eaten</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🍛</span>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Lunch</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#f8fafc' }}>{monthlyPresent} <span style={{ fontSize: '11px', color: '#4ade80' }}>Eaten</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>☕</span>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Snacks</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#f8fafc' }}>{monthlyPresent} <span style={{ fontSize: '11px', color: '#4ade80' }}>Eaten</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🍲</span>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Dinner</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#f8fafc' }}>{monthlyPresent} <span style={{ fontSize: '11px', color: '#4ade80' }}>Eaten</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: '12px' }}>
                <span style={{ fontSize: '22px' }}>🍱</span>
                <div>
                  <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 900, textTransform: 'uppercase' }}>Total Meals</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#fef08a' }}>{monthlyPresent * 4} <span style={{ fontSize: '10px', color: '#ffffff' }}>Diets</span></div>
                </div>
              </div>
            </div>

            {/* LEGEND & QUICK SUMMARY BAR */}
            <div className="srd-cal-legend">
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 800 }}>
                  <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(135deg, #15803d, #22c55e)', border: '1px solid #4ade80', display: 'inline-block' }}></span>
                  Scanned Present ({monthlyPresent} Days • Green)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontWeight: 800 }}>
                  <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'linear-gradient(135deg, #7f1d1d, #dc2626)', border: '1px solid #f87171', display: 'inline-block' }}></span>
                  Not Scanned / Leave ({leaveDays} Days • Red)
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#fbbf24', fontWeight: 700, letterSpacing: '0.2px' }}>
                ⚡ 1 Daily Scan = Green (4 Meals) | Not Scanned = Red (0 Meals)
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
                      Present: <b style={{ color: 'var(--text)' }}>{mData.present} Days</b> • 4-Meal Plan: <b style={{ color: '#800000' }}>Active</b>
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

      {/* 🌟 4. OFFICIAL PRINTABLE STUDENT RECORD SHEET (PRINT-ONLY) 🌟
          Left exactly as-is: this is a distinct, self-contained
          document meant for physical/PDF paperwork, not a duplicate
          of the on-screen dossier above. */}
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
