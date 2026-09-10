// src/components/StudentRecordDossier.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assets/logo.png.png';

function StudentRecordDossier({ profileData = {}, currentUser = {}, profilePic = null, isDarkMode = false, allotmentInfo = null }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('1M'); // '1M', '6M', '1Y'
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const isFemale = String(profileData?.gender || currentUser?.gender || '').toUpperCase() === 'FEMALE';
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
  const avatarSrc = profilePic || defaultAvatar;

  const fullName = profileData?.fullName || currentUser?.full_name || (isFemale ? 'SANA SHARMA' : 'AMIT SHARMA');
  
  const getCleanRegNo = () => {
    const r1 = String(profileData?.regNo || '');
    if (r1 && !r1.includes('@')) return r1;
    const r2 = String(currentUser?.reg_no || '');
    if (r2 && !r2.includes('@')) return r2;
    return isFemale ? '1554424000' : '1554424049';
  };
  const regNo = getCleanRegNo();
  const rawRoll = profileData?.rollNo || currentUser?.roll_no || (isFemale ? '00' : '49');
  const rollNo = String(rawRoll || '').replace('#', '').trim() || (isFemale ? '00' : '49');
  const branch = profileData?.branch || currentUser?.branch || 'Artificial Intelligence & Machine Learning';
  const session = profileData?.session || profileData?.semester || currentUser?.semester || '2024-27';

  const getMaskedContact = () => {
    const c1 = String(profileData?.contact || '').trim();
    if (c1 && !c1.includes('42022') && !c1.includes('56789') && !c1.includes('-----')) {
      return c1;
    }
    const c2 = String(currentUser?.mobile || '').trim();
    if (c2 && !c2.includes('42022') && !c2.includes('56789') && !c2.includes('-----')) {
      return c2;
    }
    return isFemale ? '+91 91234 -----' : '+91 88731 -----';
  };
  const contact = getMaskedContact();
  
  const getCleanEmail = () => {
    const e1 = String(profileData?.email || '').trim();
    if (e1 && !e1.includes('arwal28') && !e1.includes('sanasharma31') && !e1.includes('student.female@') && !e1.includes('student@')) {
      return e1;
    }
    return isFemale ? 'sanasharma.gpb.ai@gmail.com' : 'amitkumar.gpb.ai@gmail.com';
  };
  const email = getCleanEmail();

  const getCleanAddress = () => {
    const a1 = String(profileData?.address || '').trim();
    if (a1 && !a1.includes('Saksohara') && !a1.includes('Agwanpur')) return a1;
    const a2 = String(currentUser?.address || '').trim();
    if (a2 && !a2.includes('Saksohara') && !a2.includes('Agwanpur')) return a2;
    return 'Vill - Agwanpur, P.O - Agwanpur, Dist - Patna, Bihar - 803213';
  };
  const address = getCleanAddress();

  const bloodGroup = profileData?.bloodGroup || currentUser?.blood_group || 'O+';
  const hostelBlock = allotmentInfo?.hostel_name || profileData?.hostelBlock || currentUser?.hostel_block || (isFemale ? 'Savitribai Phule Girls Hostel' : 'Birsa Munda Boys Hostel');
  const roomBed = (allotmentInfo?.room_number && allotmentInfo?.bed_code)
    ? `Room ${allotmentInfo.room_number} • Bed ${allotmentInfo.bed_code}`
    : (profileData?.roomNumber ? `Room ${profileData.roomNumber} • Bed ${profileData.bedNumber || 'A'}` : (isFemale ? 'Room 101 • Bed A' : 'Room 101 • Bed 1 (Bed A)'));

  // Fetch Student Analytics Data
  useEffect(() => {
    const studentId = currentUser?.id || 1;
    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/student/records/analytics/${studentId}?timeframe=${analyticsTimeframe}`);
        if (res.data) setAnalyticsData(res.data);
      } catch (err) {
        console.log('Analytics load error (using fallback defaults):', err);
        
        // Read scanned attendance from localStorage (saved from MessScanner)
        let scannedMap = {};
        try {
          const rawScanned = localStorage.getItem('gpbarh_daily_meal_attendance_records');
          if (rawScanned) scannedMap = JSON.parse(rawScanned);
        } catch {
          // ignore
        }

        // Generate calendar dataset incorporating scanned days
        const dummyCalendar = Array.from({ length: 31 }, (_, idx) => {
          const dayNum = idx + 1;
          const dateStr = `2026-08-${String(dayNum).padStart(2, '0')}`;
          const isPast = dayNum <= 24;
          const isLeave = [7, 8, 21].includes(dayNum);
          const hasScanned = Boolean(scannedMap[dateStr]);
          const isPresent = hasScanned || (isPast && !isLeave && dayNum % 5 !== 0);

          return {
            day: dayNum,
            date: dateStr,
            day_name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx % 7],
            is_today: dayNum === 24,
            is_past: isPast,
            status: hasScanned ? 'PRESENT' : (!isPast ? 'FUTURE' : (isPresent ? 'PRESENT' : (isLeave ? 'LEAVE' : 'ABSENT'))),
            meals: hasScanned ? { breakfast: true, lunch: true, snacks: true, dinner: true } : {
              breakfast: isPresent,
              lunch: isPresent,
              snacks: isPresent && dayNum % 2 === 0,
              dinner: isPresent
            },
            meals_count: hasScanned ? 4 : (isPresent ? (dayNum % 2 === 0 ? 4 : 3) : 0),
            scanned_record: scannedMap[dateStr] || null
          };
        });

        const presentCount = dummyCalendar.filter(d => d.status === 'PRESENT').length;
        const totalPast = dummyCalendar.filter(d => d.is_past).length || 24;
        const calcPct = Math.round((presentCount / totalPast) * 100 * 10) / 10;

        setAnalyticsData({
          student_id: studentId,
          student_name: fullName,
          reg_no: regNo,
          monthly_attendance: dummyCalendar,
          calendar_days: dummyCalendar,
          timeframe_trends: {
            "1M": [
              { label: "Week 1", present: 6, meals: 22, pct: 85.7 },
              { label: "Week 2", present: 7, meals: 26, pct: 100.0 },
              { label: "Week 3", present: 5, meals: 19, pct: 71.4 },
              { label: "Week 4", present: 6, meals: 24, pct: 92.0 }
            ],
            "6M": [
              { label: "Mar", present: 26, meals: 98, pct: 86.6 },
              { label: "Apr", present: 28, meals: 106, pct: 93.3 },
              { label: "May", present: 25, meals: 92, pct: 80.6 },
              { label: "Jun", present: 27, meals: 101, pct: 90.0 },
              { label: "Jul", present: 29, meals: 110, pct: 93.5 },
              { label: "Aug", present: presentCount, meals: presentCount * 4, pct: calcPct }
            ],
            "1Y": [
              { label: "Sep", pct: 84 }, { label: "Oct", pct: 89 }, { label: "Nov", pct: 92 },
              { label: "Dec", pct: 81 }, { label: "Jan", pct: 88 }, { label: "Feb", pct: 91 },
              { label: "Mar", pct: 87 }, { label: "Apr", pct: 93 }, { label: "May", pct: 81 },
              { label: "Jun", pct: 90 }, { label: "Jul", pct: 94 }, { label: "Aug", pct: calcPct }
            ]
          },
          attendance_summary: {
            present_days: presentCount,
            leave_days: 3,
            absent_days: Math.max(0, totalPast - presentCount - 3),
            attendance_pct: calcPct,
            total_meals_consumed: presentCount * 4
          },
          financial_progress: {
            total_semester_dues: 23750,
            total_paid: 23750,
            pending_dues: 0,
            hostel_paid: 4250,
            mess_paid: 18000,
            clearance_status: 'CLEARED',
            paid_pct: 100
          },
          activity_timeline: [
            { id: 1, type: 'ALLOTMENT', title: 'Room Allotment Confirmed', description: `Allocated bed in ${hostelBlock}.`, timestamp: '01 Aug 2026, 10:30 AM', status: 'APPROVED', icon: '🛏️' },
            { id: 2, type: 'PAYMENT', title: 'Semester Mess & Maintenance Advance', description: 'Verified online payment ref GPB/2026/HST-00102.', timestamp: '05 Aug 2026, 02:15 PM', status: 'VERIFIED', icon: '💳' },
            { id: 3, type: 'OUTPASS', title: 'Weekend Home Visit Outpass', description: 'Approved destination: Patna / Home District.', timestamp: '15 Aug 2026, 04:00 PM', status: 'COMPLETED', icon: '✈️' },
            { id: 4, type: 'MESS_SCAN', title: 'QR Counter Attendance Verified', description: `Daily 4-Meal Pass (Breakfast, Lunch, Snacks, Dinner) verified at ${hostelBlock} Dining Counter.`, timestamp: `${today}, 08:15 PM`, status: 'ACTIVE', icon: '🍽️' }
          ]
        });
      } finally {
        setLoadingAnalytics(false);
      }
    };
    fetchAnalytics();
  }, [currentUser?.id, fullName, regNo, hostelBlock, today, analyticsTimeframe]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🌟 1. TOP HEADER ACTION CARD & VIEW SWITCHER (HIDDEN ON PRINT) 🌟 */}
      <div
        className="no-print custom-card prof-header-simple"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          padding: '20px 24px',
          borderRadius: '20px',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap'
        }}
      >
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

          {/* NAME & BRANCH */}
          <div className="prof-name-area">
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text)', margin: '0 0 2px', letterSpacing: '0.3px', fontFamily: "'Fraunces', serif" }}>
              {fullName}
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <span>ID: {regNo}</span> • <span>Roll: {rollNo}</span>
            </p>
          </div>
        </div>

        {/* ACTION BUTTON: PRINT PDF */}
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

      {/* 🌟 2. VISUAL ANALYTICS & CHARTS VIEW (PERMANENT SCREEN VIEW) 🌟 */}
      <div className="no-print space-y-6 animate-in fade-in duration-300">
          
          {/* TOP SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* CARD 1: MESS ATTENDANCE RATE */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mess Attendance Rate</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {analyticsData?.attendance_summary?.attendance_pct || 88.5}%
                </span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Eligible
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {analyticsData?.attendance_summary?.present_days || 24} Active Days / 30 Days
              </p>
            </div>

            {/* CARD 2: TOTAL MEALS CONSUMED */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Meals Consumed (30D)</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-500 font-mono">
                  {analyticsData?.attendance_summary?.total_meals_consumed || 68}
                </span>
                <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                  Tokens
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Avg. ~2.3 Verified Meals / Day
              </p>
            </div>

            {/* CARD 3: SEMESTER FEE STATUS */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Institutional Dues</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  ₹{Number(analyticsData?.financial_progress?.total_paid || 23750).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                  {analyticsData?.financial_progress?.clearance_status || 'CLEARED'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pending Balance: ₹{Number(analyticsData?.financial_progress?.pending_dues || 0).toLocaleString('en-IN')}
              </p>
            </div>

            {/* CARD 4: OUTPASS & LEAVES */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sanctioned Outpass</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  {analyticsData?.attendance_summary?.leave_days || 3} Days
                </span>
                <span className="text-xs font-bold text-purple-500 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                  Approved
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                All clearances logged digitally
              </p>
            </div>

          </div>

          {/* 🌟 1. MONTHLY MESS ATTENDANCE CALENDAR (GREEN = PRESENT, RED = ABSENT, PURPLE = LEAVE) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📅</span> Monthly Mess Attendance Calendar ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
                </h3>
                <p className="text-xs text-slate-500">
                  Daily visual attendance tracker • Green: Scanned/Fed • Red: Missed/Absent • Purple: Approved Outpass
                </p>
              </div>

              {/* CALENDAR LEGEND */}
              <div className="flex items-center gap-3 text-[11px] font-bold flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></span> Scanned (Green)
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></span> Missed (Red)
                </span>
                <span className="flex items-center gap-1.5 text-purple-500">
                  <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></span> Outpass (Leave)
                </span>
              </div>
            </div>

            {/* CALENDAR MATRIX (DAYS 1 TO 31) */}
            <div className="space-y-2">
              {/* WEEKDAY HEADERS */}
              <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-black uppercase text-slate-400">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* CALENDAR DAYS TILES */}
              <div className="grid grid-cols-7 gap-2">
                {(analyticsData?.calendar_days || []).map((calDay) => {
                  let tileStyle = 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800';
                  let iconBadge = '';
                  let statusLabel = 'Future Date';

                  if (calDay.status === 'PRESENT') {
                    tileStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20 hover:bg-emerald-600';
                    iconBadge = '✓';
                    statusLabel = `Scanned (${calDay.meals_count} Meals)`;
                  } else if (calDay.status === 'ABSENT') {
                    tileStyle = 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-900/60 hover:bg-rose-100';
                    iconBadge = '✕';
                    statusLabel = 'Missed / Absent';
                  } else if (calDay.status === 'LEAVE') {
                    tileStyle = 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-900/60 hover:bg-purple-100';
                    iconBadge = '✈️';
                    statusLabel = 'Approved Outpass';
                  }

                  return (
                    <button
                      key={calDay.day}
                      type="button"
                      onClick={() => calDay.is_past && setSelectedCalendarDay(calDay)}
                      className={`relative min-h-[58px] sm:min-h-[68px] p-2 rounded-2xl border flex flex-col justify-between items-center transition-all cursor-pointer ${tileStyle} ${
                        calDay.is_today ? 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-900' : ''
                      } hover:scale-105 active:scale-95`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs font-black font-mono">{calDay.day}</span>
                        {calDay.is_today && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[8px] font-black uppercase">
                            Today
                          </span>
                        )}
                      </div>

                      {/* ICON / STATUS MARK */}
                      <span className="text-sm font-black">{iconBadge}</span>

                      {/* MEAL DOTS */}
                      <div className="flex gap-0.5 mt-0.5">
                        {calDay.meals?.breakfast && <span className="w-1 h-1 rounded-full bg-amber-300"></span>}
                        {calDay.meals?.lunch && <span className="w-1 h-1 rounded-full bg-orange-300"></span>}
                        {calDay.meals?.snacks && <span className="w-1 h-1 rounded-full bg-yellow-300"></span>}
                        {calDay.meals?.dinner && <span className="w-1 h-1 rounded-full bg-indigo-300"></span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 🌟 2. MULTI-PERIOD OVERVIEW ANALYTICS & VISUALIZATION GRAPHS (1 MONTH, 6 MONTHS, 1 YEAR) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📊</span> Mess Attendance Analytics &amp; Volume Trends
                </h3>
                <p className="text-xs text-slate-500">
                  Long-term dining consistency and meal frequency visualization.
                </p>
              </div>

              {/* TIMEFRAME SELECTOR (1M, 6M, 1Y) */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
                {[
                  { id: '1M', label: '1 Month' },
                  { id: '6M', label: '6 Months' },
                  { id: '1Y', label: '1 Year' }
                ].map(tf => (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => setAnalyticsTimeframe(tf.id)}
                    className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                      analyticsTimeframe === tf.id
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* VISUAL SVG GRAPH RENDERING FOR SELECTED TIMEFRAME */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Attendance &amp; Consumption Velocity ({analyticsTimeframe === '1M' ? 'Last 4 Weeks' : analyticsTimeframe === '6M' ? 'Last 6 Months' : 'Academic Year'})
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Avg Attendance: {analyticsData?.attendance_summary?.attendance_pct || 88.5}%
                </span>
              </div>

              {/* DYNAMIC SVG CHART BARS */}
              <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
                {(analyticsData?.timeframe_trends?.[analyticsTimeframe] || []).map((point, idx) => {
                  const pct = point.pct || 80;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div className="w-full max-w-[42px] bg-slate-200 dark:bg-slate-700 rounded-xl h-32 flex items-end p-1 overflow-hidden">
                        <div
                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-lg transition-all group-hover:from-amber-500 group-hover:to-amber-300 shadow-sm"
                          style={{ height: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {point.label}
                      </span>

                      {/* TOOLTIP */}
                      <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                        <div className="bg-slate-900 text-white text-[10px] rounded-lg py-1 px-2.5 font-bold shadow-xl border border-slate-700 whitespace-nowrap">
                          <div>{point.label}: {pct}% Attendance</div>
                          {point.meals && <div className="text-amber-400">{point.meals} Meals Served</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SUMMARY DONUT & FINANCIAL PROGRESS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              
              {/* DONUT SUMMARY PROGRESS */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
                  <span>🍩</span> Attendance Breakdown (This Month)
                </h4>
                <div className="flex items-center gap-6">
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 dark:text-slate-700"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500"
                        strokeDasharray={`${analyticsData?.attendance_summary?.attendance_pct || 88.5}, 100`}
                        strokeWidth="4"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                        {analyticsData?.attendance_summary?.attendance_pct || 88.5}%
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Present</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs flex-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Dining Present:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{analyticsData?.attendance_summary?.present_days || 24} Days</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Outpass Leaves:</span>
                      <strong className="text-purple-600 dark:text-purple-400 font-mono">{analyticsData?.attendance_summary?.leave_days || 3} Days</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Absent / Skipped:</span>
                      <strong className="text-rose-500 font-mono">{analyticsData?.attendance_summary?.absent_days || 4} Days</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* FINANCIAL PROGRESS & DUES TRACKER */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-2">
                    <span>💳</span> Semester Fee &amp; Clearance Tracker
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    100% Cleared
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden flex">
                    <div className="bg-blue-600 h-full w-[25%]" title="Hostel Maintenance (25%)"></div>
                    <div className="bg-emerald-500 h-full w-[65%]" title="Mess Advance (65%)"></div>
                    <div className="bg-purple-500 h-full w-[10%]" title="Caution & Reg (10%)"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>Paid: ₹{Number(analyticsData?.financial_progress?.total_paid || 23750).toLocaleString('en-IN')}</span>
                    <span>Total Dues: ₹{Number(analyticsData?.financial_progress?.total_semester_dues || 23750).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Hostel Maintenance</span>
                    <strong className="text-blue-600 font-mono">₹4,250 (5 Mo)</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Mess Dining Advance</span>
                    <strong className="text-emerald-600 font-mono">₹18,000 (5 Mo)</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 🌟 3. OUTPASS & CLEARANCE ACTIVITY TIMELINE */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🕒</span> Institutional Activity &amp; Clearance Timeline
            </h3>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
              {(analyticsData?.activity_timeline || []).map((item) => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-xs shadow-sm">
                    {item.icon}
                  </div>
                  
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">{item.title}</h5>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🌟 4. SELECTED CALENDAR DAY DETAIL MODAL */}
          {selectedCalendarDay && (
            <div
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSelectedCalendarDay(null)}
            >
              <div
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-slate-900 dark:text-white animate-in fade-in duration-150"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="text-base font-black">
                      Day Record: {selectedCalendarDay.date} ({selectedCalendarDay.day_name})
                    </h4>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      selectedCalendarDay.status === 'PRESENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedCalendarDay.status === 'LEAVE'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedCalendarDay.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCalendarDay(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">4-Meal Daily Breakdown:</span>
                  
                  {[
                    { slot: '🥞 Morning Breakfast', verified: selectedCalendarDay.meals?.breakfast, time: '08:15 AM' },
                    { slot: '🍛 Afternoon Lunch', verified: selectedCalendarDay.meals?.lunch, time: '01:10 PM' },
                    { slot: '🫖 Evening High Tea & Snacks', verified: selectedCalendarDay.meals?.snacks, time: '05:25 PM' },
                    { slot: '🍲 Grand Night Dinner', verified: selectedCalendarDay.meals?.dinner, time: '08:45 PM' }
                  ].map((m, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
                      <span className="font-bold">{m.slot}</span>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                        m.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {m.verified ? `✓ Verified (${m.time})` : 'Missed / Absent'}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCalendarDay(null)}
                  className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl"
                >
                  Close Day Details
                </button>
              </div>
            </div>
          )}

      </div>

      {/* 🌟 3. OFFICIAL PRINTABLE STUDENT RECORD SHEET (PRINT-ONLY) 🌟 */}
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
