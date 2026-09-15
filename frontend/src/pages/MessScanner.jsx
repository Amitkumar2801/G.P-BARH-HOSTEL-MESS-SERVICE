// src/pages/MessScanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import toast, { Toaster } from 'react-hot-toast';
import logo from '../assets/logo.png.png';

const cleanScannerStyles = `
  @keyframes scanLaserGlow {
    0% {
      top: 4%;
      opacity: 0.8;
      filter: drop-shadow(0 0 10px #10b981) drop-shadow(0 0 20px #059669);
    }
    50% {
      top: 94%;
      opacity: 1;
      filter: drop-shadow(0 0 18px #34d399) drop-shadow(0 0 30px #10b981);
    }
    100% {
      top: 4%;
      opacity: 0.8;
      filter: drop-shadow(0 0 10px #10b981) drop-shadow(0 0 20px #059669);
    }
  }

  @keyframes cyberLaserSweep {
    0% {
      top: 2%;
      opacity: 0.9;
    }
    50% {
      top: 96%;
      opacity: 1;
    }
    100% {
      top: 2%;
      opacity: 0.9;
    }
  }

  @keyframes cyberRotateCW {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes cyberRotateCCW {
    0% { transform: rotate(360deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes pulseRadar {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.8; }
  }

  @keyframes radarWave {
    0% {
      transform: scale(0.6);
      opacity: 0.9;
    }
    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }

  @keyframes floatBadge {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }

  @keyframes cornerBlink {
    0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px #10b981); }
    50% { opacity: 0.4; filter: drop-shadow(0 0 1px #059669); }
  }

  @keyframes hologramGrid {
    0% { background-position: 0 0; }
    100% { background-position: 30px 30px; }
  }

  .scanner-laser-beam {
    animation: scanLaserGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .cyber-laser-beam {
    animation: cyberLaserSweep 2.2s ease-in-out infinite;
  }

  .cyber-rotate-cw {
    animation: cyberRotateCW 12s linear infinite;
  }

  .cyber-rotate-ccw {
    animation: cyberRotateCCW 16s linear infinite;
  }

  .pulse-radar-dot {
    animation: pulseRadar 2s ease-in-out infinite;
  }

  .radar-ring-wave {
    animation: radarWave 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
  }

  .floating-badge {
    animation: floatBadge 3s ease-in-out infinite;
  }

  .corner-blinking {
    animation: cornerBlink 1.8s ease-in-out infinite;
  }

  .hologram-grid-bg {
    background-size: 20px 20px;
    background-image: 
      linear-gradient(to right, rgba(16, 185, 129, 0.07) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(16, 185, 129, 0.07) 1px, transparent 1px);
    animation: hologramGrid 20s linear infinite;
  }

  #gpbarh-camera-target video {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    border-radius: 1.25rem !important;
  }

  /* Custom scrollbar for mobile APK */
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

function MessScanner() {
  const navigate = useNavigate();

  // Live real-time institutional clock
  const [liveClock, setLiveClock] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Formatted date values
  const liveDateKey = liveClock.toISOString().slice(0, 10);
  const liveDateFormatted = liveClock.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const liveTimeFormatted = liveClock.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Load student profile directly from LocalStorage
  const [currentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('Could not parse user profile from localStorage', e);
    }
    return {
      id: 1,
      full_name: 'Amit Kumar Sharma',
      reg_no: '1554424049',
      branch: 'Artificial Intelligence & Machine Learning',
      gender: 'MALE',
      hostel_block: 'Dr. Rajendra Prasad Block',
      room_number: '102',
      bed_code: 'Bed B'
    };
  });

  // Extract dynamic attributes for Boys / Girls Hostel
  const isFemale = String(currentUser?.gender || '').toUpperCase() === 'FEMALE';
  const studentName = String(
    currentUser?.full_name || currentUser?.fullName || (isFemale ? 'Sana Sharma' : 'Amit Kumar Sharma')
  ).trim();
  const studentRegNo = String(currentUser?.reg_no || currentUser?.regNo || (isFemale ? '1554424000' : '1554424049'));
  const studentBranch = currentUser?.branch || 'Artificial Intelligence & Machine Learning';
  const studentHostelBlock =
    currentUser?.hostel_block ||
    currentUser?.hostelBlock ||
    (isFemale ? 'Savitribai Phule Girls Hostel' : 'Dr. Rajendra Prasad Block');
  const studentRoom = currentUser?.room_number || currentUser?.roomNumber || '102';
  const studentBed = currentUser?.bed_code || currentUser?.bedCode || currentUser?.bed || 'Bed B';
  const roomBedDisplay = `Room ${studentRoom} • ${studentBed.startsWith('Bed') ? studentBed : 'Bed ' + studentBed}`;

  // Active View Mode: 'SCANNER' or 'COUNTER_QR'
  const [activeViewMode, setActiveViewMode] = useState('SCANNER');

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifiedModal, setVerifiedModal] = useState(null);
  const [torchOn, setTorchOn] = useState(false);

  // Daily attendance state mapping
  const [dailyAttendanceRecords, setDailyAttendanceRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('gpbarh_daily_meal_attendance_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      // ignore
    }
    return {};
  });

  const todayRecord = dailyAttendanceRecords[liveDateKey] || null;
  const isTodayDone = Boolean(todayRecord);

  const html5QrCodeRef = useRef(null);
  const scannerElementId = 'gpbarh-camera-target';

  // Sync state to localStorage for StudentRecordDossier and Graph
  useEffect(() => {
    localStorage.setItem('gpbarh_daily_meal_attendance_records', JSON.stringify(dailyAttendanceRecords));
  }, [dailyAttendanceRecords]);

  // Redirection handler: Directs to Student Dashboard and automatically opens/scrolls to Annual Mess Graph
  const redirectToStudentRecordGraph = () => {
    navigate('/student-dashboard?tab=student-record&scroll=annual-mess-graph', {
      state: {
        activeTab: 'student-record',
        scrollTo: 'annual-mess-graph'
      }
    });
  };

  // Audio & Haptic Feedback on scan success
  const triggerSuccessAlert = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.25); // C6
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // ignore
    }
    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 140]);
    }
  };

  // Start Rear Camera
  const startRearCamera = async () => {
    setCameraError(null);
    setIsScanning(true);
    setActiveViewMode('SCANNER');

    try {
      await new Promise(r => setTimeout(r, 200));
      const html5QrCode = new Html5Qrcode(scannerElementId);
      html5QrCodeRef.current = html5QrCode;

      const config = { fps: 24, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 };

      try {
        await html5QrCode.start(
          { facingMode: { exact: 'environment' } },
          config,
          () => processAttendanceSubmission(),
          () => {}
        );
      } catch {
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          () => processAttendanceSubmission(),
          () => {}
        );
      }
    } catch {
      setCameraError('Camera access unavailable. You can still tap "Submit Today Attendance Now" below.');
      setIsScanning(false);
    }
  };

  const stopRearCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {
        // ignore
      }
    }
    setIsScanning(false);
    setTorchOn(false);
  };

  // Toggle Torch if supported
  const toggleTorch = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        const track = html5QrCodeRef.current.getRunningTrackCapabilities();
        if (track && 'torch' in track) {
          const newTorchState = !torchOn;
          await html5QrCodeRef.current.applyVideoConstraints({
            advanced: [{ torch: newTorchState }]
          });
          setTorchOn(newTorchState);
        } else {
          toast('Flashlight not supported on this camera', { icon: '🔦' });
        }
      }
    } catch {
      toast('Torch control unavailable', { icon: '🔦' });
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Process Attendance Submission for Today's Date with Daily Resetting Sequential Token
  const processAttendanceSubmission = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await stopRearCamera();

    const timestampNow = new Date();
    const nowTimeStr = timestampNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 🌟 1. Calculate Daily Sequential Token Resetting Daily from 1 (001, 002...)
    let existingHist = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('gpbarh_mess_attendance_history') || '[]');
      if (Array.isArray(parsed)) existingHist = parsed;
    } catch {
      existingHist = [];
    }

    // Check if current student already has an assigned token for today
    const existingStudentScanToday = existingHist.find(
      h => h.date === liveDateKey && String(h.reg_no) === String(studentRegNo)
    );

    let seqNum = 1;
    if (existingStudentScanToday && existingStudentScanToday.seq_num) {
      seqNum = existingStudentScanToday.seq_num;
    } else {
      // Count other students who have scanned today
      const otherScansToday = existingHist.filter(
        h => h.date === liveDateKey && String(h.reg_no) !== String(studentRegNo)
      );
      seqNum = otherScansToday.length + 1;
    }

    const formattedSeq = String(seqNum).padStart(3, '0'); // e.g. "001", "002"
    const wingCode = isFemale ? 'G' : 'B';
    const displayTokenNumber = `TOKEN #${formattedSeq}`;
    const tokenCode = `GPB-TOKEN-${liveDateKey.replace(/-/g, '')}-${wingCode}${formattedSeq}`;

    // Backend sync
    try {
      await axios.post('http://127.0.0.1:8000/api/mess/mark-attendance', {
        student_id: currentUser?.id || 1,
        student_name: studentName,
        reg_no: studentRegNo,
        gender: isFemale ? 'FEMALE' : 'MALE',
        branch: studentBranch,
        hostel_name: studentHostelBlock,
        room_number: studentRoom,
        meal_type: 'ALL_MEALS',
        qr_payload: `GPB-OFFICIAL-CENTRAL-MESS-COUNTER-${liveDateKey}`,
        token_code: tokenCode,
        seq_num: seqNum
      });
    } catch {
      // Offline fallback
    }

    const newDayRecord = {
      date: liveDateKey,
      formatted_date: liveDateFormatted,
      status: 'PRESENT',
      student_name: studentName,
      reg_no: studentRegNo,
      gender: isFemale ? 'FEMALE' : 'MALE',
      hostel_block: studentHostelBlock,
      room_info: roomBedDisplay,
      scanned_at: nowTimeStr,
      token_code: tokenCode,
      short_token: formattedSeq,
      display_token: displayTokenNumber,
      seq_num: seqNum,
      meals_count: 4,
      meals: {
        breakfast: true,
        lunch: true,
        snacks: true,
        dinner: true
      }
    };

    // Update Daily Attendance Map for Dossier Graph
    setDailyAttendanceRecords(prev => ({
      ...prev,
      [liveDateKey]: newDayRecord
    }));

    // Update Audit History for Warden Dashboard
    const historyItem = {
      id: tokenCode,
      student_name: studentName,
      reg_no: studentRegNo,
      gender: isFemale ? 'FEMALE' : 'MALE',
      branch: studentBranch,
      hostel_name: studentHostelBlock,
      room_number: studentRoom,
      meal_type: 'ALL_MEALS',
      meal_label: 'Full Day 4-Meal Pass (BF, LU, SN, DN)',
      date: liveDateKey,
      time: nowTimeStr,
      scanned_at: new Date().toISOString(),
      token_code: tokenCode,
      display_token: displayTokenNumber,
      short_token: formattedSeq,
      seq_num: seqNum,
      status: 'VERIFIED',
      venue: studentHostelBlock
    };

    try {
      const updatedHist = [
        historyItem,
        ...existingHist.filter(h => !(h.date === liveDateKey && String(h.reg_no) === String(studentRegNo)))
      ];
      localStorage.setItem('gpbarh_mess_attendance_history', JSON.stringify(updatedHist));
    } catch {
      // ignore
    }

    triggerSuccessAlert();
    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#800000', '#ec4899']
    });

    setVerifiedModal(newDayRecord);
    toast.success(`Attendance Recorded! 4 Meals Activated for Today ✅`, {
      style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '14px', fontWeight: 700 }
    });

    setIsProcessing(false);
  };

  const officialQrPayload = `GPB-MESS-COUNTER-CENTRAL-HALL-DATE-${liveDateKey}-GPBARH-OFFICIAL-AUTH`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <Toaster position="top-center" />
      <style dangerouslySetInnerHTML={{ __html: cleanScannerStyles }} />

      {/* 🌟 1. INSTITUTIONAL APP HEADER */}
      <header className="bg-gradient-to-r from-[#700000] via-[#8B0000] to-[#5a0000] text-white px-3.5 sm:px-6 py-3 shadow-xl sticky top-0 z-30 border-b border-red-900/60 backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
          {/* BACK BUTTON & INSTITUTIONAL TITLE */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => navigate('/student-dashboard')}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 border border-white/20 flex items-center justify-center text-white font-bold text-base cursor-pointer transition-all shrink-0 shadow-sm"
              title="Return to Dashboard"
            >
              ←
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0 border border-white/40">
                <img src={logo} alt="GP Barh Logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white truncate leading-tight">
                  Govt. Polytechnic, Barh
                </h1>
                <p className="text-[10px] text-red-200 font-semibold tracking-wider uppercase truncate">
                  Smart Mess QR Counter
                </p>
              </div>
            </div>
          </div>

          {/* LIVE SYSTEM CLOCK BADGE */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="bg-black/40 border border-white/15 px-2.5 py-1 rounded-xl text-right shadow-inner">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-radar-dot"></span>
                <span className="text-[10px] sm:text-[11px] font-black font-mono text-emerald-300 leading-none">
                  {liveClock.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-300 block text-right mt-0.5">
                {liveTimeFormatted}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 🌟 2. MAIN APPLICATION CONTENT (MOBILE APK CONTAINER) */}
      <main className="flex-1 max-w-md w-full mx-auto p-3 sm:p-4 space-y-3.5">
        {/* 🎓 STUDENT PROFILE IDENTITY CARD */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl font-black text-base flex items-center justify-center shadow-md border shrink-0 text-white ${
                  isFemale
                    ? 'bg-gradient-to-br from-pink-600 to-rose-700 shadow-pink-600/30 border-pink-400'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-600/30 border-blue-400'
                }`}
              >
                {studentName[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
                    {studentName}
                  </h2>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[8.5px] font-black uppercase border border-emerald-400/40">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                  Reg: <span className="text-slate-100 font-bold">{studentRegNo}</span>
                </p>
                <p className={`text-[10.5px] font-bold truncate mt-0.5 ${isFemale ? 'text-pink-300' : 'text-blue-300'}`}>
                  {studentHostelBlock} • {roomBedDisplay}
                </p>
              </div>
            </div>

            {/* STATUS PILL */}
            <div className="text-right shrink-0">
              <span
                className={`px-2.5 py-1 rounded-xl text-[9.5px] font-black uppercase border inline-flex items-center gap-1 shadow-sm ${
                  isTodayDone
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-emerald-500/10'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-amber-500/10'
                }`}
              >
                {isTodayDone ? '✅ 4 Meals Active' : '⏳ Today Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* 🌟 2.5. FUTURISTIC MODE SELECTOR TABS 🌟 */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveViewMode('SCANNER');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeViewMode === 'SCANNER'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>📷</span>
            <span>Camera Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopRearCamera();
              setActiveViewMode('COUNTER_QR');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeViewMode === 'COUNTER_QR'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>✨</span>
            <span>Animated Counter QR</span>
          </button>
        </div>

        {/* 📷 HIGH-TECH SCANNER & ANIMATED QR CONTAINER */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-[#070b14] rounded-3xl p-3.5 border border-slate-700/80 shadow-2xl space-y-3 relative overflow-hidden">
          
          {/* TOP CONTROLS & CAMERA STATUS */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-emerald-400 pulse-radar-dot' : 'bg-cyan-400'}`}></span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                {activeViewMode === 'SCANNER'
                  ? isScanning ? 'Live Cyber Viewfinder' : 'Ready to Scan'
                  : 'Holographic Central QR Counter'}
              </span>
            </div>

            {/* FLASH / CLOSE TOGGLES */}
            {isScanning && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    torchOn
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="Toggle Flashlight"
                >
                  🔦 {torchOn ? 'Flash ON' : 'Flash'}
                </button>
                <button
                  type="button"
                  onClick={stopRearCamera}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-[10px] font-bold border border-rose-800/80 cursor-pointer transition-all"
                >
                  ✕ Close
                </button>
              </div>
            )}
          </div>

          {/* VIEWFINDER SCREEN (PERFECT 1:1 SQUARE) */}
          <div className="relative w-full aspect-square max-h-[300px] sm:max-h-[320px] bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-800 mx-auto shadow-inner">
            
            {/* 1. CAMERA MODE (LIVE SCANNER) */}
            {activeViewMode === 'SCANNER' && (
              <>
                {/* HTML5-QRCODE TARGET */}
                <div id={scannerElementId} className="absolute inset-0 w-full h-full flex items-center justify-center"></div>

                {/* ACTIVE SCANNING HUD & HIGH-TECH LASER */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-3 z-10">
                    {/* HUD ROTATING CYBER RETICLE */}
                    <div className="absolute w-44 h-44 rounded-full border border-dashed border-emerald-400/30 cyber-rotate-cw pointer-events-none"></div>
                    <div className="absolute w-36 h-36 rounded-full border border-dotted border-teal-400/25 cyber-rotate-ccw pointer-events-none"></div>
                    <div className="absolute w-48 h-48 rounded-full border border-emerald-500/20 radar-ring-wave pointer-events-none"></div>

                    {/* HUD TARGET BRACKETS */}
                    <div className="w-48 h-48 sm:w-52 sm:h-52 border border-emerald-500/40 rounded-2xl relative shadow-[0_0_30px_rgba(16,185,129,0.25)] bg-emerald-950/10 backdrop-blur-[1px]">
                      {/* Glowing Corners */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-emerald-400 rounded-tl-xl corner-blinking"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-emerald-400 rounded-tr-xl corner-blinking"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-emerald-400 rounded-bl-xl corner-blinking"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-emerald-400 rounded-br-xl corner-blinking"></div>
                      
                      {/* Center Aim Crosshairs */}
                      <div className="absolute inset-0 m-auto w-5 h-5 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-emerald-400/60"></div>
                        <div className="h-full w-0.5 bg-emerald-400/60 absolute"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-sm shadow-emerald-400"></div>
                      </div>

                      {/* Animated Laser Beam */}
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_16px_#10b981] absolute scanner-laser-beam"></div>
                    </div>

                    {/* 1-LINE CLEAN CAMERA STATUS BADGE */}
                    <div className="mt-3 max-w-[94%] overflow-hidden">
                      <span className="text-[9px] sm:text-[9.5px] font-black text-emerald-300 bg-slate-950/95 px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-emerald-500/40 shadow-lg whitespace-nowrap block text-center truncate">
                        ⚡ BACK CAMERA ACTIVE • SCANNING MESS QR...
                      </span>
                    </div>
                  </div>
                )}

                {/* IDLE / INACTIVE STATE PREVIEW WITH EMBEDDED ANIMATED MINI QR */}
                {!isScanning && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 space-y-2.5 z-0 bg-radial from-slate-900 to-slate-950 hologram-grid-bg relative">
                    
                    {/* Glowing Animated QR Visual Container */}
                    <div className="relative group cursor-pointer" onClick={startRearCamera}>
                      {/* Radar Rings */}
                      <div className="absolute -inset-2 rounded-2xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/30 transition-all"></div>
                      <div className="absolute -inset-4 rounded-full border border-emerald-500/30 radar-ring-wave pointer-events-none"></div>

                      <div className="relative w-28 h-28 bg-white p-2 rounded-2xl shadow-2xl border-2 border-emerald-400/80 overflow-hidden flex items-center justify-center">
                        <QRCodeSVG
                          value={officialQrPayload}
                          size={96}
                          level="M"
                          includeMargin={false}
                          fgColor="#0f172a"
                        />
                        {/* High-tech sweeping laser line over QR */}
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_#10b981] cyber-laser-beam pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-emerald-500/10 pointer-events-none"></div>
                      </div>

                      <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-black shadow-lg border border-emerald-300">
                        TAP TO SCAN
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-white">Smart Mess Counter Scanner</h3>
                      <p className="text-[10.5px] text-slate-400 max-w-[240px] leading-tight mt-1">
                        Point camera at the Mess Counter QR or tap below to activate all 4 meals.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 2. DEDICATED ANIMATED OFFICIAL COUNTER QR MODE */}
            {activeViewMode === 'COUNTER_QR' && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#030712] to-slate-950 hologram-grid-bg">
                
                {/* Holographic Concentric Circles */}
                <div className="absolute w-56 h-56 rounded-full border border-cyan-500/20 cyber-rotate-cw pointer-events-none"></div>
                <div className="absolute w-44 h-44 rounded-full border border-dashed border-emerald-500/30 cyber-rotate-ccw pointer-events-none"></div>
                <div className="absolute w-64 h-64 rounded-full border border-emerald-500/20 radar-ring-wave pointer-events-none"></div>

                {/* Cyber Holographic QR Box with Corner HUD */}
                <div className="relative p-2.5 bg-slate-900/90 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  {/* Corner Targets */}
                  <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg corner-blinking"></div>
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg corner-blinking"></div>
                  <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg corner-blinking"></div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-3 border-r-3 border-emerald-400 rounded-br-lg corner-blinking"></div>

                  {/* QR SVG Inside Clean White Canvas */}
                  <div className="bg-white p-2.5 rounded-xl relative overflow-hidden flex items-center justify-center">
                    <QRCodeSVG
                      value={officialQrPayload}
                      size={140}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: logo,
                        x: undefined,
                        y: undefined,
                        height: 28,
                        width: 28,
                        excavate: true,
                      }}
                    />
                    
                    {/* Continuous Futuristic Laser Beam Sweep */}
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_14px_#10b981] absolute scanner-laser-beam pointer-events-none"></div>
                    <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none"></div>
                  </div>
                </div>

                {/* Info Text */}
                <div className="mt-2.5 space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-radar-dot"></span>
                    <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                      GP BARH • CENTRAL MESS COUNTER
                    </span>
                  </div>
                  <p className="text-[9.5px] text-slate-400">
                    Live Verified Institutional Token Channel
                  </p>
                </div>
              </div>
            )}

            {/* CAMERA ERROR NOTIFICATION */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-950/95 p-4 flex flex-col items-center justify-center text-center space-y-2 z-20">
                <span className="text-2xl">⚠️</span>
                <p className="text-xs text-rose-300 font-bold max-w-xs">{cameraError}</p>
              </div>
            )}
          </div>

          {/* PRIMARY ACTION BUTTONS */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={isScanning ? processAttendanceSubmission : startRearCamera}
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                !isScanning
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40 border border-emerald-400/40'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/40 border border-blue-400/40'
              }`}
            >
              <span className="text-base">{isScanning ? '⚡' : '📸'}</span>
              <span>
                {isScanning
                  ? 'Tap to Submit Today Attendance Now'
                  : isTodayDone
                  ? 'Re-Scan & Update Attendance'
                  : 'Open Camera & Scan QR Attendance'}
              </span>
            </button>

            {/* FAST 1-TAP INSTANT CONFIRMATION BUTTON */}
            {!isTodayDone && (
              <button
                type="button"
                onClick={processAttendanceSubmission}
                disabled={isProcessing}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <span>⚡ Instant 1-Tap Attendance Confirmation</span>
              </button>
            )}
          </div>

        </div>

        {/* 🌟 3. ACTIVE DIGITAL MEAL TOKEN SECTION (APPEARS WHEN SCANNED/VERIFIED) 🌟 */}
        {isTodayDone && (
          <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-emerald-900/60 border-2 border-emerald-500/60 rounded-3xl p-4 shadow-xl shadow-emerald-950/50 space-y-3 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Ambient Background Sheen */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 pulse-radar-dot"></span>
                <span className="text-[10.5px] font-black uppercase tracking-widest text-emerald-300">
                  Active Meal Token Pass
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-sm">
                Verified Today
              </span>
            </div>

            {/* BIG HIGH-CONTRAST TOKEN DISPLAY */}
            <div className="bg-black/70 rounded-2xl p-4 border border-emerald-500/40 text-center space-y-1.5 shadow-inner">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                Official Daily Reset Token
              </p>
              
              {/* BIG BOLD TOKEN NUMBER */}
              <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-widest flex items-center justify-center gap-1 drop-shadow-[0_0_16px_rgba(52,211,153,0.6)]">
                <span>{todayRecord?.display_token || `TOKEN #${todayRecord?.short_token || '001'}`}</span>
              </div>

              {/* DATE & TIME BADGE */}
              <div className="pt-1 flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                  📅 {todayRecord?.formatted_date || liveDateFormatted}
                </span>
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-lg border border-emerald-400/30 font-mono">
                  ⏰ {todayRecord?.scanned_at || liveTimeFormatted}
                </span>
              </div>
            </div>

            {/* VIEW FULL TOKEN PASS MODAL BUTTON */}
            <button
              type="button"
              onClick={() => setVerifiedModal(todayRecord)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
            >
              <span>🎫 View Full Token Pass &amp; Receipt</span>
            </button>
          </div>
        )}

        {/* 🌟 4. 4-MEALS REALTIME BREAKDOWN GRID (1 SCAN = 4 MEALS) */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🍽️</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                1 Daily Scan = 4 Meals Active
              </span>
            </div>
            <span className="text-[9.5px] font-mono text-slate-400">
              {liveDateFormatted}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Breakfast */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                isTodayDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🥞</span>
                <div>
                  <h4 className="text-[11px] font-bold text-white leading-tight">Breakfast</h4>
                  <p className="text-[9px] text-slate-400">07:30 - 09:30 AM</p>
                </div>
              </div>
              <span className={`text-[10px] font-black ${isTodayDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isTodayDone ? '✓ ACTIVE' : 'PENDING'}
              </span>
            </div>

            {/* Lunch */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                isTodayDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🍛</span>
                <div>
                  <h4 className="text-[11px] font-bold text-white leading-tight">Lunch</h4>
                  <p className="text-[9px] text-slate-400">12:30 - 02:30 PM</p>
                </div>
              </div>
              <span className={`text-[10px] font-black ${isTodayDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isTodayDone ? '✓ ACTIVE' : 'PENDING'}
              </span>
            </div>

            {/* Snacks */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                isTodayDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🫖</span>
                <div>
                  <h4 className="text-[11px] font-bold text-white leading-tight">Snacks</h4>
                  <p className="text-[9px] text-slate-400">05:00 - 06:30 PM</p>
                </div>
              </div>
              <span className={`text-[10px] font-black ${isTodayDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isTodayDone ? '✓ ACTIVE' : 'PENDING'}
              </span>
            </div>

            {/* Dinner */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                isTodayDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🍲</span>
                <div>
                  <h4 className="text-[11px] font-bold text-white leading-tight">Dinner</h4>
                  <p className="text-[9px] text-slate-400">08:00 - 10:00 PM</p>
                </div>
              </div>
              <span className={`text-[10px] font-black ${isTodayDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isTodayDone ? '✓ ACTIVE' : 'PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* 🌟 5. ANNUAL MESS ATTENDANCE GRAPH BANNER CARD */}
        <div
          onClick={redirectToStudentRecordGraph}
          className="bg-gradient-to-br from-[#1e1b4b] via-[#172554] to-slate-900 border-2 border-indigo-500/50 hover:border-indigo-400 rounded-3xl p-4 shadow-2xl shadow-indigo-950/60 cursor-pointer transition-all active:scale-98 group relative overflow-hidden"
        >
          {/* Glowing Ambient Gradient */}
          <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Vibrant Icon Box */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 border border-indigo-300/40 flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-indigo-600/40 group-hover:scale-105 transition-transform">
                📊
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-indigo-200 transition-colors leading-tight">
                  Annual Mess Attendance &amp; Activity Graph
                </h3>
                <p className="text-[11px] text-indigo-200/80 mt-1 leading-snug">
                  Tap to view dynamic 12-Month meal wave chart &amp; dossier
                </p>
              </div>
            </div>

            {/* Glowing Arrow Pill */}
            <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-600/40 shrink-0 group-hover:translate-x-1 transition-transform border border-indigo-300/30">
              <span className="text-base font-black">↗</span>
            </div>
          </div>
        </div>
      </main>

      {/* 🌟 6. OFFICIAL FOOTER (APK SAFE-BOTTOM BAR) */}
      <footer className="p-3 bg-slate-950/90 border-t border-slate-800 text-center text-xs text-slate-400 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex items-center justify-between px-2">
          <span className="text-[11px] font-medium text-slate-400">
            Govt. Polytechnic Barh • Bihar
          </span>
          <button
            type="button"
            onClick={redirectToStudentRecordGraph}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer flex items-center gap-1"
          >
            <span>Student Record &amp; Charts</span>
            <span>↗</span>
          </button>
        </div>
      </footer>

      {/* 🌟 7. BIG HIGH-VISIBILITY TOKEN PASS MODAL WITH ANIMATED DIGITAL PASS 🌟 */}
      {verifiedModal && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-3.5 backdrop-blur-md">
          <div className="bg-slate-900 rounded-3xl p-5 max-w-sm w-full border-2 border-emerald-400 shadow-2xl shadow-emerald-500/20 text-center space-y-3.5 animate-in fade-in zoom-in-95 duration-150 relative overflow-hidden">
            
            {/* TOP GLOWING BADGE & DATE */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white shadow-lg border border-emerald-300/40 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 block">
                ⭐ OFFICIAL MEAL TOKEN PASS ⭐
              </span>
              
              {/* HUGE TOKEN NUMBER (VISIBLE FROM DISTANCE) */}
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white drop-shadow-md py-1">
                {verifiedModal.display_token || `TOKEN #${verifiedModal.short_token || '001'}`}
              </div>

              {/* HIGH CONTRAST DATE BADGE */}
              <div className="inline-block bg-black/40 px-3 py-1 rounded-xl text-xs font-black font-mono text-amber-300 border border-white/20">
                📅 {verifiedModal.formatted_date || liveDateFormatted}
              </div>
            </div>

            {/* VERIFICATION CHECK WITH ANIMATED LASER BADGE */}
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-black text-xs uppercase tracking-wider">
              <span className="text-base">✅</span>
              <span>4 Meals Verified for Today</span>
            </div>

            {/* STUDENT & HOSTEL DETAILS */}
            <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-left space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Student:</span>
                <strong className="text-white font-sans text-xs">{studentName}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Reg No:</span>
                <strong className="text-white">{studentRegNo}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Hostel:</span>
                <strong className={isFemale ? 'text-pink-400' : 'text-blue-400'}>{studentHostelBlock}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Room/Bed:</span>
                <strong className="text-slate-200">{roomBedDisplay}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Scan Time:</span>
                <strong className="text-emerald-400">{verifiedModal.scanned_at || liveTimeFormatted}</strong>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800 text-[10px]">
                <span>Full Code:</span>
                <strong className="text-slate-300 truncate max-w-[170px]">{verifiedModal.token_code}</strong>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={redirectToStudentRecordGraph}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold text-xs uppercase cursor-pointer shadow-lg shadow-indigo-600/30 border border-indigo-400/40 flex items-center justify-center gap-1.5"
              >
                <span>📊 View in Student Record &amp; Charts →</span>
              </button>
              
              <button
                type="button"
                onClick={() => setVerifiedModal(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer border border-slate-700"
              >
                Close &amp; Keep Active
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default MessScanner;

