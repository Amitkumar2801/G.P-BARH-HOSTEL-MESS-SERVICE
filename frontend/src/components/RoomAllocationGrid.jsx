// src/components/RoomAllocationGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

/* ------------------------------------------------------------------ */
/*  Blueprint data — EXACT hand-drawn room configurations             */
/* ------------------------------------------------------------------ */
const BOYS_FLOORS = {
  Birsa: [
    { floorTitle: '3RD FLOOR', floorNum: 3, topRooms: ['301', '302', '303', '304', '305', '306'], midRooms: ['312', '311', '310'], botRooms: ['307', '308', '309'] },
    { floorTitle: '2ND FLOOR', floorNum: 2, topRooms: ['201', '202', '203', '204', '205', '206'], midRooms: ['212', '211', '210'], botRooms: ['207', '208', '209'] },
    { floorTitle: '1ST FLOOR', floorNum: 1, topRooms: ['101', '102', '103', '104'], midRooms: ['109', '108', '107'], botRooms: ['110', '106', '105'] },
  ],
  Rajendra: [
    { floorTitle: '3RD FLOOR', floorNum: 3, topRooms: ['301', '302', '303', '304', '305', '306'], midRooms: ['310', '311', '312'], botRooms: ['309', '308', '307'] },
    { floorTitle: '2ND FLOOR', floorNum: 2, topRooms: ['201', '202', '203', '204', '205', '206'], midRooms: ['210', '211', '212'], botRooms: ['209', '208', '207'] },
    { floorTitle: '1ST FLOOR', floorNum: 1, topRooms: ['101', '102', '103', '104'], midRooms: ['107', '108', '109'], botRooms: ['106', '105'] },
  ],
};

/* ------------------------------------------------------------------ */
/*  Interactive 3D Room Interior Furniture SVGs                       */
/* ------------------------------------------------------------------ */
const ChairSVG = () => (
  <svg className="w-7 sm:w-8 md:w-9 h-auto drop-shadow-xs transition-transform duration-200" viewBox="0 0 100 120">
    <rect x="28" y="8" width="44" height="50" rx="8" fill="#d97a48" />
    <rect x="34" y="14" width="32" height="38" rx="6" fill="#b4552b" />
    <rect x="18" y="58" width="64" height="16" rx="4" fill="#d97a48" />
    <rect x="18" y="58" width="64" height="6" rx="3" fill="#e79a6c" />
    <rect x="22" y="74" width="8" height="34" fill="#7d3717" />
    <rect x="70" y="74" width="8" height="34" fill="#7d3717" />
    <rect x="30" y="74" width="6" height="30" fill="#93401b" />
    <rect x="64" y="74" width="6" height="30" fill="#93401b" />
  </svg>
);

const TableSVG = () => (
  <svg className="w-12 sm:w-14 md:w-16 h-auto drop-shadow-xs transition-transform duration-200" viewBox="0 0 140 100">
    <rect x="10" y="30" width="120" height="16" rx="3" fill="#e9aa66" />
    <rect x="10" y="30" width="120" height="6" rx="3" fill="#f3c48c" />
    <rect x="30" y="46" width="80" height="10" fill="#c9803f" />
    <circle cx="70" cy="51" r="2.4" fill="#5c3512" />
    <rect x="18" y="46" width="14" height="46" fill="#8f571f" />
    <rect x="108" y="46" width="14" height="46" fill="#8f571f" />
  </svg>
);

const BedSVG = () => (
  <svg className="w-9 sm:w-11 md:w-12 h-auto drop-shadow-xs transition-transform duration-200" viewBox="0 0 140 240">
    <rect x="6" y="0" width="128" height="16" rx="4" fill="#8f571f" />
    <rect x="6" y="10" width="128" height="224" rx="10" fill="#276358" />
    <rect x="16" y="20" width="108" height="204" rx="8" fill="#63b3a7" />
    <rect x="16" y="20" width="108" height="34" rx="8" fill="#eef1ea" />
    <rect x="16" y="196" width="108" height="28" rx="6" fill="#3f8f83" />
  </svg>
);

const LockerSVG = () => (
  <svg className="w-8 sm:w-9.5 md:w-10 h-auto drop-shadow-xs transition-transform duration-200" viewBox="0 0 110 170">
    <rect x="4" y="4" width="102" height="160" rx="4" fill="#8a8f92" filter="url(#cementTexture)" />
    <rect x="4" y="4" width="102" height="160" rx="4" fill="none" stroke="#5d6265" strokeWidth="3" />
    <line x1="55" y1="8" x2="55" y2="160" stroke="#5d6265" strokeWidth="2.5" />
    <rect x="46" y="80" width="6" height="18" rx="2" fill="#d8d8d8" />
    <rect x="58" y="80" width="6" height="18" rx="2" fill="#d8d8d8" />
    <circle cx="61" cy="58" r="7" fill="#e7b94a" />
    <rect x="57.5" y="49" width="7" height="11" rx="3" fill="none" stroke="#e7b94a" strokeWidth="2.5" />
    <rect x="4" y="158" width="102" height="8" fill="#5d6265" />
  </svg>
);

function RoomAllocationGrid({
  gender = 'MALE',
  studentId = null,
  wardenMode = false,
  onBedRequested = null,
  activeAllotment = null,
  isDarkMode = true,
}) {
  const [layoutData, setLayoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBed, setSelectedBed] = useState(null);
  const [activeRoomModal, setActiveRoomModal] = useState(null);
  const [selectedBedLetter, setSelectedBedLetter] = useState('A');
  const [requestSentInfo, setRequestSentInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeHostelGender, setActiveHostelGender] = useState(gender);

  const sceneWrapRef = React.useRef(null);
  const roomElRef = React.useRef(null);

  useEffect(() => {
    setActiveHostelGender(gender);
  }, [gender]);

  const fetchLayout = useCallback(async () => {
    setLoading(true);
    try {
      const g = activeHostelGender === 'FEMALE' ? 'FEMALE' : 'MALE';
      const url = `http://127.0.0.1:8000/api/hostels/grid?gender=${g}${studentId ? `&student_id=${studentId}` : ''}`;
      const response = await axios.get(url);
      setLayoutData(response.data);
    } catch (error) {
      console.error('Error fetching layout:', error);
      toast.error('Failed to load hostel blueprint grid.');
    } finally {
      setLoading(false);
    }
  }, [activeHostelGender, studentId]);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  const handleRoomClick = (room) => {
    if (wardenMode) return;
    if (activeAllotment && (activeAllotment.status === 'APPROVED' || activeAllotment.status === 'PENDING')) {
      toast.error(
        activeAllotment.status === 'APPROVED'
          ? 'You already have an approved room allotment!'
          : 'You already have a pending allotment request awaiting Warden approval.'
      );
      return;
    }

    const availableBed = room.beds.find((b) => !b.is_occupied);
    if (!availableBed) {
      toast.error(`Room ${room.room_number} is fully occupied!`);
      return;
    }

    // Open Interior Room View Modal
    setActiveRoomModal(room);
    setSelectedBedLetter(availableBed.bed_code || 'A');
    setSelectedBed({ room, bed: availableBed });
    setRequestSentInfo(null);
  };

  const handleSelectLetter = (letter) => {
    if (!activeRoomModal) return;
    const targetBed = activeRoomModal.beds.find((b) => b.bed_code === letter);
    if (targetBed && targetBed.is_occupied) {
      toast.error(`Bed ${letter} in Room ${activeRoomModal.room_number} is already occupied!`);
      return;
    }
    setSelectedBedLetter(letter);
    if (targetBed) {
      setSelectedBed({ room: activeRoomModal, bed: targetBed });
    }
    setRequestSentInfo(null);
  };

  const handleRequestAllotment = async () => {
    if (!activeRoomModal || !studentId) {
      toast.error('Please select a room and available seat first!');
      return;
    }

    const bedToRequest = activeRoomModal.beds.find((b) => b.bed_code === selectedBedLetter && !b.is_occupied);
    if (!bedToRequest) {
      toast.error(`Bed ${selectedBedLetter} is not available!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/hostels/request-bed', {
        student_id: studentId,
        room_id: activeRoomModal.id,
        bed_id: bedToRequest.id,
      });

      const msg = response.data.message || 'Seat allotment request submitted successfully! 🎟️';
      toast.success(msg, {
        duration: 5000,
        style: {
          borderRadius: '16px',
          background: isDarkMode ? '#14151b' : '#ffffff',
          color: isDarkMode ? '#fbbf24' : '#b45309',
          border: '1px solid #eab308',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        },
      });

      setRequestSentInfo(`Request sent for Room ${activeRoomModal.room_number}(${selectedBedLetter}) — Awaiting Warden Approval`);
      fetchLayout();
      if (onBedRequested) onBedRequested();
      setTimeout(() => {
        setActiveRoomModal(null);
      }, 700);
    } catch (error) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to submit bed request.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMouseMove3D = (e) => {
    if (!sceneWrapRef.current || !roomElRef.current) return;
    const rect = sceneWrapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    roomElRef.current.style.transform = `rotateX(${6 - y * 10}deg) rotateY(${-2 + x * 10}deg)`;
  };

  const handleMouseLeave3D = () => {
    if (roomElRef.current) {
      roomElRef.current.style.transform = 'rotateX(6deg) rotateY(-2deg)';
    }
  };

  const isFemale = activeHostelGender === 'FEMALE' || layoutData?.gender_type === 'FEMALE';
  const rooms = layoutData?.rooms || [];

  // Accurate Blueprint Constants: Birsa (34 rooms = 102 beds), Rajendra (33 rooms = 99 beds)
  const birsaRooms = rooms.filter((r) => r.block_name?.includes('Birsa') || r.wing?.includes('BIRSA'));
  const birsaOccupied = birsaRooms.reduce((acc, r) => acc + (r.occupied_count || 0), 0);
  const birsaTotalBeds = 102; // 34 rooms * 3 beds
  const birsaVacant = Math.max(0, birsaTotalBeds - birsaOccupied);

  const rajendraRooms = rooms.filter((r) => r.block_name?.includes('Rajendra') || r.wing?.includes('RAJENDRA'));
  const rajendraOccupied = rajendraRooms.reduce((acc, r) => acc + (r.occupied_count || 0), 0);
  const rajendraTotalBeds = 99; // 33 rooms * 3 beds
  const rajendraVacant = Math.max(0, rajendraTotalBeds - rajendraOccupied);

  const totalBeds = isFemale ? 120 : (birsaTotalBeds + rajendraTotalBeds); // 201
  const occupiedBeds = isFemale
    ? rooms.reduce((acc, r) => acc + (r.occupied_count || 0), 0)
    : (birsaOccupied + rajendraOccupied);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  /* ------------------------------------------------------------------ */
  /*  Dual-Theme High-Contrast Room Card Design (Dark & Light Mode)     */
  /* ------------------------------------------------------------------ */
  const renderTile = (room) => {
    const isSelectedRoom = selectedBed && selectedBed.room.id === room.id;
    const isFull = room.occupied_count === room.capacity;
    const isPartiallyBooked = room.occupied_count > 0 && !isFull;
    const freeBeds = room.capacity - room.occupied_count;

    // 🟢 Green = All Available
    let style = isDarkMode
      ? 'bg-[#064e3b]/90 border border-emerald-500/80 text-white shadow-sm hover:bg-[#065f46] hover:border-emerald-300'
      : 'bg-[#e6f9f0] border-2 border-[#86efac] text-emerald-950 shadow-xs hover:bg-[#dcfce7] hover:border-[#4ade80]';

    // 🔴 Red = Fully Occupied
    if (isFull) {
      style = isDarkMode
        ? 'bg-[#3a0c0c]/85 border border-red-800/70 text-red-200/60 cursor-not-allowed opacity-75'
        : 'bg-[#fff1f2] border-2 border-rose-200 text-rose-800/50 cursor-not-allowed opacity-75';
    } 
    // 🟡 Amber = Partially Booked
    else if (isPartiallyBooked) {
      style = isDarkMode
        ? 'bg-[#78350f]/90 border border-amber-500/80 text-amber-50 shadow-sm hover:bg-[#92400e] hover:border-amber-300'
        : 'bg-[#fef9ee] border-2 border-amber-300 text-amber-950 shadow-xs hover:bg-[#fef3c7] hover:border-amber-400';
    }

    // 🌟 Gold = Selected by Student
    if (isSelectedRoom) {
      style = isDarkMode
        ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-black font-black border-2 border-white shadow-[0_0_20px_rgba(251,191,36,0.95)] scale-[1.04] ring-0 z-20'
        : 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 text-slate-950 font-black border-2 border-amber-600 shadow-[0_0_16px_rgba(245,158,11,0.7)] scale-[1.04] ring-0 z-20';
    }

    return (
      <button
        key={room.id}
        type="button"
        disabled={isFull && !wardenMode}
        onClick={() => handleRoomClick(room)}
        aria-label={`Room ${room.room_number}, ${isFull ? 'fully occupied' : `${freeBeds} of ${room.capacity} beds free`}`}
        title={`Room ${room.room_number} • ${freeBeds} of ${room.capacity} beds available`}
        className={`w-full h-11 sm:h-12 md:h-13 rounded-xl transition-all duration-150 flex flex-col items-center justify-center select-none active:scale-95 ${style}`}
      >
        <span
          className={`text-[7.5px] sm:text-[8px] md:text-[8.5px] font-mono font-bold uppercase tracking-widest leading-none ${
            isSelectedRoom
              ? 'text-black/80'
              : isDarkMode
              ? 'opacity-75'
              : isFull
              ? 'text-rose-700/60'
              : isPartiallyBooked
              ? 'text-amber-800'
              : 'text-emerald-800'
          }`}
        >
          ROOM
        </span>
        <span
          className={`text-xs sm:text-sm md:text-base font-mono font-black tracking-tight leading-none mt-1 ${
            isSelectedRoom
              ? 'text-black'
              : isDarkMode
              ? 'text-white'
              : isFull
              ? 'text-rose-900/60'
              : isPartiallyBooked
              ? 'text-amber-950'
              : 'text-emerald-950'
          }`}
        >
          {room.room_number}
        </span>
      </button>
    );
  };

  const renderPlaceholder = (num) => (
    <div
      key={num}
      className={`w-full h-11 sm:h-12 md:h-13 rounded-xl border flex flex-col items-center justify-center font-mono leading-none ${
        isDarkMode
          ? 'border-zinc-800/80 bg-zinc-900/30 text-zinc-600'
          : 'border-slate-200 bg-slate-100/50 text-slate-400'
      }`}
    >
      <span className="text-[7.5px] sm:text-[8px] font-bold tracking-widest opacity-60">ROOM</span>
      <span className="text-xs sm:text-sm font-bold tracking-tight mt-1">{num}</span>
    </div>
  );

  const findRoom = (blockPrefix, floorNum, num) =>
    rooms.find(
      (r) =>
        r.room_number === num &&
        r.floor_number === floorNum &&
        (r.block_name?.includes(blockPrefix) || r.wing?.includes(blockPrefix.toUpperCase()))
    );

  const renderBoysFloor = (blockPrefix, floor) => {
    const { floorTitle, floorNum, topRooms, midRooms, botRooms } = floor;

    return (
      <div
        key={floorTitle}
        className={`flex flex-col gap-2 sm:gap-2.5 p-3 sm:p-4 rounded-2xl border transition-all duration-150 w-full min-w-0 ${
          isDarkMode
            ? 'bg-[#12141d]/90 border-zinc-800/90 shadow-inner'
            : 'bg-white border-2 border-amber-200/90 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-center gap-2 py-0.5 mb-0.5">
          <div
            className={`h-[1.5px] flex-1 bg-gradient-to-r ${
              isDarkMode
                ? 'from-transparent via-amber-500/40 to-transparent'
                : 'from-transparent via-amber-400 to-transparent'
            }`}
          />
          <span
            className={`text-[9.5px] sm:text-xs font-serif font-black uppercase tracking-[0.2em] whitespace-nowrap px-3 py-0.5 rounded-full border shadow-2xs ${
              isDarkMode
                ? 'bg-amber-950/50 border-amber-500/40 text-[#e0b968]'
                : 'bg-amber-100/90 border-amber-300 text-amber-900 font-extrabold'
            }`}
          >
            ✦ {floorTitle} ✦
          </span>
          <div
            className={`h-[1.5px] flex-1 bg-gradient-to-r ${
              isDarkMode
                ? 'from-transparent via-amber-500/40 to-transparent'
                : 'from-transparent via-amber-400 to-transparent'
            }`}
          />
        </div>

        {/* TOP ROW */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full min-w-0">
          {topRooms.map((num) => {
            const r = findRoom(blockPrefix, floorNum, num);
            return r ? renderTile(r) : renderPlaceholder(num);
          })}
        </div>

        {/* MID ROW */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full min-w-0">
          {midRooms.map((num) => {
            const r = findRoom(blockPrefix, floorNum, num);
            return r ? renderTile(r) : renderPlaceholder(num);
          })}
        </div>

        {/* BOT ROW */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full min-w-0">
          {botRooms.map((num) => {
            const r = findRoom(blockPrefix, floorNum, num);
            return r ? renderTile(r) : renderPlaceholder(num);
          })}
        </div>
      </div>
    );
  };

  const renderGirlsFloor = (floorNum, floorTitle) => {
    const leftRooms = Array.from({ length: 10 }, (_, i) => `${floorNum}${String(i + 1).padStart(2, '0')}`);
    const rightRooms = Array.from({ length: 10 }, (_, i) => `${floorNum}${String(i + 11).padStart(2, '0')}`);
    const findGirlRoom = (num) => rooms.find((r) => r.room_number === num && r.floor_number === floorNum);

    return (
      <div
        key={floorTitle}
        className={`flex flex-col gap-2 sm:gap-2.5 p-2.5 sm:p-3.5 rounded-2xl border transition-all duration-150 w-full min-w-0 ${
          isDarkMode
            ? 'bg-[#170f1c]/80 border-pink-900/50 shadow-inner'
            : 'bg-white border-2 border-pink-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-center gap-2 py-0.5 mb-0.5">
          <div
            className={`h-[1.5px] flex-1 bg-gradient-to-r ${
              isDarkMode
                ? 'from-transparent via-pink-500/40 to-transparent'
                : 'from-transparent via-pink-400 to-transparent'
            }`}
          />
          <span
            className={`text-[9.5px] sm:text-xs font-serif font-black uppercase tracking-[0.2em] whitespace-nowrap px-3 py-0.5 rounded-full border shadow-2xs ${
              isDarkMode
                ? 'bg-pink-950/50 border-pink-500/40 text-pink-300'
                : 'bg-pink-100/90 border-pink-300 text-pink-900 font-extrabold'
            }`}
          >
            ✦ {floorTitle} ✦
          </span>
          <div
            className={`h-[1.5px] flex-1 bg-gradient-to-r ${
              isDarkMode
                ? 'from-transparent via-pink-500/40 to-transparent'
                : 'from-transparent via-pink-400 to-transparent'
            }`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 relative w-full min-w-0">
          <div
            className={`hidden sm:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px pointer-events-none ${
              isDarkMode
                ? 'bg-gradient-to-b from-pink-500/10 via-pink-500/60 to-pink-500/10 shadow-[0_0_8px_rgba(236,72,153,0.5)]'
                : 'bg-gradient-to-b from-pink-300/20 via-pink-400/60 to-pink-300/20'
            }`}
          />

          {[leftRooms, rightRooms].map((wingRooms, i) => (
            <div className="flex flex-col gap-1 min-w-0" key={i}>
              <div
                className={`text-center text-[9px] sm:text-[10px] font-mono font-black tracking-widest uppercase ${
                  isDarkMode ? 'text-pink-300/80' : 'text-pink-700'
                }`}
              >
                {i === 0 ? 'LEFT WING' : 'RIGHT WING'}
              </div>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 min-w-0">
                {wingRooms.map((num) => {
                  const r = findGirlRoom(num);
                  return r ? renderTile(r) : renderPlaceholder(num);
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ------------------------------------------------------------------ */
  /*  Loading State                                                     */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div
        className={`w-full h-full min-h-[70vh] flex flex-col items-center justify-center gap-4 ${
          isDarkMode ? 'bg-[#0a0b0e]' : 'bg-[#f8fafc]'
        }`}
      >
        <div className="relative">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-sm">🛏️</div>
        </div>
        <p
          className={`text-[11px] font-black tracking-[0.25em] uppercase animate-pulse ${
            isDarkMode ? 'text-amber-400' : 'text-amber-700'
          }`}
        >
          Loading Blueprint Matrix…
        </p>
      </div>
    );
  }

  if (!layoutData) {
    return (
      <div
        className={`w-full h-full min-h-[50vh] py-16 text-center px-4 ${
          isDarkMode ? 'bg-[#0a0b0e] text-zinc-400' : 'bg-[#f8fafc] text-slate-600'
        }`}
      >
        <p className="font-bold text-sm mb-3">Hostel layout blueprint is currently unavailable.</p>
        <button
          onClick={fetchLayout}
          className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-xl text-xs uppercase shadow-md"
        >
          🔄 Reload layout
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  MAIN RENDER                                                       */
  /* ------------------------------------------------------------------ */
  return (
    <div
      className={`w-full max-w-[1650px] mx-auto min-w-0 px-3 sm:px-5 md:px-7 py-3 sm:py-4 flex flex-col gap-4 sm:gap-5 select-none box-border overflow-y-auto overflow-x-hidden font-sans transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0a0b0e] text-zinc-100' : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* 🌟 1. FULL-WIDTH TOP HEADER */}
      <div
        className={`relative rounded-2xl p-2.5 sm:p-3.5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 border transition-colors ${
          isDarkMode
            ? 'bg-[#12131c] border-amber-500/30'
            : 'bg-white/95 border-amber-400/40 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner border ${
              isDarkMode
                ? 'bg-amber-500/10 border-amber-500/40'
                : 'bg-amber-50 border-amber-300'
            }`}
          >
            <svg
              className={`w-5 h-5 sm:w-6 sm:h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 4v16" />
              <path d="M22 10v10" />
              <path d="M2 17h20" />
              <path d="M2 10h18a2 2 0 0 1 2 2v5" />
              <circle cx="7" cy="7" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span
                className={`text-[9.5px] sm:text-[10.5px] font-mono font-black tracking-widest uppercase ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-700'
                }`}
              >
                GOVT. POLYTECHNIC BARH
              </span>
              <span className={isDarkMode ? 'text-zinc-600 hidden sm:inline' : 'text-slate-300 hidden sm:inline'}>•</span>
              <span
                className={`text-[9.5px] sm:text-[10.5px] font-mono font-bold uppercase hidden sm:inline ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                HOSTEL SEAT ALLOCATION
              </span>
            </div>
            <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight leading-tight mt-0.5 truncate">
              <span
                className={
                  isDarkMode
                    ? 'bg-gradient-to-r from-white via-zinc-100 to-amber-300 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-slate-900 via-slate-800 to-amber-800 bg-clip-text text-transparent'
                }
              >
                {isFemale ? 'Savitribai Phule Girls Hostel' : 'Hostel Seat & Room Allocation'}
              </span>
            </h2>
          </div>
        </div>

        {/* 🌟 Sleek Architectural Status Legend Strip */}
        <div
          className={`inline-flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-1.5 rounded-full border transition-all ${
            isDarkMode
              ? 'bg-zinc-900/90 border-zinc-750 text-zinc-300 shadow-md backdrop-blur-md'
              : 'bg-white/95 border-slate-300 text-slate-700 shadow-xs backdrop-blur-md'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className={isDarkMode ? 'text-zinc-200' : 'text-slate-800'}>Available</span>
          </div>

          <span className={`text-[10px] ${isDarkMode ? 'text-zinc-700' : 'text-slate-300'}`}>•</span>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className={isDarkMode ? 'text-zinc-200' : 'text-slate-800'}>Partial</span>
          </div>

          <span className={`text-[10px] ${isDarkMode ? 'text-zinc-700' : 'text-slate-300'}`}>•</span>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span className={isDarkMode ? 'text-zinc-200' : 'text-slate-800'}>Full</span>
          </div>

          <span className={`text-[10px] ${isDarkMode ? 'text-zinc-700' : 'text-slate-300'}`}>•</span>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
            <span className={isDarkMode ? 'text-amber-300' : 'text-amber-800'}>Selected</span>
          </div>
        </div>
      </div>

      {/* 🌟 2. EXPANSIVE MIDDLE BLUEPRINT MATRIX (PHONE: STACKED / WEB: SIDE-BY-SIDE) */}
      <div className="w-full flex-1 flex flex-col justify-start py-1">
        {!isFemale ? (
          <div className="w-full min-w-0">
            {/* On Phone (< md): grid-cols-1 (Stacked Upper/Lower) | On Desktop (>= md): grid-cols-2 (Side-by-Side) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full min-w-0 relative px-1 sm:px-2">
              {/* Desktop Center Highlighted Divider */}
              <div
                className={`hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] pointer-events-none z-10 ${
                  isDarkMode
                    ? 'bg-gradient-to-b from-amber-500/20 via-amber-500/70 to-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'bg-gradient-to-b from-amber-300/30 via-amber-500 to-amber-300/30 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                }`}
              />

              {/* ⬅️ BIRSA MUNDA BOYS HOSTEL */}
              <div
                className={`w-full min-w-0 space-y-3 sm:space-y-4 p-3.5 sm:p-5 md:p-6 rounded-3xl border-2 shadow-md transition-all ${
                  isDarkMode
                    ? 'bg-[#0f1118]/90 border-zinc-800'
                    : 'bg-white border-2 border-amber-300/90 shadow-md ring-1 ring-amber-400/20'
                }`}
              >
                <div
                  className={`text-center py-1.5 sm:py-2 px-3 sm:px-4 rounded-2xl border-2 flex items-center justify-center gap-2.5 shadow-xs ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-amber-500/30'
                      : 'bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border-amber-300'
                  }`}
                >
                  <span className={`shrink-0 text-base sm:text-lg ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>🛏️</span>
                  <div className="min-w-0">
                    <h3
                      className={`text-[11px] sm:text-xs md:text-sm font-serif tracking-[0.1em] sm:tracking-[0.16em] font-black uppercase truncate ${
                        isDarkMode ? 'text-[#f59e0b]' : 'text-amber-900'
                      }`}
                    >
                      Birsa Munda Boys Hostel
                    </h3>
                    <p className={`text-[9.5px] sm:text-[10.5px] font-mono font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{birsaVacant}</span> beds available • <span className="opacity-75">{birsaTotalBeds} Total Beds</span>
                    </p>
                  </div>
                </div>
                {BOYS_FLOORS.Birsa.map((floor) => renderBoysFloor('Birsa', floor))}
              </div>

              {/* ➡️ DR. RAJENDRA PRASAD BOYS HOSTEL */}
              <div
                className={`w-full min-w-0 space-y-3 sm:space-y-4 p-3.5 sm:p-5 md:p-6 rounded-3xl border-2 shadow-md transition-all ${
                  isDarkMode
                    ? 'bg-[#0f1118]/90 border-zinc-800'
                    : 'bg-white border-2 border-amber-300/90 shadow-md ring-1 ring-amber-400/20'
                }`}
              >
                <div
                  className={`text-center py-1.5 sm:py-2 px-3 sm:px-4 rounded-2xl border-2 flex items-center justify-center gap-2.5 shadow-xs ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-amber-500/30'
                      : 'bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border-amber-300'
                  }`}
                >
                  <span className={`shrink-0 text-base sm:text-lg ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>🛏️</span>
                  <div className="min-w-0">
                    <h3
                      className={`text-[11px] sm:text-xs md:text-sm font-serif tracking-[0.08em] sm:tracking-[0.14em] font-black uppercase truncate ${
                        isDarkMode ? 'text-[#f59e0b]' : 'text-amber-900'
                      }`}
                    >
                      Dr. Rajendra Prasad Boys Hostel
                    </h3>
                    <p className={`text-[9.5px] sm:text-[10.5px] font-mono font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{rajendraVacant}</span> beds available • <span className="opacity-75">{rajendraTotalBeds} Total Beds</span>
                    </p>
                  </div>
                </div>
                {BOYS_FLOORS.Rajendra.map((floor) => renderBoysFloor('Rajendra', floor))}
              </div>
            </div>
          </div>
        ) : (
          /* SAVITRIBAI PHULE GIRLS HOSTEL */
          <div
            className={`w-full max-w-5xl mx-auto space-y-3 p-3 sm:p-5 rounded-3xl border-2 shadow-xl min-w-0 ${
              isDarkMode ? 'bg-[#140e18]/90 border-pink-900/40' : 'bg-white/95 border-pink-200 shadow-md ring-1 ring-slate-900/5'
            }`}
          >
            <div
              className={`text-center py-1.5 sm:py-2 px-3 sm:px-4 rounded-2xl border-2 flex items-center justify-center gap-2.5 shadow-xs ${
                isDarkMode
                  ? 'bg-gradient-to-r from-pink-500/10 via-pink-500/20 to-pink-500/10 border-pink-500/30'
                  : 'bg-gradient-to-r from-pink-50 via-pink-100/70 to-pink-50 border-pink-300'
              }`}
            >
              <span className={`shrink-0 text-base sm:text-lg ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>🛏️</span>
              <div className="min-w-0">
                <h3
                  className={`text-xs sm:text-base font-serif tracking-[0.1em] sm:tracking-[0.16em] font-black uppercase truncate ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-900'
                  }`}
                >
                  Savitribai Phule Girls Hostel — 2 Floors
                </h3>
                <p className={`text-[9.5px] sm:text-[10.5px] font-mono font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                  <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{availableBeds}</span> beds available • <span className="opacity-75">{totalBeds} Total Beds</span>
                </p>
              </div>
            </div>
            {renderGirlsFloor(2, '2ND FLOOR')}
            {renderGirlsFloor(1, '1ST FLOOR')}
          </div>
        )}
      </div>

      {/* 🌟 3. REAL-TIME FOOTER STATS */}
      <div
        className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-[10px] sm:text-xs font-mono shrink-0 ${
          isDarkMode ? 'border-zinc-800/90 text-zinc-400' : 'border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={isDarkMode ? 'text-zinc-500' : 'text-slate-400'}>Live Status:</span>
          <span className={`font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            {availableBeds} Vacant Beds
          </span>
          <span className={isDarkMode ? 'text-zinc-600' : 'text-slate-300'}>/</span>
          <span className={`font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
            {totalBeds} Total Capacity
          </span>
        </div>
        <div className={`text-[10px] sm:text-xs font-sans ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
          Govt. Polytechnic Barh • Hostel Management System
        </div>
      </div>

      {/* 🌟 4. ROOM INTERIOR VIEW MODAL (COMPACT SINGLE-SCREEN VIEW) */}
      {activeRoomModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-3 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
          {/* shared SVG filter for cement-textured almirah */}
          <svg width="0" height="0" className="absolute pointer-events-none">
            <filter id="cementTexture" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise" />
              <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.51  0 0 0 0 0.52  0 0 0 0.4 0" result="grain" />
              <feComposite in="grain" in2="SourceGraphic" operator="in" result="grainClipped" />
              <feBlend in="SourceGraphic" in2="grainClipped" mode="multiply" />
            </filter>
          </svg>

          <div
            className={`relative w-[92vw] max-w-3xl md:max-w-4xl max-h-[92vh] my-auto rounded-2xl sm:rounded-3xl border-2 shadow-2xl p-3 sm:p-4 transition-colors overflow-hidden flex flex-col gap-2 sm:gap-2.5 ${
              isDarkMode
                ? 'bg-[#0d2338] border-[#1c4a6e] text-[#eef1ea]'
                : 'bg-[#f8fafc] border-slate-300 text-slate-900'
            }`}
          >
            {/* TOP HEADER CARD */}
            <div
              className={`rounded-xl sm:rounded-2xl p-2 sm:p-2.5 border flex items-center justify-between gap-2.5 ${
                isDarkMode ? 'bg-[#123452]/90 border-[#1c4a6e]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#e9aa66] to-[#8f571f] flex items-center justify-center font-bold text-[#2c1a06] text-xs shrink-0 shadow-md">
                  GP
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm md:text-base font-black tracking-tight truncate">
                      Room {activeRoomModal.room_number} • Seat Selection
                    </span>
                    <span
                      className={`text-[8.5px] sm:text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isDarkMode
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                          : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}
                    >
                      {activeRoomModal.block_name || (isFemale ? 'Girls Hostel' : 'Boys Hostel')}
                    </span>
                  </div>
                  <p className={`text-[9px] sm:text-[10.5px] truncate ${isDarkMode ? 'text-[#93b0c6]' : 'text-slate-500'}`}>
                    Govt. Polytechnic, Barh • Floor {activeRoomModal.floor_number}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveRoomModal(null);
                  setRequestSentInfo(null);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#0d2338] border border-[#1c4a6e] text-zinc-300 hover:text-white hover:border-amber-400'
                    : 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 hover:text-black'
                }`}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* SEAT SELECTOR CAPSULE BAR */}
            <div
              className={`rounded-xl p-1.5 sm:p-2 border flex items-center justify-between gap-2 ${
                isDarkMode ? 'bg-[#123452]/60 border-[#1c4a6e]/80' : 'bg-slate-100/90 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 pl-1">
                <span className="text-sm">🛏️</span>
                <span className={`text-[11px] sm:text-xs font-bold font-mono ${isDarkMode ? 'text-[#93b0c6]' : 'text-slate-700'}`}>
                  Choose Seat:
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {['A', 'B', 'C'].map((letter) => {
                  const bedObj = activeRoomModal.beds.find((b) => b.bed_code === letter);
                  const isOcc = bedObj?.is_occupied;
                  const isCurrentActive = selectedBedLetter === letter;

                  return (
                    <button
                      key={letter}
                      type="button"
                      disabled={isOcc}
                      onClick={() => handleSelectLetter(letter)}
                      className={`px-3 sm:px-4 py-1 rounded-lg font-mono font-black text-xs sm:text-sm transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                        isOcc
                          ? 'opacity-40 bg-red-950/40 border border-red-800/60 text-red-300 cursor-not-allowed'
                          : isCurrentActive
                          ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-slate-950 border-2 border-amber-500 shadow-xs scale-105'
                          : isDarkMode
                          ? 'bg-[#0d2338] border border-[#1c4a6e] text-white hover:border-amber-400'
                          : 'bg-white border border-slate-300 text-slate-800 hover:border-amber-500'
                      }`}
                    >
                      <span>Bed {letter}</span>
                      <span className="text-[8px]">
                        {isOcc ? '🔴' : isCurrentActive ? '★' : '🟢'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 🌟 STATIC COMPACT ROOM BLUEPRINT */}
            <div
              className={`rounded-xl sm:rounded-2xl p-2 sm:p-2.5 border-2 transition-all ${
                isDarkMode
                  ? 'bg-[#123452] border-[#1e4d70] shadow-inner'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {/* 3 COLUMNS: A (Left), B (Center), C (Right) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {['A', 'B', 'C'].map((letter) => {
                  const bedObj = activeRoomModal.beds.find((b) => b.bed_code === letter);
                  const isOcc = bedObj?.is_occupied;
                  const isSelected = selectedBedLetter === letter;

                  return (
                    <div
                      key={letter}
                      onClick={() => !isOcc && handleSelectLetter(letter)}
                      className={`relative flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl border transition-all duration-150 cursor-pointer ${
                        isOcc
                          ? 'opacity-40 grayscale-[0.7] cursor-not-allowed bg-red-950/10 border-red-800/30'
                          : isSelected
                          ? isDarkMode
                            ? 'bg-[#0d2338] border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)] scale-[1.01]'
                            : 'bg-amber-50/70 border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)] scale-[1.01]'
                          : isDarkMode
                          ? 'bg-[#0d2338]/60 border-[#1c4a6e] hover:bg-[#0d2338]'
                          : 'bg-slate-50 border-slate-200 hover:bg-white'
                      }`}
                    >
                      {/* SELECTED BADGE */}
                      {isSelected && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 font-mono text-[7.5px] sm:text-[8.5px] font-black uppercase text-[#3a2a08] bg-amber-400 px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                          ★ SELECTED
                        </div>
                      )}

                      {/* OCCUPANT / ROOM TAG */}
                      <div className="text-center pt-0.5">
                        <div
                          className={`font-mono text-[11px] sm:text-xs md:text-sm font-black tracking-wide ${
                            isSelected
                              ? isDarkMode ? 'text-amber-300' : 'text-amber-900'
                              : isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                          }`}
                        >
                          {activeRoomModal.room_number}({letter})
                        </div>
                        <div className="text-[8px] sm:text-[9px] font-mono leading-none mt-0.5">
                          {isOcc ? (
                            <span className="text-rose-400 font-bold">🔴 {bedObj?.current_student_name || 'Booked'}</span>
                          ) : (
                            <span className="text-emerald-400 font-semibold">🟢 Available</span>
                          )}
                        </div>
                      </div>

                      {/* 4 SVG FURNITURES */}
                      <div className="flex flex-col items-center gap-1 sm:gap-1.5 w-full my-auto py-0.5">
                        {/* Table */}
                        <div className="flex flex-col items-center gap-0.5 hover:scale-105 transition-transform">
                          <TableSVG />
                          <span className={`text-[7px] sm:text-[8px] font-mono leading-none ${isDarkMode ? 'text-[#93b0c6]' : 'text-slate-500'}`}>
                            Study Table
                          </span>
                        </div>

                        {/* Chair */}
                        <div className="flex flex-col items-center gap-0.5 hover:scale-105 transition-transform">
                          <ChairSVG />
                          <span className={`text-[7px] sm:text-[8px] font-mono leading-none ${isDarkMode ? 'text-[#93b0c6]' : 'text-slate-500'}`}>
                            Hostel Chair
                          </span>
                        </div>

                        {/* Bed */}
                        <div className="flex flex-col items-center gap-0.5 hover:scale-105 transition-transform">
                          <BedSVG />
                          <span className={`text-[7px] sm:text-[8px] font-mono leading-none ${isDarkMode ? 'text-[#93b0c6]' : 'text-slate-500'}`}>
                            Bed {letter}
                          </span>
                        </div>

                        {/* Locker */}
                        <div className="flex flex-col items-center gap-0.5 hover:scale-105 transition-transform">
                          <LockerSVG />
                          <span className={`text-[7px] sm:text-[8px] font-mono leading-none ${isDarkMode ? 'text-[#93b0c6]' : 'text-slate-500'}`}>
                            Almirah
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🌟 CENTERED PROCEED ACTION AREA */}
            <div className="flex flex-col items-center justify-center gap-1.5 pt-0.5">
              {!requestSentInfo ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => setActiveRoomModal(null)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#123452] text-zinc-300 hover:text-white border-[#1c4a6e]'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border-slate-300'
                    }`}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting || !selectedBedLetter}
                    onClick={handleRequestAllotment}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/30 border border-amber-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Request to Warden…</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Book Seat {activeRoomModal.room_number}({selectedBedLetter})</span>
                        <span className="text-xs sm:text-sm font-bold">➔</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 py-0.5">
                  <div className="text-emerald-400 font-bold text-xs sm:text-sm flex items-center gap-1.5">
                    <span>✅</span>
                    <span>{requestSentInfo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoomModal(null);
                      setRequestSentInfo(null);
                    }}
                    className="text-xs text-zinc-400 underline hover:text-amber-300 cursor-pointer"
                  >
                    Close & return to rooms layout
                  </button>
                </div>
              )}

              <p className={`text-[9px] sm:text-[10px] text-center font-mono ${isDarkMode ? 'text-[#93b0c6]' : 'text-slate-500'}`}>
                Pick bed (A, B, or C) and click Confirm to send request to the Warden.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default RoomAllocationGrid;
