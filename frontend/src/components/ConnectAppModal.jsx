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

      const config = { fps: 20, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 };

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
      setCameraError('Camera access not detected or permission denied. You can enter the QR Session ID manually.');
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
    if (!isOpen) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Scoped CSS for html5-qrcode video element to fix mobile responsive scaling */}
      <style>{`
        #${scannerContainerId} {
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
        }
        #${scannerContainerId} video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1rem !important;
        }
        #${scannerContainerId} img, #${scannerContainerId} svg {
          display: none !important;
        }
      `}</style>

      {/* 🌟 3. PERFECTLY CENTERED PHONE REAR CAMERA SCANNER MODAL */}
      <div className="w-full max-w-[390px] bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-700 shadow-2xl space-y-3.5 text-white relative max-h-[94vh] overflow-y-auto">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-lg shrink-0">
              📱
            </div>
            <div className="text-left">
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">Scan Web QR</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Instant login on computer</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border-none"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* 1. SUCCESS VERIFIED STATE */}
        {verifiedSession ? (
          <div className="w-full text-center py-4 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center text-3xl mx-auto border border-blue-500/40 shadow-lg shadow-blue-500/10">
              ✓
            </div>
            <div>
              <h4 className="text-lg font-black text-white">Login Successful!</h4>
              <p className="text-xs text-slate-300 mt-1">
                Connected as <strong className="text-blue-400 font-bold">{verifiedSession.user_name}</strong>
              </p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-xs text-slate-300 flex items-center justify-between max-w-[280px] mx-auto">
              <span>Time:</span>
              <span className="font-mono text-blue-400 font-bold">{verifiedSession.time}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer border-none active:scale-[0.99]"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 🌟 2. SLEEK CYAN/BLUE SCANNER BOX */}
            <div className="relative w-full aspect-square max-h-[290px] bg-black rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-700/80 mx-auto">
              
              {/* HTML5-QRCODE TARGET VIEW */}
              <div id={scannerContainerId} className="absolute inset-0 w-full h-full flex items-center justify-center"></div>

              {/* SCANNING LASER & CORNERS (SLEEK CYAN & ROYAL BLUE THEME) */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4 z-10">
                  <div className="w-48 h-48 sm:w-52 sm:h-52 border border-cyan-400/40 rounded-2xl relative shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-cyan-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-cyan-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-cyan-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-cyan-400 rounded-br-lg"></div>
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] absolute scanner-laser-beam"></div>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 mt-3 bg-black/85 px-3 py-1 rounded-full uppercase tracking-wider border border-cyan-500/40">
                    ⚡ Align QR inside frame
                  </span>
                </div>
              )}

              {/* IDLE CENTERED PLACEHOLDER (CONCISE & SHORT) */}
              {!isScanning && (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-2 z-0">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center text-2xl shadow-inner">
                    📷
                  </div>
                  <h3 className="text-sm font-black text-white">Scan QR Code</h3>
                  <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                    Point camera at the QR code on your computer screen.
                  </p>
                </div>
              )}

              {/* VERIFYING OVERLAY */}
              {isVerifying && (
                <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 z-20">
                  <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-cyan-300 tracking-wide">Signing in...</span>
                </div>
              )}

              {/* CAMERA ERROR NOTIFICATION */}
              {cameraError && !isScanning && !isVerifying && (
                <div className="absolute inset-0 bg-slate-950/95 p-4 flex flex-col items-center justify-center text-center space-y-2 z-20">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-xs text-rose-300 font-bold max-w-xs">{cameraError}</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer border-none shadow"
                  >
                    Retry Camera
                  </button>
                </div>
              )}
            </div>

            {/* 🌟 3. ROYAL BLUE / INDIGO ACTION BUTTON */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={isScanning ? stopCamera : startCamera}
                disabled={isVerifying}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 ${
                  !isScanning
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow-slate-900/30'
                }`}
              >
                <span>{isScanning ? '✕' : '📸'}</span>
                <span>
                  {isScanning
                    ? 'Close Camera'
                    : 'Open Camera & Scan'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 🌟 USER IDENTITY FOOTER (CENTERED WITH LEFT/RIGHT BREATHING ROOM) */}
        <div className="w-full pt-3 border-t border-slate-800 flex items-center justify-between px-3 max-w-[340px] mx-auto text-xs text-slate-400">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0"></span>
            <span className="text-[11px] text-slate-400">User:</span>
            <span className="font-bold text-white text-xs truncate max-w-[140px]">
              {currentUser?.full_name || currentUser?.name || 'Active User'}
            </span>
          </div>
          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-800 text-blue-300 shrink-0 border border-blue-500/20">
            GP BARH
          </span>
        </div>
      </div>
    </div>
  );
}
