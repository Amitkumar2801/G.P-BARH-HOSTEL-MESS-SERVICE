// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import '../App.css';

// ASSETS IMPORT
import logo from '../assets/logo.png.png';

function Signup() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ---------------------------------------------------------
  // FORM STATES
  // ---------------------------------------------------------
  const [role, setRole] = useState("student"); // Default role
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState("MALE"); // Default selection: Male
  
  // Dynamic fields
  const [regNo, setRegNo] = useState("");
  const [session, setSession] = useState("2024-27");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("AI & ML");
  const [adminId, setAdminId] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [showMasterKey, setShowMasterKey] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // API CALL: HANDLE SIGNUP
  // ---------------------------------------------------------
  const handleSignup = async (e) => {
    e.preventDefault();

    // Basic validation based on role
    if (!fullName || !password) {
      toast.error("Please fill in Name and Password! 🛑");
      return;
    }
    if (role === 'student' && (!regNo || !email)) {
      toast.error("Student Registration No. & Email are required! 🛑");
      return;
    }
    if (role === 'warden' && (!adminId || !masterKey)) {
      toast.error("Warden Admin ID & Master Key are required! 🛑");
      return;
    }

    setIsLoading(true);

    let payload = {
      role,
      full_name: fullName,
      password,
      gender: gender,
      reg_no_email: regNo || email || adminId
    };

    if (role === 'student') {
      payload.reg_no = regNo;
      payload.branch = branch;
      payload.email = email;
      payload.session = session;
      payload.semester = session;
      payload.reg_no_email = regNo; 
    } else if (role === 'warden') {
      payload.admin_id = adminId;
      payload.master_key = masterKey;
      payload.reg_no_email = adminId;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/signup", payload);

      toast.success(response.data.message || "Account successfully created! 🎉", {
        duration: 3500,
        style: { borderRadius: '12px', background: '#0f172a', color: '#fff' }
      });
      
      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (error) {
      if (error.response && error.response.data) {
        toast.error("Signup Failed: " + error.response.data.detail);
      } else {
        toast.error("Server connection failed. Is backend running? 🤔");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold ${
    isDarkMode ? 'bg-gray-800/90 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400'
  }`;

  const labelClass = `block text-[11px] font-bold uppercase tracking-widest mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isDarkMode ? 'dark bg-[#0a0a0a]' : 'bg-gray-100'}`}>
      <Toaster position="top-center" />

      {/* ================= HEADER SECTION ================= */}
      <header className="w-full z-20 shadow-lg">
        <div className="bg-black text-gray-300 text-[10px] md:text-xs py-2 px-4 md:px-6 flex justify-between items-center">
          <div className="flex space-x-3 items-center font-medium tracking-wide">
            <span className="text-yellow-400 font-extrabold tracking-wide">GP Barh Hostel &amp; Mess Portal</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-yellow-400 drop-shadow-md">Theme</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full border border-gray-600 hover:border-yellow-400 hover:scale-110 transition-transform duration-300 shadow-md bg-white h-7 w-7 flex items-center justify-center p-1 overflow-hidden cursor-pointer"
            >
              <img src={logo} alt="Theme Toggle" className="h-full w-full object-contain" />
            </button>
          </div>
        </div>
        <div className="bg-[#720e0e] text-white py-2.5 px-4 md:px-6 flex items-center justify-between border-b-[3px] border-yellow-500/80 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1.5 h-12 w-12 rounded-full shadow-lg flex items-center justify-center overflow-hidden">
              <img src={logo} alt="GP Barh Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold font-serif tracking-wide leading-tight drop-shadow-sm">राजकीय पॉलिटेक्निक, बाढ़</h1>
              <p className="text-[10px] text-yellow-300 font-semibold tracking-wider uppercase">Hostel &amp; Mess Digital Registration</p>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT AREA (SIGNUP FORM) ================= */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 relative">
        <div className={`relative z-10 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-[920px] overflow-hidden border transition-all duration-300 ${
          isDarkMode ? 'bg-[#121212]/95 border-gray-700 text-white' : 'bg-white/95 border-white/60 text-gray-900'
        }`}>

          <div className="w-full md:w-[56%] p-6 md:p-8 lg:p-10 flex flex-col justify-center">
            <div className="text-center md:text-left mb-6">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-1 tracking-tight text-blue-600 dark:text-blue-400 drop-shadow-sm">
                Create Account
              </h2>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Sign up to choose your hostel room & bed allocation
              </p>
            </div>

            {/* 🌟 FORM */}
            <form className="space-y-4" onSubmit={handleSignup}>
              
              {/* REGISTER AS DROPDOWN */}
              <div>
                <label className={labelClass}>Register As</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold cursor-pointer ${
                    isDarkMode ? 'bg-gray-800 border-gray-600 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  <option value="student">👨‍🎓 Student</option>
                  <option value="warden">🛡️ Warden / Admin</option>
                </select>
              </div>

              {/* 🌟 GENDER TOGGLE (MALE / FEMALE) */}
              <div>
                <label className={labelClass}>Select Gender</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setGender("MALE")}
                    className={`py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      gender === "MALE"
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span>👨 Male</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("FEMALE")}
                    className={`py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      gender === "FEMALE"
                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span>👩 Female</span>
                  </button>
                </div>
              </div>

              {/* COMMON FIELD: FULL NAME */}
              <div>
                <label className={labelClass}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Amit Kumar Sharma"
                  className={inputClass}
                />
              </div>

              {/* STUDENT FIELDS */}
              {role === 'student' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Registration Number</label>
                      <input
                        type="text"
                        required
                        value={regNo}
                        onChange={(e) => setRegNo(e.target.value)}
                        placeholder="e.g. 1554424049"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Academic Session</label>
                      <input
                        type="text"
                        required
                        value={session}
                        onChange={(e) => setSession(e.target.value)}
                        placeholder="e.g. 2024-27"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Branch / Department</label>
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className={inputClass}
                      >
                        <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                        <option value="Civil Engineering (Construction Technology)">Civil Engineering (Construction Technology)</option>
                        <option value="Electronics (Robotics)">Electronics (Robotics)</option>
                        <option value="Mechanical Engineering (CAD/CAM)">Mechanical Engineering (CAD/CAM)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* WARDEN FIELDS */}
              {role === 'warden' && (
                <>
                  <div>
                    <label className={labelClass}>Admin ID / Email</label>
                    <input
                      type="text"
                      required
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="e.g. amitkumar.arwal28@gmail.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Master Authorization Key</label>
                    <div className="relative">
                      <input
                        type={showMasterKey ? "text" : "password"}
                        required
                        value={masterKey}
                        onChange={(e) => setMasterKey(e.target.value)}
                        placeholder="Master Secret Key"
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowMasterKey(!showMasterKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 cursor-pointer focus:outline-none transition-colors"
                        title={showMasterKey ? "Hide key" : "Show key"}
                      >
                        {showMasterKey ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* COMMON FIELD: PASSWORD */}
              <div>
                <label className={labelClass}>Create Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 cursor-pointer focus:outline-none transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-extrabold py-3.5 rounded-xl transition-all shadow-lg text-sm tracking-wider uppercase mt-4 flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/40 transform hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 Register & Continue to Onboarding</span>
                  </>
                )}
              </button>

              <div className="text-center mt-3">
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Already registered? <Link to="/" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">Sign In here</Link>
                </p>
              </div>
            </form>
          </div>

          {/* 🌟 ULTRA-PREMIUM DYNAMIC RIGHT HERO BANNER (BOYS vs GIRLS ARCHITECTURE) 🌟 */}
          <div className={`hidden md:flex w-[44%] p-8 flex-col justify-between relative overflow-hidden transition-all duration-500 ${
            gender === 'FEMALE' 
              ? (isDarkMode ? 'bg-gradient-to-br from-pink-950/90 via-slate-900 to-purple-950/90 border-l border-pink-500/30' : 'bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 border-l border-pink-200')
              : (isDarkMode ? 'bg-gradient-to-br from-blue-950/90 via-slate-900 to-indigo-950/90 border-l border-blue-500/30' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 border-l border-blue-200')
          }`}>
            {/* Ambient Background Glow Spheres */}
            <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${
              gender === 'FEMALE' ? 'bg-pink-500' : 'bg-blue-500'
            }`}></div>
            <div className={`absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
              gender === 'FEMALE' ? 'bg-purple-500' : 'bg-indigo-500'
            }`}></div>

            {/* HEADER BADGE & HOSTEL TITLE */}
            <div className="text-center w-full relative z-10">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-3 shadow-md border transition-all duration-300 ${
                gender === 'FEMALE'
                  ? (isDarkMode ? 'bg-pink-900/80 text-pink-200 border-pink-400/50 shadow-pink-500/20' : 'bg-pink-100 text-pink-900 border-pink-300 shadow-pink-100')
                  : (isDarkMode ? 'bg-blue-900/80 text-blue-200 border-blue-400/50 shadow-blue-500/20' : 'bg-blue-100 text-blue-900 border-blue-300 shadow-blue-100')
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full animate-ping inline-block ${gender === 'FEMALE' ? 'bg-pink-400' : 'bg-blue-400'}`}></span>
                <span>{gender === 'FEMALE' ? '🌸 SECURE RESIDENTIAL COMPLEX' : '🏛️ DUAL-WING RESIDENTIAL CAMPUS'}</span>
              </div>

              <h3 className={`text-xl font-black uppercase tracking-wider mb-1.5 drop-shadow-sm ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {gender === 'FEMALE' ? 'Savitribai Phule Girls Hostel' : 'GP Barh Boys Hostel'}
              </h3>
              <p className={`text-xs font-black tracking-wide ${
                gender === 'FEMALE' 
                  ? (isDarkMode ? 'text-pink-300' : 'text-pink-700') 
                  : (isDarkMode ? 'text-blue-300' : 'text-blue-700')
              }`}>
                {gender === 'FEMALE' ? 'Dedicated Student Residential Complex' : 'Birsa Munda & Dr. Rajendra Prasad Residential Blocks'}
              </p>
            </div>

            {/* INTERACTIVE ARCHITECTURAL SHOWCASE CARD */}
            <div className={`my-5 w-full space-y-2.5 backdrop-blur-md p-4 rounded-2xl shadow-xl border relative z-10 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-slate-900/90 border-slate-700/80 shadow-black/40' 
                : 'bg-white/95 border-slate-200/80 shadow-slate-200/50'
            }`}>
              {gender === 'MALE' ? (
                <>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-blue-50/70 border-blue-100 hover:bg-blue-50'
                  }`}>
                    <span className="text-xl">🏢</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Birsa Munda Block</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Modern Student Living &amp; Study Wing</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-blue-50/70 border-blue-100 hover:bg-blue-50'
                  }`}>
                    <span className="text-xl">🏢</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dr. Rajendra Prasad Block</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Premium Residential Quarters</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-indigo-50/70 border-indigo-100 hover:bg-indigo-50'
                  }`}>
                    <span className="text-xl">🛋️</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Common Room (BH1 &amp; BH2)</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Recreation Lounge, Table Tennis &amp; TV Arena</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}>
                    <span className="text-xl">📹</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>24x7 HD CCTV Surveillance</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Comprehensive Multi-Tier Campus Security</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-sky-50/70 border-sky-100 hover:bg-sky-50'
                  }`}>
                    <span className="text-xl">💧</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>24x7 Water Cooler</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Multi-Stage Purified RO Chilled Drinking Water</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-pink-50/70 border-pink-100 hover:bg-pink-50'
                  }`}>
                    <span className="text-xl">🌸</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Savitribai Phule Block</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Safe, Modern &amp; Well-Equipped Residence</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-purple-50/70 border-purple-100 hover:bg-purple-50'
                  }`}>
                    <span className="text-xl">🛋️</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Common Room &amp; Reading Lounge</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Recreation Space, TV &amp; Quiet Study Zone</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-rose-50/70 border-rose-100 hover:bg-rose-50'
                  }`}>
                    <span className="text-xl">🛡️</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>24x7 Security &amp; CCTV Surveillance</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Biometric Gate &amp; 24x7 Female Warden Desk</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-sky-50/70 border-sky-100 hover:bg-sky-50'
                  }`}>
                    <span className="text-xl">💧</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>24x7 Water Cooler</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Multi-Stage Purified RO Chilled Drinking Water</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-pink-50/70 border-pink-100 hover:bg-pink-50'
                  }`}>
                    <span className="text-xl">✨</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Illuminated Corridors &amp; Balconies</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Fresh-Air Cross-Ventilation &amp; Green Views</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* OFFICIAL FOOTER TEXT */}
            <div className="text-center relative z-10">
              <p className={`text-[11px] font-extrabold tracking-wide uppercase ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Government Polytechnic Barh Hostel &amp; Mess
              </p>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}

export default Signup;