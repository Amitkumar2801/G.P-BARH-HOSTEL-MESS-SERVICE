// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiPost } from '../utils/api';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  KeyRound,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
  CheckCircle2,
  User
} from 'lucide-react';
import PublicNoticeModal from '../components/PublicNoticeModal';
import '../App.css';

// 🌟 ASSETS IMPORT (Fixed as per your exact file paths)
import logo from '../assets/logo.png.png';
import myPic from '../assets/profile.jpg.jpg';

function Login() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [publicNoticeModal, setPublicNoticeModal] = useState({ isOpen: false, category: 'RULES' });

  // LIVE METRICS & SYSTEM HEALTH STATES
  const [visitorCount, setVisitorCount] = useState(15442);
  const [systemStatus, setSystemStatus] = useState({
    status: 'online',
    db_connected: true,
    label: 'Hostel Core Services Active'
  });

  // FORM STATES
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [shakeForm, setShakeForm] = useState(false);

  // QR LOGIN STATES & LOGIC
  const [qrSessionId, setQrSessionId] = useState("");
  const [qrPayload, setQrPayload] = useState("");
  const [qrLoading, setQrLoading] = useState(true);
  const [qrExpired, setQrExpired] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [isQrAuthenticated, setIsQrAuthenticated] = useState(false);
  const pollingRef = useRef(null);

  // FORGOT PASSWORD MODAL STATES
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Verify Identity, 2: 6-Digit OTP, 3: Set Password
  const [forgotInput, setForgotInput] = useState("");
  const [forgotTargetEmail, setForgotTargetEmail] = useState("");
  const [otpBoxes, setOtpBoxes] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotOtpError, setForgotOtpError] = useState("");

  const navigate = useNavigate();

  // 🔔 Futuristic Login Success Chime
  const playLoginSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
        osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.24); // G5
        osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.36); // C6

        osc2.frequency.setValueAtTime(261.63, now);
        osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.36);

        gainNode.gain.setValueAtTime(0.35, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.7);
        osc2.stop(now + 0.7);
      }
    } catch (e) {
      console.debug("Audio play error", e);
    }
  };

  // Generate / Refresh QR Session
  const fetchQrSession = async (showToast = false) => {
    try {
      setQrLoading(true);
      setQrExpired(false);
      setIsQrAuthenticated(false);
      const res = await axios.get("http://127.0.0.1:8000/api/auth/qr/generate");
      if (res.data && res.data.session_id) {
        setQrSessionId(res.data.session_id);
        setQrPayload(res.data.qr_payload || res.data.session_id);
        setCountdown(res.data.expires_in || 120);
        if (showToast) {
          toast.success("QR Session refreshed! Ready to scan.", {
            style: { borderRadius: '10px', background: '#333', color: '#fff' }
          });
        }
      }
    } catch (error) {
      console.warn("Failed to fetch QR session from server:", error);
      const fallbackId = 'gpbarh-' + Math.random().toString(36).substring(2, 10);
      setQrSessionId(fallbackId);
      setQrPayload(`gpbarh_login:${fallbackId}`);
      setCountdown(120);
    } finally {
      setQrLoading(false);
    }
  };

  // Initialize QR Session on mount
  useEffect(() => {
    fetchQrSession();
  }, []);

  // Live Persistent Visitor Counter & Dynamic System Health Status
  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      const isVisited = sessionStorage.getItem('gp_visited');
      const endpoints = [
        "http://127.0.0.1:8000",
        ""
      ];

      // 1. If fresh session, register visitor hit (atomic +1)
      if (!isVisited) {
        let hitRecorded = false;
        for (const base of endpoints) {
          try {
            const res = await axios.post(`${base}/api/metrics/visitor-hit`, {}, { timeout: 4000 });
            if (res.data && typeof res.data.visitor_count === 'number') {
              if (isMounted) {
                setVisitorCount(res.data.visitor_count);
                sessionStorage.setItem('gp_visited', 'true');
              }
              hitRecorded = true;
              break;
            }
          } catch (e) {
            // try fallback endpoint
          }
        }
        if (hitRecorded) {
          // Also fetch system status
          for (const base of endpoints) {
            try {
              const res = await axios.get(`${base}/api/metrics/status`, { timeout: 3500 });
              if (res.data && isMounted) {
                setSystemStatus({
                  status: res.data.status || 'online',
                  db_connected: res.data.db_connected !== false,
                  label: res.data.label || 'Hostel Core Services Active'
                });
                if (typeof res.data.visitor_count === 'number') {
                  setVisitorCount(res.data.visitor_count);
                }
                break;
              }
            } catch (e) {}
          }
          return;
        }
      }

      // 2. If already visited in this session, only query status and latest count
      for (const base of endpoints) {
        try {
          const res = await axios.get(`${base}/api/metrics/status`, { timeout: 3500 });
          if (res.data && isMounted) {
            setSystemStatus({
              status: res.data.status || 'online',
              db_connected: res.data.db_connected !== false,
              label: res.data.label || 'Hostel Core Services Active'
            });
            if (typeof res.data.visitor_count === 'number') {
              setVisitorCount(res.data.visitor_count);
            }
            break;
          }
        } catch (e) {
          // try fallback
        }
      }
    };

    fetchMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (qrLoading || isQrAuthenticated || qrExpired) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setQrExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrLoading, isQrAuthenticated, qrExpired, qrSessionId]);

  // Polling effect for QR Login
  useEffect(() => {
    if (!qrSessionId || qrExpired || isQrAuthenticated) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    const pollSession = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/auth/qr/poll/${qrSessionId}`);
        if (res.data && res.data.status === "AUTHENTICATED" && res.data.user) {
          setIsQrAuthenticated(true);
          if (pollingRef.current) clearInterval(pollingRef.current);

          playLoginSuccessChime();

          const loggedInUser = res.data.user;
          const token = res.data.token || `token_${Date.now()}`;
          localStorage.setItem('user', JSON.stringify(loggedInUser));
          localStorage.setItem('auth_token', token);

          toast.success(`Signed in via GP Barh Mobile Pass! 🚀\nWelcome back, ${loggedInUser.full_name}`, {
            duration: 4000,
            style: { borderRadius: '12px', background: '#0f172a', color: '#38bdf8', border: '1px solid #38bdf8' }
          });

          const role = (loggedInUser.role || '').toLowerCase();
          setTimeout(() => {
            if (role === 'warden') {
              navigate("/warden-dashboard", { state: { userRole: role, userName: loggedInUser.full_name, user: loggedInUser } });
            } else if (role === 'student') {
              navigate("/student-dashboard", { state: { userRole: role, userName: loggedInUser.full_name, user: loggedInUser } });
            } else {
              navigate("/dashboard", { state: { userRole: role, userName: loggedInUser.full_name, user: loggedInUser } });
            }
          }, 700);
        } else if (res.data && res.data.status === "EXPIRED") {
          setQrExpired(true);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch (err) {
        // network polling pass
      }
    };

    pollingRef.current = setInterval(pollSession, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [qrSessionId, qrExpired, isQrAuthenticated, navigate]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Resend cooldown timer for OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  // Auto-focus first OTP box when entering stage 2
  useEffect(() => {
    if (showForgotModal && forgotStep === 2) {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [showForgotModal, forgotStep]);

  // Individual 6-Digit OTP Box Handlers (Auto-focus & Auto-advance)
  const handleOtpBoxChange = (idx, val) => {
    if (forgotOtpError) setForgotOtpError("");
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const next = [...otpBoxes];
      next[idx] = '';
      setOtpBoxes(next);
      return;
    }
    // Auto-distribute if user pastes multi-character code
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      const next = [...otpBoxes];
      chars.forEach((c, i) => {
        if (i < 6) next[i] = c;
      });
      setOtpBoxes(next);
      const focusTarget = Math.min(chars.length, 5);
      otpRefs.current[focusTarget]?.focus();
      return;
    }

    const next = [...otpBoxes];
    next[idx] = clean;
    setOtpBoxes(next);

    // Auto-advance to next input box
    if (idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpBoxKeyDown = (idx, e) => {
    if (forgotOtpError) setForgotOtpError("");
    if (e.key === 'Backspace' && !otpBoxes[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const evaluateForgotPassStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-slate-200 dark:bg-slate-700', width: '0%', textColor: 'text-slate-400' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>_~`+\-=\[\]\\;/]/.test(pwd)) score++;

    if (score === 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', width: '33%', textColor: 'text-rose-600 dark:text-rose-400' };
    if (score === 2) return { score: 2, label: 'Moderate', color: 'bg-amber-500', width: '66%', textColor: 'text-amber-600 dark:text-amber-400' };
    if (score === 3) return { score: 3, label: 'Strong', color: 'bg-emerald-500', width: '100%', textColor: 'text-emerald-600 dark:text-emerald-400' };
    return { score: 0, label: 'Too Short', color: 'bg-slate-300 dark:bg-slate-700', width: '15%', textColor: 'text-slate-400' };
  };

  // FORGOT PASSWORD HANDLERS
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanIdent = (forgotInput || "").trim();
    if (!cleanIdent) {
      toast.error("Please enter your Registration ID or Registered Email!");
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await apiPost("/api/auth/send-otp", {
        identifier: cleanIdent,
        email: cleanIdent,
        purpose: "FORGOT_PASSWORD"
      });
      setForgotTargetEmail(res.data?.email || cleanIdent);
      setForgotStep(2);
      setResendCooldown(60);
      setOtpBoxes(['', '', '', '', '', '']);
      setForgotOtpError("");
      toast.success("6-digit OTP sent to your email. Please check your inbox / spam folder.", {
        duration: 6000,
        style: { borderRadius: '12px', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }
      });
    } catch (err) {
      const detail = err.response?.data?.detail || "Could not dispatch OTP. Please check your registration ID/email.";
      toast.error(detail, {
        duration: 5000,
        style: { borderRadius: '12px', background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' }
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpBoxes.join('').trim();
    if (fullOtp.length !== 6) {
      setForgotOtpError("Wrong OTP! Please enter all 6 digits.");
      toast.error("Please enter the complete 6-digit verification code!");
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await apiPost("/api/auth/verify-otp", {
        identifier: forgotInput.trim(),
        email: forgotInput.trim(),
        otp: fullOtp,
        purpose: "FORGOT_PASSWORD"
      });
      setForgotOtpError("");
      setForgotStep(3);
      toast.success(res.data?.message || "Identity confirmed. Please set your new password.", {
        duration: 4000,
        style: { borderRadius: '12px', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }
      });
    } catch (err) {
      const errorMsg = "Wrong OTP! Please enter the correct 6-digit code.";
      setForgotOtpError(errorMsg);
      toast.error(errorMsg, {
        duration: 4000,
        style: { borderRadius: '12px', background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' }
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    const cleanNew = (newPassword || "").trim();
    const cleanConfirm = (confirmPassword || "").trim();
    const fullOtp = otpBoxes.join('').trim();

    if (!cleanNew || !cleanConfirm) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (cleanNew.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (!/[0-9]/.test(cleanNew)) {
      toast.error("New password must include at least one numeric digit (0-9).");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_~`+\-=\[\]\\;/]/.test(cleanNew)) {
      toast.error("New password must include at least one special character (!@#$%^&*).");
      return;
    }
    if (cleanNew !== cleanConfirm) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await apiPost("/api/auth/reset-password", {
        identifier: forgotInput.trim(),
        email: forgotInput.trim(),
        otp: fullOtp,
        new_password: cleanNew
      });
      toast.success(res.data?.message || "Password successfully reset! You can now log in with your new credentials.", {
        duration: 5000,
        style: { borderRadius: '12px', background: '#0f172a', color: '#f8fafc', border: '1px solid #10b981' }
      });
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotInput("");
      setForgotTargetEmail("");
      setOtpBoxes(['', '', '', '', '', '']);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to reset password. Please verify your OTP code.";
      toast.error(detail, {
        duration: 4000,
        style: { borderRadius: '12px', background: '#7f1d1d', color: '#fef2f2', border: '1px solid #ef4444' }
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  // API CALL: HANDLE LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    const inputClean = userId.trim();
    if (!inputClean || !password) {
      const msg = "Please enter both Email/Registration ID and Password.";
      setLoginError(msg);
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 500);
      toast.error(msg, {
        duration: 4000,
        style: { borderRadius: '10px', background: '#7f1d1d', color: '#fff', border: '1px solid #ef4444' }
      });
      return;
    }

    setIsLoading(true);
    try {
      let response = null;
      try {
        response = await apiPost("/api/auth/login", {
          reg_no_email: inputClean,
          password: password
        });
      } catch (e1) {
        if (e1?.response?.data) throw e1;
        response = await apiPost("/login", {
          reg_no_email: inputClean,
          password: password
        });
      }

      const loggedInUser = response?.data?.user;
      const accessToken = response?.data?.access_token || response?.data?.token;

      if (loggedInUser) {
        setLoginError("");
        toast.success(`Authentication Successful!\nWelcome, ${loggedInUser.full_name}. Redirecting...`, {
          duration: 3000,
          style: { borderRadius: '10px', background: '#14532d', color: '#fff', border: '1px solid #22c55e' }
        });

        localStorage.setItem('user', JSON.stringify(loggedInUser));
        if (accessToken) {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('token', accessToken);
        }
        // Clear previous user's allotment cache keys so the new session is strictly isolated
        localStorage.removeItem('gpbarh_student_allotment_approved');
        localStorage.removeItem('gpbarh_allotment_status');

        const role = (loggedInUser.role || '').toLowerCase();
        setTimeout(() => {
          if (role === 'warden') {
            navigate("/warden-dashboard", { state: { userRole: role, userName: loggedInUser.full_name, user: loggedInUser } });
          } else if (role === 'student') {
            navigate("/student-dashboard", { state: { userRole: role, userName: loggedInUser.full_name, user: loggedInUser } });
          } else {
            navigate("/dashboard", { state: { userRole: role, userName: loggedInUser.full_name, user: loggedInUser } });
          }
        }, 300);
        return;
      }

      throw lastErr || new Error("Incorrect email / registration ID or password.");
    } catch (error) {
      let errorDetail = "Incorrect email / registration ID or password.";
      if (error.response && error.response.data && error.response.data.detail) {
        errorDetail = error.response.data.detail;
      }

      setLoginError(errorDetail);
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 500);

      toast.error(errorDetail, {
        duration: 4000,
        id: 'login-auth-error',
        style: {
          borderRadius: '10px',
          background: '#0f172a',
          color: '#f87171',
          border: '1px solid #ef4444',
          fontWeight: '600',
          fontSize: '13px'
        }
      });
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
            <button
              onClick={() => setPublicNoticeModal({ isOpen: true, category: 'RULES' })}
              className="hover:text-white text-gray-300 transition-colors py-1 cursor-pointer bg-transparent border-none text-[10px] md:text-[11px] lg:text-xs font-semibold"
            >
              Rules
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => setPublicNoticeModal({ isOpen: true, category: 'MESS_MENU' })}
              className="hover:text-white text-gray-300 transition-colors py-1 cursor-pointer bg-transparent border-none text-[10px] md:text-[11px] lg:text-xs font-semibold"
            >
              Mess Menu
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => setPublicNoticeModal({ isOpen: true, category: 'CONTACT_WARDEN' })}
              className="hover:text-white text-gray-300 transition-colors py-1 cursor-pointer bg-transparent border-none text-[10px] md:text-[11px] lg:text-xs font-semibold"
            >
              Contact Warden
            </button>
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
          <div className="flex items-center gap-2">
          </div>
        </div>
      </header>

      {/* ==============      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-grow bg-campus flex items-center justify-center p-4 md:p-8 lg:p-10 relative">
        <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-black/75' : 'bg-black/40'}`}></div>

        {/* 🌟 SPLIT MODERN CARD (RESPONSIVE: SINGLE CARD ON MOBILE/APK, SPLIT WITH QR ON DESKTOP) 🌟 */}
        <div className={`relative z-10 rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col md:flex-row w-full max-w-[460px] md:max-w-[980px] min-h-[500px] md:min-h-[580px] overflow-hidden border transition-all duration-300 ${isDarkMode
            ? 'bg-[#111827] border-gray-800 text-white'
            : 'bg-white border-gray-100 text-gray-900 shadow-2xl'
          }`}>

          {/* LEFT SIDE: CLEAN WHITE SIGN IN FORM */}
          <div className="w-full md:w-[54%] p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative bg-white dark:bg-[#111827]">
            <div>
              {/* BRAND HEADER */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 p-1.5 flex items-center justify-center shadow-sm shrink-0">
                  <img src={logo} alt="GP Barh Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                    Government Polytechnic, Barh
                  </h1>
                  <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mt-0.5">
                    Hostel & Mess Management
                  </p>
                </div>
              </div>

              {/* WELCOME BACK TITLE */}
              <div className="mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enter your details to access your dashboard.
                </p>
              </div>

              {/* ⚠️ PROFESSIONAL ALERT BANNER */}
              {loginError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-3 shadow-xs animate-shake transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-xs text-red-800 dark:text-red-200 truncate sm:whitespace-normal">
                      {loginError}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLoginError("")}
                    className="text-red-400 hover:text-red-600 dark:hover:text-red-200 text-sm font-bold p-0.5 cursor-pointer bg-transparent border-none leading-none shrink-0"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* LOGIN FORM */}
              <form className={`space-y-4 ${shakeForm ? 'animate-shake' : ''}`} onSubmit={handleLogin}>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address / Registration ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => {
                        setUserId(e.target.value);
                        if (loginError) setLoginError("");
                      }}
                      placeholder="name@example.com or Reg No."
                      className={`w-full px-4 py-3 rounded-xl border ${loginError ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500 ring-2 ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/30 focus:border-blue-500'} bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (loginError) setLoginError("");
                      }}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 rounded-xl border ${loginError ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500 ring-2 ring-red-500/20' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500/30 focus:border-blue-500'} bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm p-1 cursor-pointer bg-transparent border-none"
                      title={showPassword ? "Hide" : "Show"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(true);
                        setForgotStep(1);
                        setForgotInput("");
                        setForgotTargetEmail("");
                        setOtpBoxes(['', '', '', '', '', '']);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* SIGN IN BUTTON - PRIMARY ACTION */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    id="btn-login-submit"
                    className="w-full group py-3.5 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 cursor-pointer border-0 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
                  >
                    <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                    {!isLoading && (
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* FOOTER REGISTER ACTION - HUMAN-CRAFTED TOP 1% UI/UX */}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="relative mb-3 flex items-center justify-center">
                <div className="w-full border-t border-slate-200/80 dark:border-slate-800"></div>
                <span className="absolute px-3 bg-white dark:bg-[#111827] text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                  New to GP Barh Hostel?
                </span>
              </div>

              <Link
                to="/signup"
                id="btn-goto-signup"
                className="group w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 hover:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/90 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shadow-xs">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      Register as New Student
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                      Apply for hostel room & mess allocation
                    </div>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-slate-200/70 dark:bg-slate-700/60 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 dark:text-slate-300 flex items-center justify-center transition-all duration-200 shrink-0 ml-2">
                  <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: MIDNIGHT NAVY QUICK ACCESS QR CARD (DESKTOP ONLY) */}
          <div className="hidden md:flex md:w-[46%] bg-gradient-to-br from-[#0b132b] via-[#0e1c3d] to-[#080e1e] p-8 sm:p-10 lg:p-12 flex-col justify-between items-center text-center relative border-t md:border-t-0 md:border-l border-slate-800">
            <div className="w-full flex flex-col items-center">
              <h3 className="text-2xl font-bold text-white tracking-tight mb-1.5">
                Quick Access
              </h3>
              <p className="text-xs text-slate-300/80 mb-5 font-normal">
                Scan to login instantly from mobile.
              </p>

              {/* SLEEK DARK QR CARD CONTAINER (BIGGER & PROMINENT) */}
              <div className="w-full max-w-[310px] bg-[#142347]/90 border border-[#233868] rounded-3xl p-5 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                {/* Inner Crisp White QR Square */}
                <div className="bg-white p-4 rounded-2xl shadow-xl relative flex items-center justify-center w-[236px] h-[236px]">
                  {/* 1. LOADING STATE */}
                  {qrLoading && (
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-gray-500 tracking-wider">Generating QR...</span>
                    </div>
                  )}

                  {/* 2. AUTHENTICATED SUCCESS STATE */}
                  {!qrLoading && isQrAuthenticated && (
                    <div className="flex flex-col items-center justify-center gap-2 animate-in zoom-in-90 duration-300">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-4xl font-bold shadow-inner animate-bounce">
                        ✓
                      </div>
                      <span className="text-sm font-black text-emerald-600 tracking-wide">
                        Authenticated!
                      </span>
                    </div>
                  )}

                  {/* 3. ACTIVE LIVE QR CODE (BIGGER 205px) */}
                  {!qrLoading && !isQrAuthenticated && (
                    <div className="relative flex items-center justify-center">
                      <QRCodeSVG
                        value={qrPayload || "gpbarh_login_ready"}
                        size={205}
                        level="M"
                        includeMargin={false}
                      />

                      {/* SCANNING LASER BEAM */}
                      {!qrExpired && (
                        <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_4px_rgba(59,130,246,0.95)] animate-scan pointer-events-none"></div>
                      )}

                      {/* 4. EXPIRED OVERLAY */}
                      {qrExpired && (
                        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center gap-2 text-white p-3 animate-in fade-in duration-200">
                          <span className="text-3xl">⏳</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            QR Code Expired
                          </span>
                          <button
                            type="button"
                            onClick={() => fetchQrSession(true)}
                            className="mt-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer border-none flex items-center gap-1"
                          >
                            <span>Refresh Code</span>
                            <span>🔄</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitle directly under QR Card */}
              <p className="text-xs text-slate-300/90 mt-3.5 font-medium">
                Scan with your mobile...
              </p>
            </div>

            {/* Bottom helper text matching user request */}
            <div className="w-full pt-4 mt-3 border-t border-slate-800/80 flex flex-col items-center gap-2">
              <p className="text-xs text-slate-300 leading-snug max-w-[280px]">
                Open the official <strong className="text-white">GP Barh Mobile App</strong> on your phone and point the camera at this QR code.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${qrExpired ? 'bg-red-500' : countdown <= 20 ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
                <span>{qrExpired ? 'Expired' : isQrAuthenticated ? 'Connected' : `Session: ${formatCountdown(countdown)}`}</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => fetchQrSession(true)}
                  disabled={qrLoading}
                  className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer bg-transparent border-none p-0 text-[10px] font-bold"
                >
                  Refresh 🔄
                </button>
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
                  <button
                    type="button"
                    onClick={() => setPublicNoticeModal({ isOpen: true, category: 'NOTICE' })}
                    className="w-full text-left hover:text-yellow-300 text-gray-300 font-medium transition-colors flex items-center gap-1.5 py-0.5 rounded hover:bg-white/5 cursor-pointer bg-transparent border-none"
                  >
                    <span className="text-yellow-500 font-bold">›</span> Hostel &amp; Mess Notice Board
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setPublicNoticeModal({ isOpen: true, category: 'RULES' })}
                    className="w-full text-left hover:text-yellow-300 text-gray-300 font-medium transition-colors flex items-center gap-1.5 py-0.5 rounded hover:bg-white/5 cursor-pointer bg-transparent border-none"
                  >
                    <span className="text-yellow-500 font-bold">›</span> Student Grievance Redressal
                  </button>
                </li>
                <li>
                  <a
                    href="https://www.antiragging.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-yellow-300 text-gray-300 font-medium transition-colors flex items-center gap-1.5 py-0.5 rounded hover:bg-white/5"
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

              <div className={`border p-1.5 rounded-lg flex items-center gap-2 text-[9.5px] font-bold transition-all ${
                systemStatus.status === 'online'
                  ? 'bg-black/50 border-emerald-500/30 text-emerald-400'
                  : 'bg-black/50 border-amber-500/30 text-amber-400'
              }`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    systemStatus.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    systemStatus.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></span>
                </span>
                <span>{systemStatus.label || "Hostel Core Services Active"}</span>
              </div>

              <div>
                <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-widest mb-1">Live Visitors</p>
                <div className="flex space-x-1">
                  {String(visitorCount || 15442).padStart(6, '0').split('').map((num, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-b from-black to-zinc-900 border border-yellow-500/40 text-yellow-400 font-mono px-1.5 py-0.5 rounded shadow-inner text-[11px] font-black text-center min-w-[18px]"
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
                <img src={myPic} alt="Amit Kumar" className="w-full h-full object-cover rounded-sm" />
              </div>

              <h3 className="text-xl font-black text-[#800000] uppercase tracking-wide mb-3">Amit Kumar</h3>

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

      {/* ================= TOP-TIER ENTERPRISE RESET PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => {
            if (!isForgotLoading) setShowForgotModal(false);
          }}
        >
          <div
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-[480px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="p-6 pb-5 border-b border-slate-100 dark:border-slate-800 relative">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                disabled={isForgotLoading}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-xl transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <KeyRound className="w-5 h-5 text-slate-100" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Reset Account Password
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Official Student Portal Recovery • GP Barh
                  </p>
                </div>
              </div>

              {/* FLUID MULTI-STAGE PROGRESS BAR */}
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className={`flex items-center gap-1.5 font-bold ${forgotStep >= 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    forgotStep >= 1 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}>1</span>
                  <span>Identity</span>
                </div>
                <div className={`flex-1 h-0.5 mx-2.5 rounded-full transition-all ${forgotStep >= 2 ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                <div className={`flex items-center gap-1.5 font-bold ${forgotStep >= 2 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    forgotStep >= 2 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}>2</span>
                  <span>Verify OTP</span>
                </div>
                <div className={`flex-1 h-0.5 mx-2.5 rounded-full transition-all ${forgotStep >= 3 ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                <div className={`flex items-center gap-1.5 font-bold ${forgotStep >= 3 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                    forgotStep >= 3 ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}>3</span>
                  <span>New Password</span>
                </div>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 sm:p-7">
              {/* STAGE 1: ENTER REGISTRATION ID OR EMAIL */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Registration ID or Registered Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={forgotInput}
                        onChange={(e) => setForgotInput(e.target.value)}
                        placeholder="e.g. 1554424049 or amitkumar.gpb.ai@gmail.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-slate-900 dark:focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 transition-all placeholder-slate-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotLoading || !forgotInput.trim()}
                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isForgotLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Verifying &amp; Dispatching OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STAGE 2: 6 SEPARATE INDIVIDUAL DIGIT BOXES */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 rounded-2xl text-xs text-blue-800 dark:text-blue-300">
                    <div className="font-semibold flex items-center gap-1.5 mb-0.5">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Code Dispatched via Gmail SMTP</span>
                    </div>
                    <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80">
                      Check your Gmail inbox / spam folder for <strong>{forgotTargetEmail || forgotInput}</strong>.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 text-center">
                      Enter 6-Digit Verification Code
                    </label>

                    {/* 6 Individual Digit Inputs with Auto-Advance */}
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                      {otpBoxes.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpBoxChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpBoxKeyDown(index, e)}
                          className={`w-11 sm:w-12 h-14 text-center font-mono text-2xl font-black rounded-xl border outline-none transition-all shadow-xs ${
                            forgotOtpError
                              ? 'border-red-500 bg-red-50/70 dark:bg-red-950/40 text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500/30 ring-2 ring-red-500/40 animate-shake'
                              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Wrong OTP Alert Message */}
                    {forgotOtpError && (
                      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 animate-shake">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                        <span>{forgotOtpError}</span>
                      </div>
                    )}
                  </div>

                  {/* Resend Cooldown Counter */}
                  <div className="text-center text-xs">
                    {resendCooldown > 0 ? (
                      <span className="text-slate-400 font-medium">
                        Resend available in <strong className="font-mono text-slate-700 dark:text-slate-300">{resendCooldown}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isForgotLoading}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Didn't receive code? Resend OTP</span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      disabled={isForgotLoading}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isForgotLoading || otpBoxes.join('').length !== 6}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isForgotLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STAGE 3: SET NEW PASSWORD & CONFIRM */}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 chars, 1 num, 1 sym..."
                        className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-slate-900 dark:focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 transition-all placeholder-slate-400"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                        title={showForgotNewPass ? "Hide password" : "Show password"}
                      >
                        {showForgotNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Interactive Password Strength Indicator */}
                  {newPassword && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Password Strength</span>
                        <span className={`font-bold uppercase tracking-wider ${evaluateForgotPassStrength(newPassword).textColor}`}>
                          {evaluateForgotPassStrength(newPassword).label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2.5">
                        <div
                          className={`h-full transition-all duration-300 ${evaluateForgotPassStrength(newPassword).color}`}
                          style={{ width: evaluateForgotPassStrength(newPassword).width }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px]">
                        <div className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                          <span>{newPassword.length >= 8 ? '✓' : '•'}</span>
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[0-9]/.test(newPassword) ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                          <span>{/[0-9]/.test(newPassword) ? '✓' : '•'}</span>
                          <span>1+ number</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>_~`+\-=\[\]\\;/]/.test(newPassword) ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                          <span>{/[!@#$%^&*(),.?":{}|<>_~`+\-=\[\]\\;/]/.test(newPassword) ? '✓' : '•'}</span>
                          <span>1+ special</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password..."
                        className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm font-medium outline-none focus:ring-2 transition-all placeholder-slate-400 ${
                          confirmPassword && newPassword === confirmPassword
                            ? 'border-emerald-500 bg-emerald-50/20 text-slate-900 dark:text-white focus:ring-emerald-500/20'
                            : confirmPassword && newPassword !== confirmPassword
                            ? 'border-rose-400 bg-rose-50/20 text-slate-900 dark:text-white focus:ring-rose-500/20'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-slate-900 dark:focus:border-slate-300 focus:ring-slate-900/10 dark:focus:ring-white/10'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 cursor-pointer"
                        title={showForgotConfirmPass ? "Hide password" : "Show password"}
                      >
                        {showForgotConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {confirmPassword && (
                      <div className="mt-2 text-xs flex items-center gap-1.5">
                        {newPassword === confirmPassword ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Passwords match
                          </span>
                        ) : (
                          <span className="text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isForgotLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Saving Password...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Update Password &amp; Login</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📢 PUBLIC NOTICE & OFFICIAL DOCUMENT VIEWER MODAL */}
      <PublicNoticeModal
        isOpen={publicNoticeModal.isOpen}
        onClose={() => setPublicNoticeModal(prev => ({ ...prev, isOpen: false }))}
        initialCategory={publicNoticeModal.category}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default Login;