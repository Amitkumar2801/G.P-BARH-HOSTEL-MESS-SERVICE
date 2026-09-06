// src/components/RoomAllocationGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';
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

function RoomAllocationGrid({
  gender = 'MALE',
  studentId = null,
  wardenMode = false,
  onBedRequested = null,
  activeAllotment = null,
}) {
  const [layoutData, setLayoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBed, setSelectedBed] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeHostelGender, setActiveHostelGender] = useState(gender);

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

    setSelectedBed({ room, bed: availableBed });
  };

  const handleRequestAllotment = async () => {
    if (!selectedBed || !studentId) {
      toast.error('Please select an available room first!');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/hostels/request-bed', {
        student_id: studentId,
        room_id: selectedBed.room.id,
        bed_id: selectedBed.bed.id,
      });

      toast.success(response.data.message || 'Seat allotment request submitted successfully! 🎟️', {
        duration: 5000,
        style: {
          borderRadius: '16px',
          background: '#14151b',
          color: '#fbbf24',
          border: '1px solid #eab308',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
        },
      });
      setSelectedBed(null);
      fetchLayout();
      if (onBedRequested) onBedRequested();
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

  const isFemale = activeHostelGender === 'FEMALE' || layoutData?.gender_type === 'FEMALE';
  const rooms = layoutData?.rooms || [];

  const totalBeds = rooms.length * 3;
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupied_count, 0);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  const birsaRooms = rooms.filter((r) => r.block_name?.includes('Birsa') || r.wing?.includes('BIRSA'));
  const birsaVacant = birsaRooms.reduce((acc, r) => acc + (r.capacity - r.occupied_count), 0);
  const rajendraRooms = rooms.filter((r) => r.block_name?.includes('Rajendra') || r.wing?.includes('RAJENDRA'));
  const rajendraVacant = rajendraRooms.reduce((acc, r) => acc + (r.capacity - r.occupied_count), 0);

  /* ------------------------------------------------------------------ */
  /*  Cinema Seat Tile Renderer                                         */
  /* ------------------------------------------------------------------ */
  const renderTile = (room) => {
    const isSelectedRoom = selectedBed && selectedBed.room.id === room.id;
    const isFull = room.occupied_count === room.capacity;
    const isPartiallyBooked = room.occupied_count > 0 && !isFull;
    const freeBeds = room.capacity - room.occupied_count;

    let style =
      'bg-gradient-to-b from-emerald-700 to-emerald-950 text-emerald-50 border-emerald-400/70 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.45)] hover:brightness-110';

    if (isFull) {
      style =
        'bg-gradient-to-b from-red-800 to-red-950 text-red-100/90 border-red-500/70 cursor-not-allowed shadow-[0_2px_8px_-2px_rgba(239,68,68,0.35)] opacity-85';
    } else if (isPartiallyBooked) {
      style =
        'bg-gradient-to-b from-amber-600 to-amber-900 text-amber-50 border-amber-400/70 shadow-[0_2px_8px_-2px_rgba(245,158,11,0.4)] hover:brightness-110';
    }

    if (isSelectedRoom) {
      style =
        'bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 text-black font-black border-white shadow-[0_0_0_2px_rgba(255,255,255,0.9),0_0_20px_rgba(245,158,11,0.9)] scale-[1.06] ring-0 z-20 animate-pulse';
    }

    return (
      <button
        key={room.id}
        type="button"
        disabled={isFull && !wardenMode}
        onClick={() => handleRoomClick(room)}
        aria-label={`Room ${room.room_number}, ${isFull ? 'fully occupied' : `${freeBeds} of ${room.capacity} beds free`}`}
        title={`Room ${room.room_number} • ${freeBeds} of ${room.capacity} beds available`}
        className={`w-full min-w-0 h-8 sm:h-9 md:h-10 lg:h-11 rounded-lg border transition-all duration-150 flex flex-col items-center justify-center relative active:scale-95 ${style}`}
      >
        <span className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-mono font-black tracking-tight leading-none truncate max-w-full">
          {room.room_number}
        </span>
        {!isSelectedRoom && (
          <span className="text-[6.5px] sm:text-[7px] md:text-[8px] opacity-85 font-bold font-mono leading-none mt-0.5 truncate max-w-full">
            {isFull ? 'FULL' : `${freeBeds} FREE`}
          </span>
        )}
      </button>
    );
  };

  const renderPlaceholder = (num) => (
    <div
      key={num}
      className="w-full min-w-0 h-8 sm:h-9 md:h-10 lg:h-11 rounded-lg border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-center text-zinc-600 font-mono text-[10px] sm:text-xs font-bold"
    >
      {num}
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
    const rowWidth = (count) => {
      const table = { 6: '100%', 4: '68%', 3: '52%', 2: '36%' };
      return table[count] || '100%';
    };

    return (
      <div key={floorTitle} className="space-y-1 bg-[#12141d]/90 p-1.5 sm:p-2.5 rounded-xl border border-zinc-800/90 shadow-inner w-full min-w-0">
        <div className="flex items-center justify-center gap-1.5 py-0.5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-serif font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#e0b968] whitespace-nowrap px-1">
            ✦ {floorTitle} ✦
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
        </div>

        {/* TOP ROW */}
        <div
          className="grid gap-1 sm:gap-1.5 w-full min-w-0"
          style={{ gridTemplateColumns: `repeat(${topRooms.length}, minmax(0,1fr))` }}
        >
          {topRooms.map((num) => {
            const r = findRoom(blockPrefix, floorNum, num);
            return r ? renderTile(r) : renderPlaceholder(num);
          })}
        </div>

        {/* MID ROW */}
        <div
          className="grid gap-1 sm:gap-1.5 mx-auto w-full min-w-0"
          style={{ gridTemplateColumns: `repeat(${midRooms.length}, minmax(0,1fr))`, maxWidth: rowWidth(midRooms.length) }}
        >
          {midRooms.map((num) => {
            const r = findRoom(blockPrefix, floorNum, num);
            return r ? renderTile(r) : renderPlaceholder(num);
          })}
        </div>

        {/* BOT ROW */}
        <div
          className="grid gap-1 sm:gap-1.5 mx-auto w-full min-w-0"
          style={{ gridTemplateColumns: `repeat(${botRooms.length}, minmax(0,1fr))`, maxWidth: rowWidth(botRooms.length) }}
        >
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
      <div key={floorTitle} className="space-y-1.5 bg-[#170f1c]/80 p-2 sm:p-3 rounded-2xl border border-pink-900/50 shadow-inner w-full min-w-0">
        <div className="flex items-center justify-center gap-2 py-0.5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-800 to-transparent" />
          <span className="text-[10px] sm:text-xs font-serif font-black uppercase tracking-[0.2em] text-pink-400 whitespace-nowrap px-1">
            ✦ {floorTitle} ✦
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-800 to-transparent" />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4 relative w-full min-w-0">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-pink-500/10 via-pink-500/60 to-pink-500/10 shadow-[0_0_8px_rgba(236,72,153,0.5)] pointer-events-none" />

          {[leftRooms, rightRooms].map((wingRooms, i) => (
            <div className="space-y-1 min-w-0" key={i}>
              <div className="text-center text-[8.5px] sm:text-[9.5px] text-pink-300/80 font-mono font-black tracking-widest uppercase">
                {i === 0 ? 'LEFT WING' : 'RIGHT WING'}
              </div>
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5 min-w-0">
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
      <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#0a0b0e]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-sm">🏛️</div>
        </div>
        <p className="text-[11px] font-black tracking-[0.25em] uppercase bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent animate-pulse">
          Loading Blueprint Matrix…
        </p>
      </div>
    );
  }

  if (!layoutData) {
    return (
      <div className="w-full h-full min-h-[50vh] py-16 text-center bg-[#0a0b0e] text-zinc-400 px-4">
        <p className="font-bold text-sm mb-3 text-zinc-300">Hostel layout blueprint is currently unavailable.</p>
        <button
          onClick={fetchLayout}
          className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-xl text-xs uppercase"
        >
          🔄 Reload layout
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  MAIN RENDER: 1-SCREEN ZERO-SCROLL SIDE-BY-SIDE MATRIX             */
  /* ------------------------------------------------------------------ */
  return (
    <div className="w-full min-w-0 bg-[#0a0b0e] text-zinc-100 px-2 sm:px-3 md:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3 select-none box-border overflow-hidden font-sans">
      
      {/* 🌟 1. COMPACT CENTERED HEADER & STATUS HUD */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#181a24] via-[#12131b] to-[#0d0e13] border border-amber-500/20 px-3 py-2 sm:px-4 sm:py-2.5 shadow-md overflow-hidden text-center flex flex-col items-center">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-20 bg-amber-500/15 blur-2xl pointer-events-none rounded-full" />
        
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1e222f] border border-amber-500/30 text-[9px] font-black tracking-widest text-amber-300 uppercase shadow-sm">
            <span>🏛️</span>
            <span>GOVT. POLYTECHNIC BARH</span>
          </div>

          <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
              {isFemale ? 'Savitribai Phule Girls Hostel' : 'Hostel Seat & Room Allocation'}
            </span>
          </h2>
        </div>

        {/* Sleek Single-Row Status HUD */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 mt-1.5 bg-[#11131c]/90 px-3 py-1 rounded-xl border border-zinc-700/60 shadow-sm">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[9px] sm:text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-pulse" />
            <span>All 3 Free</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[9px] sm:text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.9)]" />
            <span>1–2 Free</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-[9px] sm:text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
            <span>Full (Occupied)</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-950/40 border border-yellow-400/50 text-yellow-300 text-[9px] sm:text-[10px] font-black">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,1)] animate-ping" />
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* 🌟 2. EXACT SIDE-BY-SIDE MATRIX (LEFT: BIRSA MUNDA | RIGHT: DR. RAJENDRA PRASAD) */}
      {!isFemale ? (
        <div className="w-full min-w-0">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 w-full min-w-0 relative">
            
            {/* Center Vertical Illuminated Divider */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-amber-500/20 via-amber-500/60 to-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.4)] pointer-events-none z-10" />

            {/* ⬅️ LEFT COLUMN: BIRSA MUNDA BOYS HOSTEL */}
            <div className="w-full min-w-0 space-y-1.5 sm:space-y-2 bg-[#0f1118]/90 p-1.5 sm:p-2.5 rounded-2xl border border-zinc-800 shadow-md">
              <div className="text-center py-1 px-1 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 rounded-xl border border-amber-500/30">
                <h3 className="text-[10px] sm:text-xs md:text-sm font-serif tracking-[0.15em] sm:tracking-[0.2em] text-[#f59e0b] font-black uppercase truncate">
                  🏢 Birsa Munda Boys Hostel
                </h3>
                <p className="text-[8.5px] sm:text-[9.5px] text-zinc-400 font-mono">{birsaVacant} beds available</p>
              </div>
              {BOYS_FLOORS.Birsa.map((floor) => renderBoysFloor('Birsa', floor))}
            </div>

            {/* ➡️ RIGHT COLUMN: DR. RAJENDRA PRASAD BOYS HOSTEL */}
            <div className="w-full min-w-0 space-y-1.5 sm:space-y-2 bg-[#0f1118]/90 p-1.5 sm:p-2.5 rounded-2xl border border-zinc-800 shadow-md">
              <div className="text-center py-1 px-1 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 rounded-xl border border-amber-500/30">
                <h3 className="text-[10px] sm:text-xs md:text-sm font-serif tracking-[0.15em] sm:tracking-[0.2em] text-[#f59e0b] font-black uppercase truncate">
                  🏢 Dr. Rajendra Prasad Boys Hostel
                </h3>
                <p className="text-[8.5px] sm:text-[9.5px] text-zinc-400 font-mono">{rajendraVacant} beds available</p>
              </div>
              {BOYS_FLOORS.Rajendra.map((floor) => renderBoysFloor('Rajendra', floor))}
            </div>
          </div>
        </div>
      ) : (
        /* SAVITRIBAI PHULE GIRLS HOSTEL (2 FLOORS ONLY) */
        <div className="w-full max-w-4xl mx-auto space-y-2 bg-[#140e18]/90 p-2 sm:p-3 rounded-2xl border border-pink-900/40 shadow-md min-w-0">
          <div className="text-center py-1 px-2 bg-gradient-to-r from-pink-500/10 via-pink-500/20 to-pink-500/10 rounded-xl border border-pink-500/30">
            <h3 className="text-[10px] sm:text-xs md:text-sm font-serif tracking-[0.15em] sm:tracking-[0.2em] text-pink-400 font-black uppercase">
              🌸 Savitribai Phule Girls Hostel — 2 Floors
            </h3>
          </div>
          {renderGirlsFloor(2, '2ND FLOOR')}
          {renderGirlsFloor(1, '1ST FLOOR')}
        </div>
      )}

      {/* 🌟 3. REAL-TIME FOOTER STATS */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-zinc-800/80 text-[9px] sm:text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">Live Status:</span>
          <span className="text-emerald-400 font-black">{availableBeds} Vacant Beds</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 font-bold">{totalBeds} Total Capacity</span>
        </div>
        <div className="text-zinc-500 text-[8.5px] sm:text-[9.5px] font-sans">
          Govt. Polytechnic Barh • Hostel Management System
        </div>
      </div>

      {/* 🌟 4. FLOATING VIP BOOKING DRAWER */}
      {!wardenMode && selectedBed && (
        <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-[#15161f]/98 backdrop-blur-2xl border-2 border-amber-500/90 text-white rounded-2xl p-3 sm:p-4 shadow-[0_15px_40px_rgba(0,0,0,0.95)] flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-xs">🎟️</span>
                <span className="text-[8px] uppercase tracking-widest text-amber-400 font-black">
                  Selected Seat
                </span>
              </div>
              <p className="text-xs sm:text-sm font-black text-white truncate">
                Room <span className="text-amber-400 font-mono">{selectedBed.room.room_number}</span> • Bed{' '}
                <span className="text-amber-400 font-mono">{selectedBed.bed.bed_code}</span>
              </p>
              <p className="text-[8.5px] sm:text-[9.5px] text-zinc-400 truncate">
                {selectedBed.room.block_name || (isFemale ? 'Girls Hostel' : 'Boys Hostel')} • Floor{' '}
                {selectedBed.room.floor_number}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedBed(null)}
                className="px-2 py-1 text-[10px] sm:text-xs font-bold text-zinc-400 hover:text-white transition-colors rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestAllotment}
                disabled={isSubmitting}
                className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md shadow-amber-500/30 transition-all active:scale-95 flex items-center gap-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Booking…</span>
                  </>
                ) : (
                  <span>PROCEED ➔</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomAllocationGrid;
