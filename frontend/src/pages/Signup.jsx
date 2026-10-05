// src/pages/Signup.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiPost } from '../utils/api';
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
  const [branch, setBranch] = useState("Artificial Intelligence & Machine Learning");
  const [adminId, setAdminId] = useState("");
  const [masterKey, setMasterKey] = useState("");
  const [showMasterKey, setShowMasterKey] = useState(false);

  // Email OTP state for student verification
  const [signupOtp, setSignupOtp] = useState("");
  const [signupOtpError, setSignupOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Warden OTP Verification States
  const [showWardenOtpModal, setShowWardenOtpModal] = useState(false);
  const [wardenOtp, setWardenOtp] = useState(["", "", "", "", "", ""]);
  const [wardenOtpError, setWardenOtpError] = useState("");
  const [isWardenOtpSending, setIsWardenOtpSending] = useState(false);
  const [isWardenRegistering, setIsWardenRegistering] = useState(false);
  const [wardenOtpCountdown, setWardenOtpCountdown] = useState(0);
  const wardenOtpInputRefs = useRef([]);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Student OTP Countdown timer effect (60-second cooldown)
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Warden OTP Countdown timer effect (60-second cooldown)
  useEffect(() => {
    if (wardenOtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setWardenOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [wardenOtpCountdown]);

  // Auto-focus first input box when Warden OTP modal opens
  useEffect(() => {
    if (showWardenOtpModal) {
      setTimeout(() => {
        wardenOtpInputRefs.current[0]?.focus();
      }, 120);
    }
  }, [showWardenOtpModal]);

  // Handle role switch
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'warden') {
      setGender('ALL');
    } else {
      if (gender === 'ALL') setGender('MALE');
    }
  };

  // ---------------------------------------------------------
  // STUDENT OTP HANDLERS
  // ---------------------------------------------------------
  const handleSendSignupOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
      toast.error("Please enter a valid student email address first! 🛑");
      return;
    }
    setSignupOtpError("");
    setIsOtpSending(true);
    try {
      const payload = {
        email: cleanEmail,
        identifier: cleanEmail,
        purpose: "SIGNUP"
      };
      let res;
      try {
        res = await apiPost("/api/auth/send-registration-otp", payload);
      } catch (e1) {
        if (e1?.response?.data && e1?.response?.status !== 404 && e1?.response?.status !== 405) throw e1;
        res = await apiPost("/api/auth/send-otp", payload);
      }
      setOtpSent(true);
      setOtpCountdown(60); // 60-second cooldown timer
      setIsOtpVerified(false);
      setSignupOtpError("");
      toast.success("6-digit OTP sent to your email. Please check your inbox / spam folder.", { duration: 6000 });
    } catch (err) {
      console.error("Send OTP Error:", err);
      const detail = err?.response?.data?.detail || err?.message || "Could not send OTP. Please check your email.";
      setSignupOtpError(detail);
      toast.error(detail);
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleVerifySignupOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (signupOtp || '').trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setSignupOtpError("Wrong OTP! Please enter the complete 6-digit numeric code.");
      toast.error("Please enter the 6-digit numeric OTP code! 🛑");
      return;
    }
    setIsOtpVerifying(true);
    try {
      const payload = {
        email: cleanEmail,
        identifier: cleanEmail,
        otp: cleanOtp,
        purpose: "SIGNUP"
      };
      let res;
      try {
        res = await apiPost("/api/auth/verify-registration-otp", payload);
      } catch (e1) {
        if (e1?.response?.data && e1?.response?.status !== 404 && e1?.response?.status !== 405) throw e1;
        res = await apiPost("/api/auth/verify-otp", payload);
      }
      setIsOtpVerified(true);
      setSignupOtpError("");
      toast.success(res?.data?.message || "OTP Verified Successfully! ✓ Proceed with Registration.");
    } catch (err) {
      console.error("Verify OTP Error:", err);
      const errorMsg = err?.response?.data?.detail || "Wrong OTP! Please enter the correct 6-digit code.";
      setSignupOtpError(errorMsg);
      toast.error(errorMsg);
      setIsOtpVerified(false);
    } finally {
      setIsOtpVerifying(false);
    }
  };

  // ---------------------------------------------------------
  // WARDEN GMAIL OTP DISPATCH HANDLER
  // ---------------------------------------------------------
  const handleSendWardenOtp = async (targetEmail, isResend = false) => {
    const cleanEmail = (targetEmail || adminId || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
      toast.error("Please enter a valid official Gmail / Email address for OTP verification! 🛑");
      return false;
    }
    setIsWardenOtpSending(true);
    setWardenOtpError("");
    try {
      const payload = {
        email: cleanEmail,
        identifier: cleanEmail,
        purpose: "SIGNUP"
      };
      let res;
      try {
        res = await apiPost("/api/auth/send-registration-otp", payload);
      } catch (e1) {
        if (e1?.response?.data && e1?.response?.status !== 404 && e1?.response?.status !== 405) throw e1;
        res = await apiPost("/api/auth/send-otp", payload);
      }
      setWardenOtpCountdown(60);
      setWardenOtp(["", "", "", "", "", ""]);
      setWardenOtpError("");
      toast.success(`6-digit OTP code sent to ${cleanEmail}. Please check your Gmail inbox / spam.`, { duration: 6000 });
      return true;
    } catch (err) {
      console.error("Warden Send OTP Error:", err);
      const detail = err?.response?.data?.detail || err?.message || "Could not dispatch OTP to Gmail. Please check email address.";
      setWardenOtpError(detail);
      toast.error(detail);
      return false;
    } finally {
      setIsWardenOtpSending(false);
    }
  };

  // Warden OTP Box Inputs: Auto-advance, backspace, and paste handlers
  const handleWardenOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const newOtp = [...wardenOtp];
      newOtp[index] = "";
      setWardenOtp(newOtp);
      return;
    }
    if (cleanVal.length > 1) {
      const digits = cleanVal.slice(0, 6).split('');
      const newOtp = [...wardenOtp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setWardenOtp(newOtp);
      setWardenOtpError("");
      const nextIdx = Math.min(digits.length, 5);
      wardenOtpInputRefs.current[nextIdx]?.focus();
      return;
    }
    const newOtp = [...wardenOtp];
    newOtp[index] = cleanVal;
    setWardenOtp(newOtp);
    setWardenOtpError("");
    if (index < 5) {
      wardenOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleWardenOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !wardenOtp[index] && index > 0) {
      wardenOtpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleWardenOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const digits = pasteData.split('');
      const newOtp = [...wardenOtp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setWardenOtp(newOtp);
      setWardenOtpError("");
      const nextIdx = Math.min(digits.length, 5);
      wardenOtpInputRefs.current[nextIdx]?.focus();
    }
  };

  // ---------------------------------------------------------
  // WARDEN VERIFY OTP & CREATE ACCOUNT
  // ---------------------------------------------------------
  const handleVerifyWardenOtpAndRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const fullOtpCode = wardenOtp.join('').trim();
    if (fullOtpCode.length !== 6 || !/^\d{6}$/.test(fullOtpCode)) {
      setWardenOtpError("Wrong OTP! Please enter the complete 6-digit numeric code received on your Gmail.");
      toast.error("Please enter the complete 6-digit OTP code! 🛑");
      return;
    }

    setIsWardenRegistering(true);
    setWardenOtpError("");

    const cleanEmail = adminId.trim().toLowerCase();
    const payload = {
      role: 'warden',
      full_name: fullName.trim(),
      password,
      gender: 'ALL',
      admin_id: cleanEmail,
      reg_no_email: cleanEmail,
      email: cleanEmail,
      master_key: masterKey.trim(),
      otp: fullOtpCode
    };

    try {
      let response = null;
      try {
        response = await apiPost("/api/auth/register", payload);
      } catch (e1) {
        if (e1?.response?.data && e1?.response?.status !== 404 && e1?.response?.status !== 405) throw e1;
        response = await apiPost("/api/auth/signup", payload);
      }

      setShowWardenOtpModal(false);

      if (response?.data?.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('token', response.data.access_token);
      }
      if (response?.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      toast.success("🎉 Warden Account Created & Verified Successfully!", {
        duration: 4000,
        style: { borderRadius: '12px', background: '#0f172a', color: '#fff' }
      });

      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (error) {
      console.error("Warden Register Error:", error);
      const detail = error?.response?.data?.detail || error?.message || "Invalid OTP code or registration failed.";
      setWardenOtpError(detail);
      toast.error("Registration Failed: " + detail);
    } finally {
      setIsWardenRegistering(false);
    }
  };

  // ---------------------------------------------------------
  // MAIN SIGNUP HANDLER (FORM SUBMIT)
  // ---------------------------------------------------------
  const handleSignup = async (e) => {
    e.preventDefault();

    // Basic validation based on role
    if (!fullName || !password) {
      toast.error("Please fill in Name and Password! 🛑");
      return;
    }

    if (role === 'student') {
      if (!regNo || !email) {
        toast.error("Student Registration No. & Email are required! 🛑");
        return;
      }
      if (!isOtpVerified) {
        toast.error("Please click 'Send OTP' and verify your 6-digit email OTP first! 🛑");
        return;
      }
    }

    if (role === 'warden') {
      if (!adminId || !masterKey) {
        toast.error("Warden Admin Gmail & Master Key are required! 🛑");
        return;
      }
      const cleanAdminEmail = adminId.trim().toLowerCase();
      if (!cleanAdminEmail.includes('@') || cleanAdminEmail.length < 5) {
        toast.error("Please enter a valid official Gmail / Email address for Warden registration! 🛑");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long! 🛑");
        return;
      }

      // Automatically dispatch 6-digit OTP to Warden's Gmail and open OTP verification modal
      const sent = await handleSendWardenOtp(cleanAdminEmail);
      if (sent) {
        setShowWardenOtpModal(true);
      }
      return;
    }

    setIsLoading(true);

    let payload = {
      role,
      full_name: fullName.trim(),
      password,
      gender: gender,
      reg_no_email: regNo || email
    };

    if (role === 'student') {
      payload.reg_no = regNo.trim();
      payload.branch = branch;
      payload.email = email.trim().toLowerCase();
      payload.session = session;
      payload.semester = session;
      payload.reg_no_email = regNo.trim();
      payload.otp = signupOtp.trim();
    }

    try {
      let response = null;
      try {
        response = await apiPost("/api/auth/register", payload);
      } catch (e1) {
        if (e1?.response?.data && e1?.response?.status !== 404 && e1?.response?.status !== 405) throw e1;
        response = await apiPost("/api/auth/signup", payload);
      }

      // On successful signup, store token & profile
      if (response?.data?.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('token', response.data.access_token);
      }
      if (response?.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Clear any prior user's allotment cache so new student starts fresh & locked
      localStorage.removeItem('gpbarh_student_allotment_approved');
      localStorage.removeItem('gpbarh_allotment_status');

      toast.success(response?.data?.message || "Account successfully created! 🎉", {
        duration: 3500,
        style: { borderRadius: '12px', background: '#0f172a', color: '#fff' }
      });
      
      setTimeout(() => {
        if (role === 'student') {
          navigate("/student-dashboard");
        } else {
          navigate("/");
        }
      }, 1000);

    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        toast.error("Signup Failed: " + error.response.data.detail);
      } else {
        toast.error("Signup failed. Please verify that the backend is running and OTP is valid.");
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
                {role === 'warden' 
                  ? 'Administrator & Warden Central Portal Registration' 
                  : 'Sign up to choose your hostel room & bed allocation'}
              </p>
            </div>

            {/* 🌟 FORM */}
            <form className="space-y-4" onSubmit={handleSignup}>
              
              {/* REGISTER AS DROPDOWN */}
              <div>
                <label className={labelClass}>Register As</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold cursor-pointer ${
                    isDarkMode ? 'bg-gray-800 border-gray-600 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  <option value="student">👨‍🎓 Student</option>
                  <option value="warden">🛡️ Warden / Admin</option>
                </select>
              </div>

              {/* 🌟 GENDER TOGGLE (MALE / FEMALE) - STRICTLY ONLY SHOWN FOR STUDENTS */}
              {role === 'student' && (
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
              )}

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
                  placeholder={role === 'warden' ? "e.g. DR. RAMESH CHANDRA SHARMA" : "e.g. AMIT KUMAR"}
                  className={inputClass}
                />
              </div>

              {/* STUDENT FIELDS */}
              {role === 'student' && (
                <>
                  {/* ROW 1: REGISTRATION NUMBER & ACADEMIC SESSION */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                  {/* ROW 2: BRANCH / DEPARTMENT (FULL-WIDTH FOR COMPLETE READABILITY) */}
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

                  {/* ROW 3: STUDENT EMAIL ADDRESS */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className={`text-[11px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Student Email Address
                      </label>
                      {isOtpVerified && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                          <span>✓</span> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        required
                        value={email}
                        disabled={isOtpVerified}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (isOtpVerified) setIsOtpVerified(false);
                        }}
                        placeholder="e.g. amitkumar.gpb.ai@gmail.com"
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        type="button"
                        id="btn-send-registration-otp"
                        onClick={handleSendSignupOtp}
                        disabled={isOtpSending || otpCountdown > 0 || isOtpVerified}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-1.5 shrink-0 ${
                          isOtpVerified
                            ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 cursor-not-allowed'
                            : otpCountdown > 0
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer active:scale-95'
                        }`}
                      >
                        {isOtpSending ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span>Sending...</span>
                          </>
                        ) : otpCountdown > 0 ? (
                          <span>Resend ({otpCountdown}s)</span>
                        ) : isOtpVerified ? (
                          <span>Verified ✓</span>
                        ) : (
                          <span>Send 6-Digit OTP 📩</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ROW 4: 6-DIGIT OTP VERIFICATION BOX (COMPACT & SLEEK) */}
                  <div className={`p-3 rounded-2xl border transition-all duration-300 space-y-2 ${
                    isOtpVerified
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-400/50 shadow-xs'
                      : otpSent
                      ? 'bg-blue-50/80 dark:bg-blue-950/35 border-blue-400/50 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/35 border-slate-200 dark:border-slate-700/60'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">
                        <span>{isOtpVerified ? '🛡️' : '🔑'}</span>
                        <span>Enter 6-Digit Verification Code</span>
                      </div>
                      {otpSent && otpCountdown > 0 && !isOtpVerified && (
                        <span className="font-mono text-blue-600 dark:text-blue-400 text-[11px] font-bold">
                          Resend in {otpCountdown}s
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          disabled={isOtpVerified}
                          value={signupOtp}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setSignupOtp(val);
                            if (signupOtpError) setSignupOtpError("");
                          }}
                          placeholder="• • • • • •"
                          className={`w-full py-2.5 px-3 rounded-xl border text-center font-mono font-black text-base tracking-[0.45em] outline-none transition-all ${
                            signupOtpError
                              ? 'bg-red-50/70 dark:bg-red-950/40 border-red-500 text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500/30 ring-2 ring-red-500/40 animate-shake'
                              : isOtpVerified
                              ? 'bg-emerald-100/40 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-200 cursor-not-allowed'
                              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500'
                          }`}
                        />
                      </div>

                      <button
                        type="button"
                        id="btn-verify-registration-otp"
                        onClick={handleVerifySignupOtp}
                        disabled={isOtpVerifying || isOtpVerified || signupOtp.length !== 6}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 shrink-0 ${
                          isOtpVerified
                            ? 'bg-emerald-600 text-white cursor-default'
                            : signupOtp.length === 6
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer active:scale-95'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isOtpVerifying ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span>Checking...</span>
                          </>
                        ) : isOtpVerified ? (
                          <span>Verified ✓</span>
                        ) : (
                          <span>Verify OTP</span>
                        )}
                      </button>
                    </div>

                    {signupOtpError && (
                      <div className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-shake pt-1">
                        <span>⚠️</span>
                        <span>{signupOtpError}</span>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      {isOtpVerified ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <span>✓</span> Verified for <strong>{email}</strong>. Ready to register!
                        </span>
                      ) : otpSent ? (
                        <span>
                          6-digit OTP sent to <strong>{email || 'your email'}</strong>. Please check your inbox / spam folder.
                        </span>
                      ) : (
                        <span>
                          Click <strong>"Send 6-Digit OTP 📩"</strong> to receive your code.
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* WARDEN FIELDS */}
              {role === 'warden' && (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={labelClass}>Official Admin Gmail / Email ID</label>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                        ✉️ Gmail OTP Verification
                      </span>
                    </div>
                    <input
                      type="email"
                      required
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="e.g. warden.gpbarh@gmail.com"
                      className={inputClass}
                    />
                    <p className={`text-[11px] mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      A 6-digit verification code will be dispatched to this Gmail before account creation.
                    </p>
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

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                id="btn-signup-submit"
                disabled={isLoading || isWardenOtpSending || (role === 'student' && !isOtpVerified)}
                className={`w-full font-extrabold py-3.5 rounded-xl transition-all shadow-lg text-sm tracking-wider uppercase mt-4 flex items-center justify-center gap-2 ${
                  isLoading || isWardenOtpSending || (role === 'student' && !isOtpVerified)
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-600'
                    : role === 'warden'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-blue-500/40 transform hover:-translate-y-0.5 cursor-pointer'
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
                ) : role === 'warden' ? (
                  isWardenOtpSending ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Sending Gmail OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>🛡️ Create Account &amp; Verify Gmail OTP</span>
                    </>
                  )
                ) : role === 'student' && !isOtpVerified ? (
                  <>
                    <span>🔒 Enter &amp; Verify 6-Digit OTP to Register</span>
                  </>
                ) : (
                  <>
                    <span>🚀 Register &amp; Continue to Onboarding</span>
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

          {/* 🌟 ULTRA-PREMIUM DYNAMIC RIGHT HERO BANNER (WARDEN vs BOYS vs GIRLS ARCHITECTURE) 🌟 */}
          <div className={`hidden md:flex w-[44%] p-8 flex-col justify-between relative overflow-hidden transition-all duration-500 ${
            role === 'warden'
              ? (isDarkMode ? 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-blue-950/90 border-l border-indigo-500/30' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 border-l border-indigo-200')
              : gender === 'FEMALE' 
              ? (isDarkMode ? 'bg-gradient-to-br from-pink-950/90 via-slate-900 to-purple-950/90 border-l border-pink-500/30' : 'bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 border-l border-pink-200')
              : (isDarkMode ? 'bg-gradient-to-br from-blue-950/90 via-slate-900 to-indigo-950/90 border-l border-blue-500/30' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 border-l border-blue-200')
          }`}>
            {/* Ambient Background Glow Spheres */}
            <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none ${
              role === 'warden' ? 'bg-indigo-500' : gender === 'FEMALE' ? 'bg-pink-500' : 'bg-blue-500'
            }`}></div>
            <div className={`absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
              role === 'warden' ? 'bg-blue-500' : gender === 'FEMALE' ? 'bg-purple-500' : 'bg-indigo-500'
            }`}></div>

            {/* HEADER BADGE & HOSTEL TITLE */}
            <div className="text-center w-full relative z-10">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-3 shadow-md border transition-all duration-300 ${
                role === 'warden'
                  ? (isDarkMode ? 'bg-indigo-900/80 text-indigo-200 border-indigo-400/50 shadow-indigo-500/20' : 'bg-indigo-100 text-indigo-900 border-indigo-300 shadow-indigo-100')
                  : gender === 'FEMALE'
                  ? (isDarkMode ? 'bg-pink-900/80 text-pink-200 border-pink-400/50 shadow-pink-500/20' : 'bg-pink-100 text-pink-900 border-pink-300 shadow-pink-100')
                  : (isDarkMode ? 'bg-blue-900/80 text-blue-200 border-blue-400/50 shadow-blue-500/20' : 'bg-blue-100 text-blue-900 border-blue-300 shadow-blue-100')
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full animate-ping inline-block ${role === 'warden' ? 'bg-indigo-400' : gender === 'FEMALE' ? 'bg-pink-400' : 'bg-blue-400'}`}></span>
                <span>{role === 'warden' ? '🛡️ CHIEF WARDEN CENTRAL AUTHORITY' : gender === 'FEMALE' ? '🌸 SECURE RESIDENTIAL COMPLEX' : '🏛️ DUAL-WING RESIDENTIAL CAMPUS'}</span>
              </div>

              <h3 className={`text-xl font-black uppercase tracking-wider mb-1.5 drop-shadow-sm ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {role === 'warden' ? 'GP Barh Hostel Complex' : gender === 'FEMALE' ? 'Savitribai Phule Girls Hostel' : 'GP Barh Boys Hostel'}
              </h3>
              <p className={`text-xs font-black tracking-wide ${
                role === 'warden'
                  ? (isDarkMode ? 'text-indigo-300' : 'text-indigo-700')
                  : gender === 'FEMALE' 
                  ? (isDarkMode ? 'text-pink-300' : 'text-pink-700') 
                  : (isDarkMode ? 'text-blue-300' : 'text-blue-700')
              }`}>
                {role === 'warden'
                  ? 'Unified Central Command • Boys & Girls Wings'
                  : gender === 'FEMALE' 
                  ? 'Dedicated Student Residential Complex' 
                  : 'Birsa Munda & Dr. Rajendra Prasad Residential Blocks'}
              </p>
            </div>

            {/* INTERACTIVE ARCHITECTURAL SHOWCASE CARD */}
            <div className={`my-5 w-full space-y-2.5 backdrop-blur-md p-4 rounded-2xl shadow-xl border relative z-10 transition-all duration-300 ${
              isDarkMode 
                ? 'bg-slate-900/90 border-slate-700/80 shadow-black/40' 
                : 'bg-white/95 border-slate-200/80 shadow-slate-200/50'
            }`}>
              {role === 'warden' ? (
                <>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-indigo-50/70 border-indigo-100 hover:bg-indigo-50'
                  }`}>
                    <span className="text-xl">🏢</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Boys Hostel Wings (BH1 &amp; BH2)</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Birsa Munda &amp; Dr. Rajendra Prasad Blocks</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-pink-50/70 border-pink-100 hover:bg-pink-50'
                  }`}>
                    <span className="text-xl">🌸</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Girls Hostel Wing (GH)</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Savitribai Phule Block &amp; Security Desk</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-blue-50/70 border-blue-100 hover:bg-blue-50'
                  }`}>
                    <span className="text-xl">🎛️</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Warden Administrative Cockpit</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Digital Allocations, Approvals &amp; Gate Control</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-emerald-50/70 border-emerald-100 hover:bg-emerald-50'
                  }`}>
                    <span className="text-xl">🍽️</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Integrated Mess Operations</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Daily Meal Roaster &amp; Student Accounts Ledger</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}>
                    <span className="text-xl">📹</span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>24x7 HD CCTV Surveillance</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Comprehensive Multi-Tier Campus Protection</p>
                    </div>
                  </div>
                </>
              ) : gender === 'MALE' ? (
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
                {role === 'warden' ? 'Government Polytechnic Barh • Hostel Administration' : 'Government Polytechnic Barh Hostel & Mess'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ================= WARDEN OTP VERIFICATION MODAL ================= */}
      {showWardenOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`relative w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl border animate-scale-in transition-all ${
            isDarkMode 
              ? 'bg-[#131722] border-slate-700/80 text-white shadow-black/80' 
              : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
          }`}>
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => {
                if (!isWardenRegistering) {
                  setShowWardenOtpModal(false);
                  setWardenOtpError("");
                }
              }}
              disabled={isWardenRegistering}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Modal Header Icon */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3 text-3xl">
                🛡️
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight mb-1 text-slate-900 dark:text-white">
                Warden Identity Verification
              </h3>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Enter the 6-digit verification code sent to your official Gmail
              </p>
              
              {/* Highlighted Email Pill */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold">
                <span>✉️</span>
                <span>{adminId.trim().toLowerCase()}</span>
              </div>
            </div>

            {/* 6-DIGIT OTP BOXES */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Enter 6-Digit OTP
                </label>
                {wardenOtpCountdown > 0 && (
                  <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    ⏱️ Expires in {wardenOtpCountdown}s
                  </span>
                )}
              </div>

              <div 
                className={`flex justify-between gap-2 sm:gap-2.5 ${wardenOtpError ? 'animate-shake' : ''}`}
                onPaste={handleWardenOtpPaste}
              >
                {wardenOtp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (wardenOtpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    disabled={isWardenRegistering}
                    onChange={(e) => handleWardenOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleWardenOtpKeyDown(idx, e)}
                    className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-mono font-black rounded-xl border outline-none transition-all ${
                      wardenOtpError
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-950/40 text-red-600 dark:text-red-400 ring-2 ring-red-500/30'
                        : digit
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/30'
                        : isDarkMode
                        ? 'border-slate-700 bg-slate-800/80 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'
                        : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'
                    }`}
                  />
                ))}
              </div>

              {/* Error Message */}
              {wardenOtpError && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-shake">
                  <span>⚠️</span>
                  <span>{wardenOtpError}</span>
                </div>
              )}
            </div>

            {/* Resend Action */}
            <div className="text-center mb-6">
              {wardenOtpCountdown > 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Didn't receive the email? Resend code in <strong className="font-mono text-indigo-600 dark:text-indigo-400">{wardenOtpCountdown}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendWardenOtp(adminId, true)}
                  disabled={isWardenOtpSending || isWardenRegistering}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline cursor-pointer disabled:opacity-50"
                >
                  {isWardenOtpSending ? "Sending fresh OTP to Gmail..." : "Didn't get code? Resend OTP to Gmail 📩"}
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                type="button"
                id="btn-warden-verify-and-register"
                onClick={handleVerifyWardenOtpAndRegister}
                disabled={isWardenRegistering || wardenOtp.join('').length !== 6}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
                  isWardenRegistering || wardenOtp.join('').length !== 6
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-600'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer active:scale-98'
                }`}
              >
                {isWardenRegistering ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Verifying OTP &amp; Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Verify &amp; Create Warden Account ✓</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowWardenOtpModal(false);
                  setWardenOtpError("");
                }}
                disabled={isWardenRegistering}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                ← Back to Edit Details
              </button>
            </div>

            {/* Official Security Footer */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                Official Government Polytechnic Barh Security Protocol • Single-Use 5-Min Expiry
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Signup;