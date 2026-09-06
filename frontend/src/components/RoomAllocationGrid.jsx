// src/components/RoomAllocationGrid.jsx
//
// Govt. Polytechnic Barh — Hostel Seat & Room Allocation
// -------------------------------------------------------
// This rewrite keeps every room number, floor grouping, capacity rule and
// API call identical to the original. What changed is how the layout
// decides its own size.
//
// THE BUG THIS FIXES
// The previous version switched between "dual wing side-by-side" and
// "stacked" layout using Tailwind's viewport breakpoint (`xl:`). That is
// wrong for a component that lives inside a dashboard shell with a fixed
// sidebar: on a 1536px laptop the *viewport* is past `xl`, but the actual
// space handed to this component (viewport minus sidebar) is only ~1100px
// — too narrow for two 6-wide room grids — so the right-hand hostel got
// pushed off the right edge and clipped. The same class of bug hit the
// wing-selector tabs, which used `overflow-x-auto` and silently truncated
// on medium widths instead of wrapping.
//
// The fix: measure the component's own container with a ResizeObserver and
// drive every layout decision (dual-column vs stacked, tile size, tab
// layout) off that real, local width instead of the viewport. That makes
// the grid correct on a phone, a folded/unfolded tablet, a MacBook, a 4K
// monitor, or a 300px-wide embedded webview — anywhere it's dropped.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

/* ------------------------------------------------------------------ */
/*  Container-width hook — the backbone of the responsive behaviour   */
/* ------------------------------------------------------------------ */
function useContainerWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });

    observer.observe(el);
    setWidth(el.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

/* ------------------------------------------------------------------ */
/*  Blueprint data — EXACT room numbers, unchanged                    */
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
/*  Size buckets — derived from the MEASURED width of a single hostel */
/*  column, never from the viewport.                                  */
/* ------------------------------------------------------------------ */
function getBucket(colWidth) {
  if (colWidth === 0) return 'md'; // first paint, before measurement settles
  if (colWidth < 300) return 'xxs';
  if (colWidth < 380) return 'xs';
  if (colWidth < 480) return 'sm';
  if (colWidth < 680) return 'md';
  return 'lg';
}

const TILE_CLASSES = {
  xxs: { h: 'h-8', gap: 'gap-1', num: 'text-[9px]', pill: 'text-[6.5px]', pad: 'p-1.5', radius: 'rounded-md' },
  xs: { h: 'h-9', gap: 'gap-1', num: 'text-[10px]', pill: 'text-[7px]', pad: 'p-2', radius: 'rounded-lg' },
  sm: { h: 'h-10', gap: 'gap-1.5', num: 'text-[11px]', pill: 'text-[7.5px]', pad: 'p-2', radius: 'rounded-lg' },
  md: { h: 'h-11', gap: 'gap-1.5', num: 'text-xs', pill: 'text-[8px]', pad: 'p-2.5', radius: 'rounded-xl' },
  lg: { h: 'h-14', gap: 'gap-2', num: 'text-sm', pill: 'text-[9px]', pad: 'p-3', radius: 'rounded-xl' },
};

const DUAL_MIN_WIDTH = 760; // below this, always stack hostels — regardless of tab

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
  const [activeWingTab, setActiveWingTab] = useState('all');
  const [activeHostelGender, setActiveHostelGender] = useState(gender);

  const [containerRef, containerWidth] = useContainerWidth();

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
      toast.error(`Room ${room.room_number} is fully occupied (RED)!`);
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

  // ---- Layout math driven entirely by the MEASURED container ----
  const wantsDual = !isFemale && activeWingTab === 'all';
  const isDual = wantsDual && containerWidth >= DUAL_MIN_WIDTH;
  const singleColWidth = isDual ? (containerWidth - 24) / 2 : containerWidth;
  const bucket = useMemo(() => getBucket(singleColWidth), [singleColWidth]);
  const tc = TILE_CLASSES[bucket];
  const stackedTabs = containerWidth > 0 && containerWidth < 480;

  /* ------------------------------------------------------------------ */
  /*  Tile renderer                                                      */
  /* ------------------------------------------------------------------ */
  const renderTile = (room) => {
    const isSelectedRoom = selectedBed && selectedBed.room.id === room.id;
    const isFull = room.occupied_count === room.capacity;
    const isPartiallyBooked = room.occupied_count > 0 && !isFull;
    const freeBeds = room.capacity - room.occupied_count;

    let style =
      'bg-gradient-to-b from-emerald-700 to-emerald-950 text-emerald-50 border-emerald-400/70 shadow-[0_2px_10px_-2px_rgba(16,185,129,0.45)] hover:brightness-110 hover:-translate-y-0.5';

    if (isFull) {
      style =
        'bg-gradient-to-b from-red-800 to-red-950 text-red-100/90 border-red-500/70 cursor-not-allowed shadow-[0_2px_10px_-2px_rgba(239,68,68,0.35)] opacity-90';
    } else if (isPartiallyBooked) {
      style =
        'bg-gradient-to-b from-amber-600 to-amber-900 text-amber-50 border-amber-400/70 shadow-[0_2px_10px_-2px_rgba(245,158,11,0.4)] hover:brightness-110 hover:-translate-y-0.5';
    }

    if (isSelectedRoom) {
      style =
        'bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 text-black font-black border-white shadow-[0_0_0_2px_rgba(255,255,255,0.9),0_0_24px_rgba(245,158,11,0.85)] scale-[1.07] ring-0 z-20 motion-safe:animate-[pulse_2s_ease-in-out_infinite]';
    }

    return (
      <button
        key={room.id}
        type="button"
        disabled={isFull && !wardenMode}
        onClick={() => handleRoomClick(room)}
        aria-label={`Room ${room.room_number}, ${isFull ? 'fully occupied' : `${freeBeds} of ${room.capacity} beds free`}`}
        title={`Room ${room.room_number} • ${freeBeds} of ${room.capacity} beds available`}
        className={`w-full min-w-0 ${tc.h} ${tc.radius} ${tc.pad} border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 relative active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${style}`}
      >
        <span className={`${tc.num} font-mono font-black tracking-tight leading-none truncate max-w-full`}>
          {room.room_number}
        </span>
        {!isSelectedRoom && (
          <span className={`${tc.pill} opacity-80 font-bold font-mono leading-none truncate max-w-full`}>
            {isFull ? 'FULL' : `${freeBeds} FREE`}
          </span>
        )}
      </button>
    );
  };

  const renderPlaceholder = (num) => (
    <div
      key={num}
      className={`w-full min-w-0 ${tc.h} ${tc.radius} border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-center text-zinc-600 font-mono ${tc.num} font-bold`}
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
      const table = { 6: '100%', 4: '68%', 3: '54%', 2: '38%' };
      return table[count] || '100%';
    };

    return (
      <div key={floorTitle} className={`${tc.gap.replace('gap', 'space-y')} bg-[#12141d]/80 ${tc.pad} rounded-2xl border border-zinc-800/80 shadow-inner w-full min-w-0`}>
        <div className="flex items-center justify-center gap-2 py-0.5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
          <span className={`${bucket === 'xxs' ? 'text-[9px]' : 'text-[10px] sm:text-xs'} font-serif font-black uppercase tracking-[0.2em] text-[#e0b968] whitespace-nowrap px-1`}>
            ✦ {floorTitle} ✦
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
        </div>

        <div
          className={`grid ${tc.gap} w-full min-w-0`}
          style={{ gridTemplateColumns: `repeat(${topRooms.length}, minmax(0,1fr))` }}
        >
          {topRooms.map((num) => {
            const r = findRoom(blockPrefix, floorNum, num);
            return r ? renderTile(r) : renderPlaceholder(num);
          })}
        </div>

        <div
          className={`grid ${tc.gap} mx-auto w-full min-w-0`}
          style={{ gridTemplateColumns: `repeat(${midRooms.length}, minmax(0,1fr))`, maxWidth: rowWidth(midRooms.length) }}
        >
          {midRooms.map((num) => {
            const r = findRoom(blockPrefix, floorNum, num);
            return r ? renderTile(r) : renderPlaceholder(num);
          })}
        </div>

        <div
          className={`grid ${tc.gap} mx-auto w-full min-w-0`}
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
      <div key={floorTitle} className={`space-y-3 bg-[#170f1c]/70 ${tc.pad} rounded-2xl border border-pink-900/50 shadow-inner w-full min-w-0`}>
        <div className="flex items-center justify-center gap-2 py-0.5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-800 to-transparent" />
          <span className="text-[10px] sm:text-xs font-serif font-black uppercase tracking-[0.2em] text-pink-400 whitespace-nowrap px-1">
            ✦ {floorTitle} ✦
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-800 to-transparent" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 relative w-full min-w-0">
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-pink-500/10 via-pink-500/60 to-pink-500/10 shadow-[0_0_8px_rgba(236,72,153,0.5)] pointer-events-none" />

          {[leftRooms, rightRooms].map((wingRooms, i) => (
            <div className="space-y-2 min-w-0" key={i}>
              <div className="text-center text-[9px] sm:text-[10px] text-pink-300/80 font-mono font-black tracking-widest uppercase">
                {i === 0 ? 'LEFT WING' : 'RIGHT WING'}
              </div>
              <div className={`grid grid-cols-5 ${tc.gap} min-w-0`}>
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
  /*  Loading / empty states                                             */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="w-full min-h-[70vh] py-28 flex flex-col items-center justify-center gap-5 bg-[#0a0b0e]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-400 rounded-full motion-safe:animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-base">🏛️</div>
        </div>
        <p className="text-xs font-black tracking-[0.3em] uppercase bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent motion-safe:animate-pulse">
          Loading seat blueprint…
        </p>
      </div>
    );
  }

  if (!layoutData) {
    return (
      <div className="w-full min-h-[50vh] py-20 text-center bg-[#0a0b0e] text-zinc-400 px-4">
        <p className="font-bold text-base mb-4 text-zinc-300">Hostel layout blueprint is currently unavailable.</p>
        <button
          onClick={fetchLayout}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-xl text-xs uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          🔄 Reload layout
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Main render                                                        */
  /* ------------------------------------------------------------------ */
  return (
    <div
      ref={containerRef}
      className="w-full min-w-0 min-h-screen bg-[#0a0b0e] text-zinc-100 px-2 xs:px-3 sm:px-5 md:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 select-none box-border overflow-x-hidden font-sans"
    >
      {/* Header */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#181a24] via-[#12131b] to-[#0d0e13] border border-amber-500/20 p-4 sm:p-7 shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden text-center flex flex-col items-center">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[550px] max-w-[150%] h-36 bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-[#1e222f] border border-amber-500/30 text-[9px] sm:text-[11px] font-black tracking-widest text-amber-300 uppercase mb-3 shadow-md max-w-full">
          <span className="text-xs shrink-0">🏛️</span>
          <span className="truncate">GOVT. POLYTECHNIC BARH • HOSTEL SEAT BOOKING</span>
        </div>

        <h2 className="text-lg xs:text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight px-1">
          <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)]">
            {isFemale ? 'Savitribai Phule Girls Hostel' : 'Hostel Seat & Room Allocation'}
          </span>
        </h2>

        <p className="text-[10px] sm:text-xs md:text-sm text-zinc-400 mt-2 font-medium max-w-2xl leading-relaxed px-2">
          {isFemale
            ? 'Dual-wing corridor blueprint • 2 floors • Tap any available room to allocate a seat'
            : 'Birsa Munda Boys Hostel (left wing) & Dr. Rajendra Prasad Boys Hostel (right wing) • Tap a room to allocate'}
        </p>

        {/* Centered Glassmorphism VIP Status HUD Dock */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 mt-4 bg-[#11131c]/95 backdrop-blur-md px-3.5 sm:px-6 py-2 rounded-2xl border border-zinc-700/60 shadow-[0_8px_25px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-bold transition-transform hover:scale-105">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
            <span>All 3 Free</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold transition-transform hover:scale-105">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
            <span>1–2 Free</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-[10px] sm:text-xs font-bold transition-transform hover:scale-105">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
            <span>Full (Occupied)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-yellow-950/40 border border-yellow-400/50 text-yellow-300 text-[10px] sm:text-xs font-black transition-transform hover:scale-105">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,1)] animate-ping" />
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Blueprint matrix (Direct side-by-side or responsive stack - No Tab Bar) */}
      {!isFemale ? (
        <div className="w-full min-w-0">
          <div className={`grid gap-5 sm:gap-6 w-full min-w-0 ${isDual ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* ⬅️ BIRSA MUNDA BOYS HOSTEL */}
            <div className="w-full min-w-0 space-y-4 sm:space-y-6 bg-[#0f1118]/80 p-2.5 sm:p-5 rounded-3xl border border-zinc-800/90 shadow-xl transition-all duration-300 hover:border-amber-500/30">
              <div className="text-center py-2.5 px-2 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 rounded-2xl border border-amber-500/30 shadow-md">
                <h3 className="text-[11px] sm:text-sm lg:text-base font-serif tracking-[0.15em] sm:tracking-[0.25em] text-[#f59e0b] font-black uppercase leading-snug">
                  🏢 Birsa Munda Boys Hostel
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">{birsaVacant} beds available</p>
              </div>
              {BOYS_FLOORS.Birsa.map((floor) => renderBoysFloor('Birsa', floor))}
            </div>

            {/* ➡️ DR. RAJENDRA PRASAD BOYS HOSTEL */}
            <div className="w-full min-w-0 space-y-4 sm:space-y-6 bg-[#0f1118]/80 p-2.5 sm:p-5 rounded-3xl border border-zinc-800/90 shadow-xl transition-all duration-300 hover:border-amber-500/30">
              <div className="text-center py-2.5 px-2 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 rounded-2xl border border-amber-500/30 shadow-md">
                <h3 className="text-[11px] sm:text-sm lg:text-base font-serif tracking-[0.15em] sm:tracking-[0.25em] text-[#f59e0b] font-black uppercase leading-snug">
                  🏢 Dr. Rajendra Prasad Boys Hostel
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">{rajendraVacant} beds available</p>
              </div>
              {BOYS_FLOORS.Rajendra.map((floor) => renderBoysFloor('Rajendra', floor))}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto space-y-5 sm:space-y-8 bg-[#140e18]/80 p-3 sm:p-7 rounded-3xl border border-pink-900/40 shadow-2xl min-w-0">
          <div className="text-center py-3 px-2 bg-gradient-to-r from-pink-500/10 via-pink-500/20 to-pink-500/10 rounded-2xl border border-pink-500/30 shadow-md">
            <h3 className="text-[11px] sm:text-base font-serif tracking-[0.15em] sm:tracking-[0.25em] text-pink-400 font-black uppercase">
              🌸 Savitribai Phule Girls Hostel — full matrix
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">Dual-wing architecture • 2 floors</p>
          </div>
          {renderGirlsFloor(2, '2ND FLOOR')}
          {renderGirlsFloor(1, '1ST FLOOR')}
        </div>
      )}

      {/* Footer stats */}
      <div className="flex flex-col xs:flex-row flex-wrap items-center justify-between gap-2 xs:gap-3 pt-4 border-t border-zinc-800/80 text-[10px] sm:text-xs font-mono text-zinc-400 text-center xs:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-zinc-500">Live allotment capacity:</span>
          <span className="text-emerald-400 font-black">{availableBeds} vacant beds</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 font-bold">{totalBeds} total capacity</span>
        </div>
        <div className="text-zinc-500 text-[9px] sm:text-xs font-sans">
          Govt. Polytechnic Barh • Hostel Seat Booking System
        </div>
      </div>

      {/* Floating VIP booking drawer */}
      {!wardenMode && selectedBed && (
        <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94%] xs:w-[92%] max-w-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 duration-300">
          <div className="bg-[#15161f]/98 backdrop-blur-2xl border-2 border-amber-500/90 text-white rounded-2xl p-3.5 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs">🎟️</span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-amber-400/90 font-black">
                  Selected allotment
                </span>
              </div>
              <p className="text-sm sm:text-base font-black text-white truncate">
                Room <span className="text-amber-400 font-mono">{selectedBed.room.room_number}</span> • Bed{' '}
                <span className="text-amber-400 font-mono">{selectedBed.bed.bed_code}</span>
              </p>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate mt-0.5">
                {selectedBed.room.block_name || (isFemale ? 'Girls Hostel' : 'Boys Hostel')} • Floor{' '}
                {selectedBed.room.floor_number}
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedBed(null)}
                className="px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-bold text-zinc-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestAllotment}
                disabled={isSubmitting}
                className="px-3.5 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all active:scale-95 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full motion-safe:animate-spin" />
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
