// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../App.css';

// 🌟 ASSETS IMPORT (Fixed as per your exact file paths)
import logo from '../assets/logo.png.png';
import myPic from '../assets/profile.jpg.jpg';

function Login() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);

  // FORM STATES
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // FORGOT PASSWORD MODAL STATES
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Verify Identity, 2: OTP, 3: Set Password
  const [forgotInput, setForgotInput] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const navigate = useNavigate();

  // FORGOT PASSWORD HANDLERS
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!forgotInput.trim()) {
      toast.error("Please enter your Registration ID or Registered Email!");
      return;
    }
    setIsForgotLoading(true);
    setTimeout(() => {
      setIsForgotLoading(false);
      setForgotStep(2);
      toast.success("Verification Code sent to your registered contact! (Use OTP: 749201)", {
        duration: 5000,
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
    }, 1000);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      toast.error("Please enter the 6-digit verification code!");
      return;
    }
    if (forgotOtp !== "749201" && forgotOtp.length !== 6) {
      toast.error("Invalid Code! Please enter 749201 to verify.");
      return;
    }
    setIsForgotLoading(true);
    setTimeout(() => {
      setIsForgotLoading(false);
      setForgotStep(3);
      toast.success("Identity Verified! Please enter your new password.");
    }, 900);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match! Please verify.");
      return;
    }
    setIsForgotLoading(true);
    setTimeout(() => {
      setIsForgotLoading(false);
      toast.success("Password reset successfully! You can now log in with your new password.", {
        duration: 5000,
        style: { borderRadius: '10px', background: '#166534', color: '#fff' }
      });
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotInput("");
      setForgotOtp("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1100);
  };

  // API CALL: HANDLE LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !password) {
      toast.error("Authentication Error: Student ID and Password are required. Please provide valid credentials.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/login", {
        reg_no_email: userId,
        password: password
      });
      toast.success(`Authentication Successful: ${response.data.message}\nWelcome, ${response.data.user.full_name}. Redirecting to dashboard...`, {
        duration: 4000,
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });

      const role = response.data.user.role;
      if (role === 'student') {
        navigate("/student-dashboard", { state: { userRole: role, userName: response.data.user.full_name } });
      } else {
        navigate("/dashboard", { state: { userRole: role, userName: response.data.user.full_name } });
      }

    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(`Authentication Failed: ${error.response.data.detail}`);
      } else {
        toast.error("Connection Error: Unable to communicate with the server. Please check your network connection or try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-[100dvh] w-full flex flex-col font-sans transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'dark bg-[#0a0a0a]' : 'bg-gray-100'}`}>

      {/* ================= HEADER SECTION ================= */}
      <header className="w-full z-20 shadow-lg shrink-0">
        <div className="bg-black text-gray-300 text-[10px] md:text-[11px] lg:text-xs py-1.5 md:py-2 px-4 md:px-6 flex justify-between items-center">
          <div className="flex space-x-4 items-center font-medium tracking-wide">
            <a href="#" className="hover:text-white transition-colors py-1 hidden md:block">Rules</a>
            <span className="hidden md:inline text-gray-600">|</span>
            <a href="#" className="hover:text-white transition-colors py-1">Mess Menu</a>
            <span className="text-gray-600">|</span>
            <a href="#" className="hover:text-white transition-colors py-1">Contact Warden</a>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-yellow-400 drop-shadow-md">Theme</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full border border-gray-600 hover:border-yellow-400 hover:scale-110 transition-transform duration-300 shadow-md bg-white h-7 w-7 flex items-center justify-center p-1 overflow-hidden"
            >
              <img src={logo} alt="Theme Toggle" className="h-full w-full object-contain" />
            </button>
          </div>
        </div>

        <div className="bg-[#720e0e] text-white py-2 px-4 md:px-6 flex items-center justify-between border-b-[3px] border-yellow-500/80 shadow-md">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-white p-1 h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full shadow-lg flex items-center justify-center overflow-hidden">
              <img src={logo} alt="GP Barh Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold font-serif tracking-wide leading-tight drop-shadow-sm">राजकीय पॉलिटेक्निक, बाढ़</h1>
              <h2 className="text-[9px] md:text-[11px] font-semibold tracking-widest uppercase opacity-95 mt-0.5">Government Polytechnic, Barh</h2>
            </div>
          </div>
        </div>
      </header>

      {/* ==============      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-grow bg-campus flex items-center justify-center p-4 md:p-8 lg:p-10 relative">
        <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-black/75' : 'bg-black/40'}`}></div>

        {/* 🌟 WOW-FACTOR ULTRA-EXPANDED & LUXURIOUS LOGIN DASHBOARD 🌟 */}
        <div className={`relative z-10 backdrop-blur-2xl rounded-[32px] shadow-[0_30px_90px_-15px_rgba(0,0,0,0.6)] flex flex-col md:flex-row w-full max-w-[1040px] min-h-[570px] overflow-hidden border transition-all duration-300 ${isDarkMode ? 'bg-[#111115]/95 border-blue-500/20 text-white shadow-blue-900/10' : 'bg-white/95 border-white/90 text-gray-900 shadow-xl'
          }`}>

          {/* LEFT SIDE: SPACIOUS & GORGEOUS LOGIN FORM */}
          <div className="w-full md:w-[56%] p-8 md:p-12 lg:p-14 flex flex-col justify-center relative">
            <div className="text-left mb-7 md:mb-9">
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-200 bg-clip-text text-transparent leading-none drop-shadow-sm">
                Student Login
              </h2>
              <div className="w-14 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full mt-3"></div>
            </div>

            {/* 🌟 FORM START */}
            <form className="space-y-5 md:space-y-6" onSubmit={handleLogin}>
              <div>
                <label className={`block text-[11px] md:text-xs font-black uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Registration ID / Roll No / Email
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. 1554424049"
                    className={`w-full pl-4 pr-11 py-3.5 md:py-4 rounded-2xl border-2 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-sm md:text-base font-bold ${isDarkMode ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800' : 'bg-gray-50/90 border-gray-200 text-black placeholder-gray-400 focus:bg-white shadow-sm'
                      }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-500 transition-colors">
                    🆔
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`block text-[11px] md:text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    Account Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotStep(1);
                      setForgotInput(userId || "");
                    }}
                    className="text-xs font-extrabold text-blue-600 hover:text-blue-500 hover:underline cursor-pointer bg-transparent border-none p-0 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full pl-4 pr-20 py-3.5 md:py-4 rounded-2xl border-2 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-sm md:text-base font-bold ${isDarkMode ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800' : 'bg-gray-50/90 border-gray-200 text-black placeholder-gray-400 focus:bg-white shadow-sm'
                      }`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs font-bold text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                    <span className="text-gray-400 text-lg">🔒</span>
                  </div>
                </div>
              </div>

              {/* LOGIN BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full font-black py-4 rounded-2xl transition-all duration-300 shadow-xl text-sm md:text-base tracking-widest uppercase flex items-center justify-center gap-3 ${isLoading
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.015] active:scale-[0.98]'
                    }`}
                >
                  <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
                  {!isLoading && <span className="text-lg">➔</span>}
                </button>
              </div>

              {/* SIGNUP / REGISTER LINK */}
              <div className="text-center pt-3">
                <p className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  New to GP Barh Hostel?{' '}
                  <Link to="/signup" className="font-extrabold text-blue-600 hover:text-blue-500 hover:underline">
                    Register
                  </Link>
                </p>
              </div>
            </form>
            {/* 🌟 FORM END */}
          </div>

          {/* DIVIDER */}
          <div className={`hidden md:flex flex-col items-center justify-center px-0 border-l border-r ${isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-100/60 border-gray-200'
            }`}>
            <div className={`h-full w-[1px] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <span className={`py-4 px-3 text-[11px] font-black uppercase rounded-full my-4 ${isDarkMode ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-white text-gray-400 shadow-md border border-gray-200'}`}>OR</span>
            <div className={`h-full w-[1px] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>

          {/* RIGHT SIDE: CLEAN, HIGH-TECH QR MOBILE LOGIN */}
          <div className={`hidden md:flex w-[44%] p-8 lg:p-12 flex-col items-center justify-center text-center relative ${isDarkMode ? 'bg-gradient-to-b from-[#18181f] to-[#0d0d10]' : 'bg-gradient-to-b from-slate-50 via-gray-50 to-blue-50/40'}`}>
            <div className="w-full max-w-[280px]">
              <h3 className={`text-lg lg:text-xl font-black uppercase tracking-wider mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Scan to Login Instantly
              </h3>
              <p className={`text-xs font-semibold leading-relaxed mb-7 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Open the official <strong>GP Barh Mobile App</strong> on your phone and point the camera at this QR code.
              </p>

              {/* QR SCANNER CONTAINER WITH FLOATING LASER */}
              <div className="relative mx-auto w-52 h-52 lg:w-56 lg:h-56 flex items-center justify-center">
                <div className={`w-full h-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-300 ${isDarkMode ? 'bg-gray-900 border-blue-500/50 shadow-blue-900/20' : 'bg-white border-blue-400 shadow-blue-500/10'}`}>
                  {/* SCANNING LASER BEAM */}
                  <div className="absolute w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_25px_6px_rgba(59,130,246,0.95)] animate-scan"></div>
                  
                  <span className="text-7xl mb-3 opacity-95 drop-shadow-lg">📱</span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-black tracking-widest uppercase">
                    Scan in GP Barh App
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= ULTRA-STYLISH COMPACT PRO FOOTER ================= */}
      <footer className="relative bg-gradient-to-b from-[#330404] via-[#1f0202] to-[#0d0101] text-gray-300 z-20 border-t-2 border-yellow-500/80 shadow-[0_-10px_35px_rgba(0,0,0,0.6)] shrink-0">
        {/* Subtle decorative top glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-75"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 text-xs">

            {/* 1. CAMPUS LOCATION (SIMPLE & PROFESSIONAL) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 pb-1 border-b border-white/10">
                <span className="text-yellow-400 text-xs">📍</span>
                <h4 className="text-yellow-400 font-bold uppercase tracking-wider text-[10px]">
                  Campus Location
                </h4>
              </div>

              <a
                href="https://www.google.com/maps/place/Government+Polytechnic,+Barh/@25.4521963,85.7064801,14z/data=!4m6!3m5!1s0x39ed57cbf1604257:0x5cf19375ceeceb89!8m2!3d25.4521963!4d85.7445889!16s%2Fg%2F11s7lsb2gx?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noreferrer"
                className="group block bg-black/40 hover:bg-black/70 border border-white/10 hover:border-yellow-500/60 p-2.5 rounded-lg transition-all duration-200"
                title="Open Government Polytechnic Barh in Google Maps"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center text-sm shrink-0 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                    🏛️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-[11px] group-hover:text-yellow-400 transition-colors leading-snug">
                      Govt. Polytechnic, Barh
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      Patna, Bihar • 803214
                    </p>
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] font-semibold text-yellow-400/90 group-hover:text-yellow-300">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Campus Map</span>
                  </span>
                  <span className="group-hover:translate-x-0.5 transition-transform">Open in Maps ↗</span>
                </div>
              </a>
            </div>

            {/* 2. QUICK PORTALS & HELPLINE */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 pb-1 border-b border-white/10">
                <span className="p-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[11px] font-black">🔗</span>
                <h4 className="text-yellow-400 font-black uppercase tracking-wider text-[10px]">
                  Quick Portals
                </h4>
              </div>
              <ul className="space-y-1 text-[10.5px]">
                <li>
                  <a
                    href="https://www.gpbarh.in/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-yellow-300 font-medium transition-colors flex items-center gap-1.5 py-0.5 rounded hover:bg-white/5"
                  >
                    <span className="text-yellow-500 font-bold">›</span> Official College Website
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-300 font-medium transition-colors flex items-center gap-1.5 py-0.5 rounded hover:bg-white/5"
                  >
                    <span className="text-yellow-500 font-bold">›</span> Hostel & Mess Notice Board
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-300 font-medium transition-colors flex items-center gap-1.5 py-0.5 rounded hover:bg-white/5"
                  >
                    <span className="text-yellow-500 font-bold">›</span> Student Grievance Redressal
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-yellow-300 font-medium transition-colors flex items-center gap-1.5 py-0.5 rounded hover:bg-white/5"
                  >
                    <span className="text-yellow-500 font-bold">›</span> Anti-Ragging Helpline
                  </a>
                </li>
              </ul>
            </div>

            {/* 3. SYSTEM STATS & VISITOR COUNTER */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 pb-1 border-b border-white/10">
                <span className="p-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[11px] font-black">📊</span>
                <h4 className="text-yellow-400 font-black uppercase tracking-wider text-[10px]">
                  System Status
                </h4>
              </div>
              
              <div className="bg-black/50 border border-emerald-500/30 p-1.5 rounded-lg flex items-center gap-2 text-[9.5px] text-emerald-400 font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Hostel Core Services Active</span>
              </div>

              <div>
                <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-widest mb-1">Live Visitors</p>
                <div className="flex space-x-1">
                  {['0', '1', '5', '4', '4', '2'].map((num, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-b from-black to-zinc-900 border border-yellow-500/40 text-yellow-400 font-mono px-1.5 py-0.5 rounded shadow-inner text-[11px] font-black text-center"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. SLEEK DEVELOPER PROFILE (COMPACT & CLEAN) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 pb-1 border-b border-white/10">
                <span className="p-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[11px] font-black">💻</span>
                <h4 className="text-yellow-400 font-black uppercase tracking-wider text-[10px]">
                  Developer Profile
                </h4>
              </div>

              <div className="bg-gradient-to-br from-black/80 via-zinc-950/90 to-[#400404]/50 p-2 rounded-lg border border-yellow-500/30 hover:border-yellow-400/60 transition-all shadow-sm">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[8.5px] text-yellow-400 font-extrabold uppercase tracking-widest">Creator</span>
                  <span className="text-[7.5px] bg-yellow-500/20 text-yellow-300 px-1 py-0.2 rounded font-mono font-bold border border-yellow-500/30">
                    AI & ML
                  </span>
                </div>
                <p className="text-white font-extrabold text-[11px] tracking-wide">AMIT KUMAR SHARMA</p>
                <p className="text-[8.5px] text-gray-400">Govt. Polytechnic, Barh (2024-27)</p>

                <div className="flex items-center gap-1.5 text-[9px] font-bold mt-1.5 pt-1.5 border-t border-white/10">
                  <button
                    onClick={() => setShowIdCard(true)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black py-1 px-1.5 rounded font-bold transition-all shadow-sm flex items-center justify-center gap-1 text-[9px]"
                  >
                    <span>🪪</span> <span>ID Card</span>
                  </button>
                  <a
                    href="https://amitkumar2801.github.io/its.Portfolio/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white py-1 px-1.5 rounded font-bold transition-all shadow-sm flex items-center justify-center gap-1 text-[9px]"
                  >
                    <span>🌐</span> <span>Portfolio</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM COPYRIGHT & DEPARTMENT BAR */}
        <div className="bg-black/85 py-2 px-4 text-center text-[9.5px] text-gray-400 font-medium tracking-wide border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
            <span>© 2026 <strong>Government Polytechnic, Barh</strong> • Hostel & Mess System</span>
            <span className="text-[8.5px] text-gray-500 font-semibold uppercase tracking-wider">
              Dept. of Science, Technology & Technical Education, Bihar
            </span>
          </div>
        </div>
      </footer>

      {/* ================= ID CARD MODAL ================= */}
      {showIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4" onClick={() => setShowIdCard(false)}>

          <div
            className="bg-white w-full max-w-[320px] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] relative animate-scale-in border border-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIdCard(false)}
              className="absolute top-2 right-2 bg-black/20 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors z-10"
            >
              X
            </button>

            <div className="bg-[#800000] p-3 flex flex-col items-center justify-center relative">
              <div className="flex items-center space-x-2 mb-1">
                <div className="bg-white rounded-full p-1 shadow-sm h-10 w-10 flex items-center justify-center overflow-hidden">
                  <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                </div>
                <div className="text-center text-white">
                  <h2 className="text-[12px] font-black leading-tight uppercase font-serif tracking-wide">Govt. Polytechnic, Barh</h2>
                </div>
              </div>
              <p className="text-[7px] text-gray-200 uppercase tracking-widest text-center mt-1">Science Technology & Technical Education Dept.</p>
            </div>

            <div className="bg-red-600 text-white text-[9px] font-bold text-center py-1 uppercase tracking-[0.3em] shadow-sm">
              Identity Card
            </div>

            <div className="p-5 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50">

              <div className="w-20 h-24 bg-white border-2 border-[#800000] mb-3 flex items-center justify-center rounded shadow-md overflow-hidden p-0.5">
                <img src={myPic} alt="Amit Sharma" className="w-full h-full object-cover rounded-sm" />
              </div>

              <h3 className="text-xl font-black text-[#800000] uppercase tracking-wide mb-3">Amit Sharma</h3>

              <div className="w-full text-left space-y-2 text-[11px]">
                <div className="flex border-b border-gray-200 pb-1">
                  <span className="w-20 font-bold text-gray-600 uppercase text-[9px]">Branch</span>
                  <span className="font-bold text-gray-900 leading-tight">: Artificial Intelligence <br />& Machine Learning</span>
                </div>
                <div className="flex border-b border-gray-200 pb-1">
                  <span className="w-20 font-bold text-gray-600 uppercase text-[9px]">Roll No.</span>
                  <span className="font-bold text-gray-900">: 49/AI&ML/2024</span>
                </div>
                <div className="flex border-b border-gray-200 pb-1">
                  <span className="w-20 font-bold text-gray-600 uppercase text-[9px]">Reg. No.</span>
                  <span className="font-bold text-gray-900">: 1554424049</span>
                </div>
                <div className="flex pb-1">
                  <span className="w-20 font-bold text-gray-600 uppercase text-[9px]">Session</span>
                  <span className="font-bold text-gray-900">: 2024-27</span>
                </div>
              </div>

            </div>

            <div className="bg-yellow-500 h-2 w-full"></div>
            <div className="bg-[#800000] h-1 w-full"></div>

          </div>
        </div>
      )}

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-4"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="bg-white dark:bg-[#18181f] text-gray-900 dark:text-white w-full max-w-[440px] rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.6)] border border-gray-200 dark:border-gray-700 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 relative">
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-black transition-colors"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl border border-white/20">
                  🔐
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight leading-tight">Reset Password</h3>
                  <p className="text-[10.5px] text-blue-200 uppercase font-bold tracking-wider">
                    GP Barh Student Account Recovery
                  </p>
                </div>
              </div>

              {/* STEP PROGRESS BAR */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/15 text-[10px] font-bold">
                <div className={`flex items-center gap-1.5 ${forgotStep >= 1 ? 'text-yellow-300 font-extrabold' : 'text-white/60'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${forgotStep >= 1 ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white'}`}>1</span>
                  <span>ID Verify</span>
                </div>
                <span className="text-white/30">➔</span>
                <div className={`flex items-center gap-1.5 ${forgotStep >= 2 ? 'text-yellow-300 font-extrabold' : 'text-white/60'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${forgotStep >= 2 ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white'}`}>2</span>
                  <span>Enter OTP</span>
                </div>
                <span className="text-white/30">➔</span>
                <div className={`flex items-center gap-1.5 ${forgotStep >= 3 ? 'text-yellow-300 font-extrabold' : 'text-white/60'}`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${forgotStep >= 3 ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white'}`}>3</span>
                  <span>New Password</span>
                </div>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 md:p-8">
              {/* STEP 1: ENTER ID */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                      Registration ID / Registered Email
                    </label>
                    <input
                      type="text"
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      placeholder="e.g. 1554424049 or email@gpbarh.in"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm font-bold focus:border-blue-600 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    We'll send a 6-digit password reset verification code to your registered contact.
                  </p>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{isForgotLoading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                    {!isForgotLoading && <span>➔</span>}
                  </button>
                </form>
              )}

              {/* STEP 2: ENTER OTP */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl text-[11px] text-blue-700 dark:text-blue-300 font-bold">
                    💡 OTP sent for <strong>{forgotInput}</strong> (Demo OTP: <span className="underline font-mono text-sm font-black">749201</span>)
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="749201"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-center tracking-[0.5em] font-mono text-lg font-black focus:border-blue-600 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="w-1/3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-bold py-3.5 rounded-xl text-xs uppercase"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                    >
                      <span>{isForgotLoading ? 'Verifying...' : 'Verify OTP ➔'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: SET NEW PASSWORD */}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm font-bold focus:border-blue-600 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm font-bold focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{isForgotLoading ? 'Updating Password...' : 'Save New Password & Login 🔒'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;