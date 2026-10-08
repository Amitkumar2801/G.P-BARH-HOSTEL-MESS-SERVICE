// src/components/ConnectAppModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Flashlight, 
  FlashlightOff, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Camera, 
  Sparkles,
  Lock,
  QrCode,
  Laptop
} from 'lucide-react';
import { apiPost } from '../utils/api';

export default function ConnectAppModal({ isOpen, onClose, currentUser }) {
  // 'idle' | 'scanning' | 'detected' | 'verifying' | 'success' | 'error'
  const [scanState, setScanState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const [hasCameraPermissionError, setHasCameraPermissionError] = useState(false);
  const [verifiedSession, setVerifiedSession] = useState(null);
  const [autoCloseSeconds, setAutoCloseSeconds] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);

  const html5QrCodeRef = useRef(null);
  const isVerifyingRef = useRef(false);
  const autoCloseTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const scannerContainerId = 'gpbarh-connect-scanner-viewport';

  // 🔊 1. Web Audio Engine (Instant zero-latency feedback without external files)
  const getAudioContext = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioContextRef.current && AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      return audioContextRef.current;
    } catch {
      return null;
    }
  }, []);

  // Crisp Barcode/QR Laser Beep (Instant scan lock)
  const playScanBeep = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(1900, now + 0.05);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio error ignored
    }
  }, [soundEnabled, getAudioContext]);

  // Harmonic Victory Chime (Ascending 4-chord arpeggio: C5 -> E5 -> G5 -> C6)
  const playSuccessChime = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.20 }, // C5
        { freq: 659.25, time: 0.09, dur: 0.20 }, // E5
        { freq: 783.99, time: 0.18, dur: 0.25 }, // G5
        { freq: 1046.50, time: 0.27, dur: 0.50 } // C6
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.001, now + time);
        gain.gain.exponentialRampToValueAtTime(0.32, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    } catch {
      // Audio error ignored
    }
  }, [soundEnabled, getAudioContext]);

  // Gentle Warning/Error Buzz
  const playErrorBuzz = useCallback(() => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.20);
    } catch {
      // Audio error ignored
    }
  }, [soundEnabled, getAudioContext]);

  // Haptic feedback
  const triggerHaptic = (pattern) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Haptics not supported
    }
  };

  // Toggle Torch on Mobile Devices
  const toggleTorch = async () => {
    try {
      const videoEl = document.querySelector(`#${scannerContainerId} video`);
      if (videoEl?.srcObject) {
        const track = videoEl.srcObject.getVideoTracks()[0];
        if (track?.applyConstraints) {
          const nextState = !torchOn;
          await track.applyConstraints({
            advanced: [{ torch: nextState }]
          });
          setTorchOn(nextState);
          triggerHaptic(25);
        }
      }
    } catch (err) {
      console.warn('Torch toggle error:', err);
      toast.error('Flashlight not available on this camera');
    }
  };

  // Check hardware torch capabilities
  const inspectTorchSupport = () => {
    try {
      const videoEl = document.querySelector(`#${scannerContainerId} video`);
      if (videoEl?.srcObject) {
        const track = videoEl.srcObject.getVideoTracks()[0];
        if (track?.getCapabilities) {
          const caps = track.getCapabilities();
          if (caps.torch) {
            setHasTorchSupport(true);
            return;
          }
        }
      }
    } catch {
      // Ignore
    }
    setHasTorchSupport(false);
  };

  // Safe Camera Stop
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Camera stop warning:', e);
      }
      html5QrCodeRef.current = null;
    }
    setTorchOn(false);
  };

  // Start Camera with generous responsive viewfinder
  const startCamera = async () => {
    setErrorMessage(null);
    setHasCameraPermissionError(false);
    setScanState('scanning');
    setVerifiedSession(null);
    isVerifyingRef.current = false;

    try {
      await new Promise(r => setTimeout(r, 220));
      if (!document.getElementById(scannerContainerId)) return;

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      // Responsive QR box: ~300px box for comfortable laptop screen scanning
      const qrboxConfig = (viewWidth, viewHeight) => {
        const minEdge = Math.min(viewWidth, viewHeight);
        const dimension = Math.floor(Math.min(minEdge * 0.78, 310));
        return { width: Math.max(dimension, 250), height: Math.max(dimension, 250) };
      };

      const cameraConfig = {
        fps: 24,
        qrbox: qrboxConfig,
        aspectRatio: 1.0,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      };

      try {
        await html5QrCode.start(
          { facingMode: { exact: 'environment' } },
          cameraConfig,
          (decodedText) => handleQrDetected(decodedText),
          () => {}
        );
      } catch {
        // Fallback to any rear or available camera
        await html5QrCode.start(
          { facingMode: 'environment' },
          cameraConfig,
          (decodedText) => handleQrDetected(decodedText),
          () => {}
        );
      }

      // Check for torch support after camera starts
      setTimeout(inspectTorchSupport, 600);
    } catch (err) {
      console.warn("Camera start exception:", err);
      setHasCameraPermissionError(true);
      setScanState('error');
      setErrorMessage('Camera access is needed to scan QR code. Please allow camera permissions in your mobile browser.');
    }
  };

  // Handle QR detected
  const handleQrDetected = async (rawText) => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    // 1. Instant sound beep + haptic lock
    playScanBeep();
    triggerHaptic([35, 45, 35]);

    // 2. Trigger scan target animation
    setScanState('detected');

    // 3. Briefly show lock-in animation before verifying
    await new Promise(r => setTimeout(r, 380));
    setScanState('verifying');

    await stopCamera();
    await verifySessionToken(rawText);
  };

  // Process verification with backend
  const verifySessionToken = async (rawText) => {
    let cleanSessionId = (rawText || '').trim();

    if (cleanSessionId.startsWith('gpbarh_login:')) {
      cleanSessionId = cleanSessionId.split('gpbarh_login:', 2)[1].trim();
    } else if (cleanSessionId.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanSessionId);
        if (parsed.session_id) cleanSessionId = parsed.session_id.trim();
      } catch {
        // Raw string fallback
      }
    }

    try {
      const payload = {
        session_id: cleanSessionId,
        user_id: currentUser?.id,
        reg_no_email: currentUser?.reg_no_email || currentUser?.reg_no || currentUser?.email
      };

      // Call robust candidate endpoint resolver (works on Vercel production & localhost)
      const response = await apiPost('/api/auth/qr/verify', payload);

      if (response?.data?.status === 'AUTHENTICATED') {
        playSuccessChime();
        triggerHaptic([60, 60, 100]);

        try {
          confetti({
            particleCount: 85,
            spread: 80,
            origin: { y: 0.58 },
            colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#38bdf8']
          });
        } catch {
          // Confetti ignore
        }

        const nowFormatted = new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });

        setVerifiedSession({
          session_id: cleanSessionId,
          user_name: response.data.user_name || currentUser?.full_name || currentUser?.name || 'Verified Student',
          time: nowFormatted
        });

        setScanState('success');
        setAutoCloseSeconds(4);
      } else {
        throw new Error('Verification did not return an authenticated status.');
      }
    } catch (err) {
      playErrorBuzz();
      triggerHaptic([100, 50, 100]);

      const detail = err.response?.data?.detail || 'Invalid or expired QR code. Please refresh the login screen on your computer.';
      setErrorMessage(detail);
      setScanState('error');
    } finally {
      isVerifyingRef.current = false;
    }
  };

  // Countdown timer on success
  useEffect(() => {
    if (scanState === 'success') {
      autoCloseTimerRef.current = setInterval(() => {
        setAutoCloseSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(autoCloseTimerRef.current);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
      }
    };
  }, [scanState, onClose]);

  // Main lifecycle
  useEffect(() => {
    if (isOpen) {
      void startCamera();
    } else {
      void stopCamera();
      setScanState('idle');
      setVerifiedSession(null);
      setErrorMessage(null);
      setHasCameraPermissionError(false);
      isVerifyingRef.current = false;
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
      }
    }

    return () => {
      void stopCamera();
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getViewfinderFrameClass = () => {
    if (scanState === 'detected' || scanState === 'verifying') {
      return 'border-2 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.7)] scale-[0.98]';
    }
    if (scanState === 'error') {
      return 'border-2 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.4)]';
    }
    return 'border-2 border-white/20';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050811] text-white select-none overflow-hidden font-sans">
      {/* 🔮 CUSTOM ULTRA-POLISHED CSS STYLES & SCANNER ANIMATIONS */}
      <style>{`
        #${scannerContainerId} {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          inset: 0 !important;
          background: #050811 !important;
        }
        #${scannerContainerId} video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #${scannerContainerId} img, #${scannerContainerId} svg, #${scannerContainerId} button {
          display: none !important;
        }

        @keyframes laserSweep {
          0% {
            top: 5%;
            opacity: 0.85;
          }
          50% {
            top: 93%;
            opacity: 1;
          }
          100% {
            top: 5%;
            opacity: 0.85;
          }
        }

        .animate-laser {
          animation: laserSweep 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes targetPulse {
          0% {
            transform: scale(0.97);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1.02);
            box-shadow: 0 0 0 18px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.97);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .animate-target-pulse {
          animation: targetPulse 1.4s ease-out infinite;
        }

        @keyframes scanShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .animate-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.03) 100%);
          background-size: 200% 100%;
          animation: scanShimmer 2s infinite;
        }
      `}</style>

      {/* 🌟 1. TOP APP BAR (Native Mobile Glass Header) */}
      <header className="relative z-30 flex items-center justify-between px-4 py-3.5 bg-[#050811]/85 backdrop-blur-xl border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-slate-100" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Link Desktop Device
              </h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              GP Barh Hostel & Mess Service
            </p>
          </div>
        </div>

        {/* Header Right Actions: Torch & Sound Toggles */}
        <div className="flex items-center gap-2">
          {hasTorchSupport && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                torchOn 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]' 
                  : 'bg-white/10 text-slate-300 border-white/10 hover:bg-white/15'
              }`}
              title={torchOn ? "Turn Torch Off" : "Turn Torch On"}
            >
              {torchOn ? <Flashlight className="w-4 h-4 fill-current" /> : <FlashlightOff className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
              soundEnabled
                ? 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
            title={soundEnabled ? "Mute Sounds" : "Unmute Sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 🌟 2. INSTRUCTION SUB-HEADER PILL */}
      <div className="relative z-20 px-4 py-2 bg-gradient-to-b from-[#050811]/90 to-transparent flex justify-center shrink-0">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-lg text-xs text-slate-300 backdrop-blur-md">
          <Laptop className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-medium text-[11.5px]">
            Align the QR code from your computer screen inside the frame
          </span>
        </div>
      </div>

      {/* 🌟 3. MAIN CAMERA VIEWPORT & INTERACTIVE HUD */}
      <main className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
        {/* Raw Fullscreen Camera Stream Target */}
        <div id={scannerContainerId} className="absolute inset-0 w-full h-full"></div>

        {/* 🌟 A. SCANNING VIEWPORT OVERLAY (GENEROUS RESPONSIVE CUTOUT) */}
        {scanState !== 'success' && !hasCameraPermissionError && (
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none w-full h-full">
            {/* Viewfinder Cutout Box: Generous 300px on mobile screens */}
            <div
              className={`relative w-[82vw] h-[82vw] max-w-[310px] max-h-[310px] min-w-[260px] min-h-[260px] rounded-3xl transition-all duration-300 ${getViewfinderFrameClass()}`}
              style={{
                boxShadow: '0 0 0 9999px rgba(5, 8, 17, 0.70)'
              }}
            >
              {/* 4 Precision L-Corner Brackets */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-2xl -mt-[2px] -ml-[2px] transition-all"></div>
              <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-2xl -mt-[2px] -mr-[2px] transition-all"></div>
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-2xl -mb-[2px] -ml-[2px] transition-all"></div>
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-2xl -mb-[2px] -mr-[2px] transition-all"></div>

              {/* Center Crosshair Tick */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                <div className="w-6 h-0.5 bg-emerald-400"></div>
                <div className="h-6 w-0.5 bg-emerald-400 -ml-3"></div>
              </div>

              {/* Scanning Active: High-Tech Laser Beam with Soft Gradient Glow */}
              {scanState === 'scanning' && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_16px_#10b981] animate-laser">
                  <div className="absolute -top-1.5 inset-x-0 h-4 bg-emerald-400/20 blur-xs"></div>
                </div>
              )}

              {/* State: 'detected' -> Instant Lock-in Target Shockwave Animation */}
              {scanState === 'detected' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-emerald-400 bg-emerald-500/20 animate-target-pulse flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-emerald-300 animate-spin" />
                  </div>
                </div>
              )}

              {/* State: 'verifying' -> High-Tech Rotating Security Circle */}
              {scanState === 'verifying' && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 rounded-3xl">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-3 border-emerald-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-300 tracking-wide">
                    Verifying Session...
                  </span>
                </div>
              )}
            </div>

            {/* Status Pill beneath Viewfinder */}
            <div className="mt-5 text-center">
              {scanState === 'scanning' && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-slate-300 shadow-md">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scanning active • Point at computer</span>
                </div>
              )}

              {scanState === 'detected' && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500 text-xs font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                  <span>QR Code Locked • Authenticating...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🌟 B. SUCCESS CARD OVERLAY (SMOOTH FLIP & LOGIN TRANSITION) */}
        {scanState === 'success' && verifiedSession && (
          <div className="absolute inset-0 bg-[#050811]/95 backdrop-blur-lg flex flex-col items-center justify-center p-6 text-center z-40 animate-in zoom-in-95 duration-300">
            {/* Animated Glowing Success Badge */}
            <div className="relative mb-5">
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-22 h-22 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/30 border border-emerald-300/40">
                <CheckCircle2 className="w-12 h-12 text-white stroke-[2.5]" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              Linked Successfully!
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
              Your active student account is now authenticated and logged in on the computer screen.
            </p>

            {/* Session Information Card */}
            <div className="my-6 w-full max-w-[320px] bg-slate-900/90 rounded-2xl border border-slate-700/80 p-4 text-left shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-xs">
                    {(verifiedSession.user_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {verifiedSession.user_name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {currentUser?.reg_no || currentUser?.reg_no_email || 'Student Account'}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Web Link
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Connected Device:</span>
                  <span className="font-semibold text-slate-200">Desktop Web Portal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Verified Time:</span>
                  <span className="font-mono text-emerald-400 font-bold">{verifiedSession.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">Security Protocol:</span>
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    256-bit Encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* Done Action Button with Countdown */}
            <div className="w-full max-w-[320px] space-y-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/40 transition-all cursor-pointer border-none active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Done</span>
                <span className="text-xs font-normal text-emerald-100 bg-white/10 px-2 py-0.5 rounded-full">
                  Closing in {autoCloseSeconds}s
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 🌟 C. ERROR HUD (NON-INTRUSIVE BOTTOM FLOATING CARD) */}
        {scanState === 'error' && errorMessage && !hasCameraPermissionError && (
          <div className="absolute bottom-6 inset-x-4 z-40 flex justify-center animate-in slide-in-from-bottom duration-300 pointer-events-auto">
            <div className="w-full max-w-[340px] bg-slate-900/95 border border-rose-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Scan Verification Failed
              </h3>
              <p className="text-xs text-slate-300 mt-1 mb-4 leading-relaxed">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer border-none flex items-center justify-center gap-2 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tap to Scan Again</span>
              </button>
            </div>
          </div>
        )}

        {/* 🌟 D. CAMERA PERMISSION REQUIRED BOTTOM SHEET */}
        {hasCameraPermissionError && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-5 z-40 animate-in fade-in duration-200">
            <div className="w-full max-w-[330px] bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-700/80 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-2xl mb-4 shadow-inner">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">
                Camera Access Needed
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Please allow camera access in your mobile browser settings to scan the QR code and link your computer session.
              </p>

              <div className="w-full flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer border-none active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 🌟 4. FOOTER IDENTITY BADGE (Authentic Native App HUD) */}
      <footer className="relative z-30 bg-[#050811]/90 backdrop-blur-md px-4 py-3 border-t border-white/10 shrink-0">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              {(currentUser?.full_name || currentUser?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="text-[11px] text-slate-400 leading-tight">
                Scanning as
              </div>
              <div className="text-xs font-bold text-white tracking-tight truncate max-w-[170px]">
                {currentUser?.full_name || currentUser?.name || 'Student Account'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[10px] text-emerald-400 font-semibold">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Official GP Barh</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
