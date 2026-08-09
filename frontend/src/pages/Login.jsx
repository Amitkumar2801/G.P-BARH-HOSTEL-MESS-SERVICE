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
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

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

        {/* 🌟 ULTRA-PREMIUM, EXPANDED & SPACIOUS LOGIN DASHBOARD CONTAINER 🌟 */}
        <div className={`relative z-10 backdrop-blur-2xl rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.55)] flex flex-col md:flex-row w-full max-w-[980px] min-h-[530px] overflow-hidden border transition-all duration-300 ${isDarkMode ? 'bg-[#121212]/95 border-gray-700/80 text-white' : 'bg-white/95 border-white/80 text-gray-900'
          }`}>

          {/* LEFT SIDE: SPACIOUS & MODERN LOGIN FORM */}
          <div className="w-full md:w-[56%] p-8 md:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              {/* PORTAL BADGE */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  🏛️ Digital Student Portal
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div className="text-left mb-6 md:mb-7">
                <h2 className="text-3xl md:text-4xl lg:text-[40px] font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-200 bg-clip-text text-transparent leading-tight drop-shadow-sm">
                  Student Login
                </h2>
                <p className={`text-xs md:text-sm font-semibold mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sign in to manage your Hostel Passbook, Mess & Room Services
                </p>
              </div>

              {/* 🌟 FORM START */}
              <form className="space-y-4 md:space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className={`block text-[11px] md:text-xs font-extrabold uppercase tracking-wider mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    Registration ID / Roll No / Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="e.g. 1554424049"
                      className={`w-full px-4 py-3 md:py-3.5 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-bold ${isDarkMode ? 'bg-gray-800/90 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50/90 border-gray-300 text-black placeholder-gray-400 shadow-inner'
                        }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">🆔</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={`block text-[11px] md:text-xs font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      Account Password
                    </label>
                    <a href="#" className="text-[11px] font-bold text-blue-600 hover:text-blue-500 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full px-4 py-3 md:py-3.5 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-bold ${isDarkMode ? 'bg-gray-800/90 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50/90 border-gray-300 text-black placeholder-gray-400 shadow-inner'
                        }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔒</span>
                  </div>
                </div>

                {/* LOGIN BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full font-black py-3.5 md:py-4 rounded-xl transition-all duration-200 shadow-lg text-sm md:text-base tracking-widest uppercase flex items-center justify-center gap-2 ${isLoading
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.01] active:scale-[0.99]'
                      }`}
                  >
                    <span>{isLoading ? 'Verifying Account...' : 'Sign In to Portal'}</span>
                    {!isLoading && <span>➔</span>}
                  </button>
                </div>

                {/* SIGNUP LINK */}
                <div className="text-center pt-2">
                  <p className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    New to GP Barh Hostel?{' '}
                    <Link to="/signup" className="font-extrabold text-blue-600 hover:text-blue-500 hover:underline">
                      Create Student Account
                    </Link>
                  </p>
                </div>
              </form>
              {/* 🌟 FORM END */}
            </div>

            {/* SECURITY TRUST PILLS */}
            <div className="pt-6 mt-6 border-t border-gray-200/80 dark:border-gray-800 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">🔒 256-Bit SSL Encrypted</span>
              <span>•</span>
              <span className="flex items-center gap-1">⚡ Instant Passbook Sync</span>
              <span>•</span>
              <span className="flex items-center gap-1">🏛️ GP Barh</span>
            </div>
          </div>

          {/* DIVIDER */}
          <div className={`hidden md:flex flex-col items-center justify-center px-0 border-l border-r ${isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-100/60 border-gray-200'
            }`}>
            <div className={`h-full w-[1px] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <span className={`py-4 px-2.5 text-[11px] font-black uppercase rounded-full my-3 ${isDarkMode ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-white text-gray-400 shadow-md border border-gray-200'}`}>OR</span>
            <div className={`h-full w-[1px] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>

          {/* RIGHT SIDE: MODERN QR MOBILE LOGIN & FEATURES */}
          <div className={`hidden md:flex w-[44%] p-8 lg:p-10 flex-col items-center justify-between text-center relative ${isDarkMode ? 'bg-gradient-to-b from-[#18181b] to-[#0f0f12]' : 'bg-gradient-to-b from-gray-50 to-slate-100'}`}>
            <div className="w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-extrabold uppercase tracking-wider border border-emerald-500/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Fast Mobile App Login</span>
              </div>

              <h3 className={`text-base lg:text-lg font-black uppercase tracking-wider mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Scan to Login Instantly
              </h3>
              <p className={`text-xs font-semibold leading-relaxed mb-6 px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Open the official <strong>GP Barh Mobile App</strong> on your phone and point the camera at this QR code.
              </p>

              {/* QR SCANNER CONTAINER WITH CORNERS */}
              <div className="relative mx-auto w-48 h-48 lg:w-52 lg:h-52 flex items-center justify-center">
                <div className={`w-full h-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center relative overflow-hidden shadow-xl transition-transform hover:scale-105 duration-300 ${isDarkMode ? 'bg-gray-900 border-blue-500/40' : 'bg-white border-blue-400/50'}`}>
                  {/* SCANNING LASER */}
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_4px_rgba(59,130,246,0.9)] animate-scan"></div>
                  
                  <span className="text-6xl lg:text-7xl mb-2 opacity-95 drop-shadow-md">📱</span>
                  <span className="text-[10.5px] text-blue-600 dark:text-blue-400 font-extrabold tracking-widest uppercase">
                    Scan in GP Barh App
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE QR STATUS */}
            <div className="w-full pt-4 mt-4 border-t border-gray-200/80 dark:border-gray-800 flex items-center justify-between text-[11px] font-bold">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>QR Session Live</span>
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">Auto-Refresh 🔄</span>
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

    </div>
  );
}

export default Login;