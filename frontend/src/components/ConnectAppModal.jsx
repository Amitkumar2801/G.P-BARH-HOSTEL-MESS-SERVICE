// src/components/ConnectAppModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function ConnectAppModal({ isOpen, onClose, currentUser }) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSession, setVerifiedSession] = useState(null);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'gpbarh-connect-scanner-target';

  // 🔔 Success Chime Sound Synthesis
  const playLinkChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.30); // D6

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.65);
      }
    } catch {
      // Audio context error
    }
  };

  // Start Rear Camera
  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);
    setVerifiedSession(null);

    try {
      await new Promise(r => setTimeout(r, 200));
      if (!document.getElementById(scannerContainerId)) return;

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      const config = { fps: 20, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

      try {
        await html5QrCode.start(
          { facingMode: { exact: 'environment' } },
          config,
          (decodedText) => handleQrDetected(decodedText),
          () => {}
        );
      } catch {
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => handleQrDetected(decodedText),
          () => {}
        );
      }
    } catch (err) {
      console.warn("Camera start warning:", err);
      setCameraError('To link your computer session to GP Barh, allow access to your camera to scan the QR code.');
      setIsScanning(false);
    }
  };

  // Stop Camera safely
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setVerifiedSession(null);
      setIsVerifying(false);
      setCameraError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Handle scanned text
  const handleQrDetected = async (rawText) => {
    if (isVerifying) return;
    setIsVerifying(true);
    await stopCamera();

    await verifySessionToken(rawText);
  };

  // Process Verification with Backend
  const verifySessionToken = async (rawText) => {
    let cleanSessionId = rawText.trim();

    if (cleanSessionId.startsWith('gpbarh_login:')) {
      cleanSessionId = cleanSessionId.split('gpbarh_login:', 2)[1].trim();
    } else if (cleanSessionId.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanSessionId);
        if (parsed.session_id) cleanSessionId = parsed.session_id.trim();
      } catch {
        // raw
      }
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/auth/qr/verify', {
        session_id: cleanSessionId,
        user_id: currentUser?.id,
        reg_no_email: currentUser?.reg_no_email || currentUser?.reg_no
      });

      if (response.data && response.data.status === 'AUTHENTICATED') {
        playLinkChime();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }

        toast.success('Web Session Linked Successfully! 🎉', {
          duration: 4000,
          style: { borderRadius: '12px', background: '#064e3b', color: '#a7f3d0' }
        });

        setVerifiedSession({
          session_id: cleanSessionId,
          user_name: response.data.user_name || currentUser?.full_name || 'Authenticated User',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Invalid or expired QR code. Please refresh the web login screen.';
      toast.error(detail, {
        duration: 4000,
        style: { borderRadius: '12px', background: '#7f1d1d', color: '#fecaca' }
      });
      setCameraError(detail);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white animate-in fade-in duration-200 select-none">
      {/* Scoped CSS for html5-qrcode video element */}
      <style>{`
        #${scannerContainerId} {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          inset: 0 !important;
        }
        #${scannerContainerId} video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #${scannerContainerId} img, #${scannerContainerId} svg {
          display: none !important;
        }
      `}</style>

      {/* 🌟 1. WHATSAPP STYLE TOP HEADER BAR */}
      <header className="bg-white text-slate-900 px-4 py-3.5 flex items-center gap-4 shadow-sm z-30 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 -ml-1 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-800 text-xl font-bold bg-transparent border-none cursor-pointer transition-colors active:scale-90"
          title="Back"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          Scan QR code
        </h1>
      </header>

      {/* 🌟 2. WHATSAPP STYLE SUB-BANNER INSTRUCTION */}
      <div className="bg-[#f0f2f5] dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs sm:text-sm text-center py-2.5 px-4 font-medium border-b border-slate-200 dark:border-slate-700 z-30 shadow-xs shrink-0">
        Open GP Barh website on your computer or other devices.
      </div>

      {/* 🌟 3. MAIN FULLSCREEN CAMERA VIEWPORT WITH TRANSPARENT CUTOUT */}
      <main className="relative flex-1 w-full overflow-hidden bg-black flex items-center justify-center">
        {/* RAW FULLSCREEN CAMERA STREAM */}
        <div id={scannerContainerId} className="absolute inset-0 w-full h-full"></div>

        {/* VERIFIED SUCCESS SCREEN */}
        {verifiedSession && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center text-4xl mx-auto border border-emerald-500/40 shadow-xl mb-4">
              ✓
            </div>
            <h2 className="text-xl font-black text-white">Login Successful!</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xs">
              Authenticated on computer as <strong className="text-emerald-400 font-bold">{verifiedSession.user_name}</strong>
            </p>
            <div className="my-5 p-3.5 bg-slate-900/90 rounded-2xl border border-slate-700 text-xs text-slate-300 flex items-center justify-between w-full max-w-[260px]">
              <span>Verified At:</span>
              <span className="font-mono text-emerald-400 font-bold">{verifiedSession.time}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full max-w-[260px] py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg transition-all cursor-pointer border-none active:scale-95"
            >
              Done
            </button>
          </div>
        )}

        {/* SCANNER VIEWFINDER OVERLAY (EXACT WHATSAPP STYLE CUTOUT WINDOW) */}
        {!verifiedSession && !cameraError && (
          <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none w-full h-full">
            {/* Dark Mask with Center Cutout */}
            <div
              className="relative w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] rounded-3xl border-2 border-white/70 overflow-hidden"
              style={{
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)'
              }}
            >
              {/* Animated Laser Beam */}
              {isScanning && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-scan"></div>
              )}
            </div>
          </div>
        )}

        {/* VERIFYING OVERLAY */}
        {isVerifying && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-30">
            <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-emerald-300 tracking-wide">Connecting to Web Portal...</span>
          </div>
        )}

        {/* 🌟 4. WHATSAPP STYLE CAMERA PERMISSION / ERROR DIALOG */}
        {cameraError && !isVerifying && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5 z-40 animate-in fade-in duration-200">
            <div className="w-full max-w-[320px] bg-white text-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl mb-3 shadow-inner">
                📷
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Allow Camera Access
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {cameraError}
              </p>
              <div className="w-full flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer bg-transparent"
                >
                  Not now
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer border-none active:scale-95"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 🌟 5. WHATSAPP STYLE FOOTER BAR */}
      <footer className="bg-black/90 px-4 py-3.5 text-center text-xs text-slate-400 border-t border-slate-800/80 z-30 shrink-0">
        <span className="text-slate-400">
          Scanning as: <strong className="text-white font-bold">{currentUser?.full_name || currentUser?.name || 'Active User'}</strong> • <span className="text-emerald-400 font-bold">GP BARH</span>
        </span>
      </footer>
    </div>
  );
}

