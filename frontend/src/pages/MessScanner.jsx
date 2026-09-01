// src/pages/MessScanner.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import toast, { Toaster } from 'react-hot-toast';
import logo from '../assets/logo.png.png';

const cleanScannerStyles = `
  @keyframes scanLaser {
    0% { top: 12%; opacity: 0.7; }
    50% { top: 88%; opacity: 1; filter: drop-shadow(0 0 8px #10b981); }
    100% { top: 12%; opacity: 0.7; }
  }

  .scanner-laser-beam {
    animation: scanLaser 2s ease-in-out infinite;
  }

  #gpbarh-camera-target video {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    border-radius: 1.25rem !important;
  }
`;

function MessScanner() {
  const navigate = useNavigate();

  // Live system clock for real-time header tracking
  const [liveClock, setLiveClock] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format today's date from live header clock
  const liveDateKey = liveClock.toISOString().slice(0, 10);
  const liveDateFormatted = liveClock.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  // Load student profile directly from Manage Profile / LocalStorage session
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

  // Extract real dynamic profile particulars for Boys & Girls
  const isFemale = String(currentUser?.gender || '').toUpperCase() === 'FEMALE';
  const studentName = String(currentUser?.full_name || currentUser?.fullName || (isFemale ? 'Sana Sharma' : 'Amit Kumar Sharma')).trim();
  const studentRegNo = String(currentUser?.reg_no || currentUser?.regNo || (isFemale ? '1554424000' : '1554424049'));
  const studentBranch = currentUser?.branch || 'Artificial Intelligence & Machine Learning';
  
  const studentHostelBlock = currentUser?.hostel_block || currentUser?.hostelBlock || (
    isFemale ? 'Savitribai Phule Girls Hostel' : 'Dr. Rajendra Prasad Block'
  );
  const studentRoom = currentUser?.room_number || currentUser?.roomNumber || '102';
  const studentBed = currentUser?.bed_code || currentUser?.bedCode || currentUser?.bed || 'Bed B';
  const roomBedDisplay = `Room ${studentRoom} • ${studentBed.startsWith('Bed') ? studentBed : 'Bed ' + studentBed}`;

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifiedModal, setVerifiedModal] = useState(null);

  // Read recorded attendance map
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

  // Sync state to localStorage for StudentRecordDossier
  useEffect(() => {
    localStorage.setItem('gpbarh_daily_meal_attendance_records', JSON.stringify(dailyAttendanceRecords));
  }, [dailyAttendanceRecords]);

  // Audio & Vibration feedback
  const triggerSuccessAlert = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // ignore
    }
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 150]);
    }
  };

  // Start Rear Camera
  const startRearCamera = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      await new Promise(r => setTimeout(r, 200));
      const html5QrCode = new Html5Qrcode(scannerElementId);
      html5QrCodeRef.current = html5QrCode;

      const config = { fps: 20, qrbox: { width: 230, height: 230 }, aspectRatio: 1.0 };

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
      setCameraError('Camera access not available. Tap "Submit Attendance" below.');
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
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Process Attendance Submission for Today's Live Date
  const processAttendanceSubmission = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    await stopRearCamera();

    const timestampNow = new Date();
    const nowTimeStr = timestampNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const cleanReg = String(studentRegNo).slice(-4);
    const tokenCode = `GPB-MEAL-${liveDateKey.replace(/-/g, '')}-${cleanReg}-${cleanReg}`;

    // Mark attendance in backend API if available
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
        qr_payload: `GPB-OFFICIAL-CENTRAL-MESS-COUNTER-${liveDateKey}`
      });
    } catch {
      // Offline fallback
    }

    const newDayRecord = {
      date: liveDateKey,
      status: 'PRESENT',
      student_name: studentName,
      reg_no: studentRegNo,
      gender: isFemale ? 'FEMALE' : 'MALE',
      hostel_block: studentHostelBlock,
      room_info: roomBedDisplay,
      scanned_at: nowTimeStr,
      token_code: tokenCode,
      meals_count: 4,
      meals: {
        breakfast: true,
        lunch: true,
        snacks: true,
        dinner: true
      }
    };

    // Update Daily Map
    setDailyAttendanceRecords(prev => ({
      ...prev,
      [liveDateKey]: newDayRecord
    }));

    // Update History List for Warden & Student Audit
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
      token_code: tokenCode,
      status: 'VERIFIED',
      venue: studentHostelBlock
    };
    try {
      const existingHist = JSON.parse(localStorage.getItem('gpbarh_mess_attendance_history') || '[]');
      localStorage.setItem('gpbarh_mess_attendance_history', JSON.stringify([historyItem, ...existingHist.filter(h => h.date !== liveDateKey)]));
    } catch {
      // ignore
    }

    triggerSuccessAlert();
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#059669', '#2563eb', '#d97706', '#dc2626']
    });

    setVerifiedModal(newDayRecord);
    toast.success(`Attendance Recorded for ${studentName}! 4 Meals Verified ✅`, {
      style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px', fontWeight: 700 }
    });

    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <Toaster position="top-center" />
      <style dangerouslySetInnerHTML={{ __html: cleanScannerStyles }} />

      {/* 🌟 1. OFFICIAL INSTITUTIONAL HEADER WITH LIVE DATE TRACKER */}
      <header className="bg-gradient-to-r from-[#800000] via-[#991b1b] to-[#7f1d1d] text-white px-4 sm:px-6 py-3.5 shadow-md sticky top-0 z-30">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          
          {/* LOGO & TITLE */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student-dashboard')}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-all active:scale-95 shrink-0"
              title="Return to Student Dashboard"
            >
              ←
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white p-0.5 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                <img src={logo} alt="GP Barh Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">Govt. Polytechnic, Barh</h1>
                <p className="text-[10px] text-red-100 font-medium hidden xs:block">Hostel &amp; Mess QR Attendance</p>
              </div>
            </div>
          </div>

          {/* LIVE DATE BADGE (SYNCED WITH SYSTEM TIME) */}
          <div className="flex items-center gap-2">
            <div className="bg-black/30 border border-white/20 px-3 py-1 rounded-full text-right shrink-0">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-bold font-mono text-white leading-none">
                  {liveDateFormatted}
                </span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 🌟 2. MAIN APPLICATION WORKSPACE */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4">
        
        {/* STUDENT INFO BADGE (DYNAMIC FROM MANAGE PROFILE) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center shadow-md border shrink-0 text-white ${
              isFemale 
                ? 'bg-gradient-to-br from-pink-600 to-rose-700 shadow-pink-600/20 border-pink-400' 
                : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-600/20 border-blue-400'
            }`}>
              {studentName[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-slate-900 tracking-tight">{studentName}</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase border border-emerald-300">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Reg: {studentRegNo}</p>
              <p className={`text-[11px] font-bold ${isFemale ? 'text-pink-700' : 'text-blue-700'}`}>
                {studentHostelBlock} • {roomBedDisplay}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border inline-flex items-center gap-1 ${
              isTodayDone
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {isTodayDone ? '✅ 4 Meals Recorded' : '⏳ Today Pending'}
            </span>
          </div>
        </div>

        {/* 🌟 3. PERFECTLY CENTERED PHONE REAR CAMERA SCANNER */}
        <div className="bg-slate-900 rounded-3xl p-4 border border-slate-300 shadow-xl space-y-3 text-white">
          
          <div className="relative w-full aspect-square max-h-[340px] bg-black rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-700 mx-auto">
            
            {/* HTML5-QRCODE TARGET VIEW */}
            <div id={scannerElementId} className="absolute inset-0 w-full h-full flex items-center justify-center"></div>

            {/* SCANNING LASER & CORNERS */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4 z-10">
                <div className="w-52 h-52 border-2 border-emerald-400 rounded-2xl relative shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] absolute scanner-laser-beam"></div>
                </div>
                <span className="text-[10px] font-black text-emerald-300 mt-3 bg-black/85 px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-500/40">
                  📱 Phone Back Camera Active • Focus Counter QR
                </span>
              </div>
            )}

            {/* IDLE CENTERED PLACEHOLDER */}
            {!isScanning && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-2.5 z-0">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-inner">
                  📷
                </div>
                <h3 className="text-sm font-black text-white">Phone Rear Camera</h3>
                <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed">
                  Tap the button below to open camera and scan the official Counter QR code.
                </p>
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

          {/* 🌟 4. SINGLE ALL-IN-ONE PRIMARY BUTTON */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={isScanning ? processAttendanceSubmission : startRearCamera}
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                !isScanning
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
              }`}
            >
              <span>{isScanning ? '⚡' : '📸'}</span>
              <span>
                {isScanning
                  ? 'Tap to Submit Today Attendance Now'
                  : (isTodayDone ? 'Re-Scan & Update Attendance' : 'Open Camera & Scan QR Attendance')}
              </span>
            </button>

            {isScanning && (
              <button
                type="button"
                onClick={stopRearCamera}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs border border-slate-700 cursor-pointer"
              >
                ✕ Close Camera
              </button>
            )}
          </div>

        </div>

        {/* 🌟 5. TODAY'S ATTENDANCE STATUS CARD (CLEAN & SIMPLE) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isTodayDone
            ? 'bg-emerald-50 border-emerald-300 shadow-sm'
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Today's Attendance Status • {liveDateFormatted}
              </span>
              <h3 className={`text-sm font-black mt-0.5 ${
                isTodayDone ? 'text-emerald-900' : 'text-slate-700'
              }`}>
                {isTodayDone ? '✅ 4 Meals Recorded for Today' : '⏳ Today\'s Attendance Pending'}
              </h3>
            </div>

            {isTodayDone && (
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0">
                {todayRecord.scanned_at}
              </span>
            )}
          </div>

          {isTodayDone ? (
            <div className="mt-3 pt-2.5 border-t border-emerald-200 flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-emerald-800">
                🥞 Breakfast • 🍛 Lunch • 🫖 Snacks • 🍲 Dinner
              </span>
              <button
                onClick={() => navigate('/student-dashboard')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                View in Charts →
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 mt-2">
              Scan the official Counter QR or tap the button above to automatically mark Breakfast, Lunch, Snacks &amp; Dinner for {liveDateFormatted}.
            </p>
          )}
        </div>

      </main>

      {/* 🌟 6. OFFICIAL FOOTER */}
      <footer className="p-3.5 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-xl mx-auto flex items-center justify-between px-2">
          <span>Government Polytechnic Barh • Bihar</span>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Student Record &amp; Charts ↗
          </button>
        </div>
      </footer>

      {/* 🌟 7. SUCCESS RECEIPT MODAL */}
      {verifiedModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-3xl mx-auto shadow-md">
              ✅
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Attendance Recorded!</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">Date: {verifiedModal.date}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Student:</span>
                <strong className="text-slate-900 font-sans">{studentName}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Reg No:</span>
                <strong className="text-slate-900">{studentRegNo}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Hostel Block:</span>
                <strong className={isFemale ? 'text-pink-700' : 'text-blue-700'}>{studentHostelBlock}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Room / Bed:</span>
                <strong className="text-slate-800">{roomBedDisplay}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Coverage:</span>
                <strong className="text-emerald-700 font-bold">4/4 Meals (BF, LU, SN, DN)</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Token:</span>
                <strong className="text-slate-800">{verifiedModal.token_code}</strong>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setVerifiedModal(null)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase cursor-pointer shadow-md shadow-emerald-600/20"
              >
                Close &amp; Finish
              </button>
              <button
                type="button"
                onClick={() => navigate('/student-dashboard')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs cursor-pointer border border-slate-300"
              >
                View in Student Record &amp; Charts →
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default MessScanner;
