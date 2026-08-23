// src/components/RoomAllocationGrid.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function RoomAllocationGrid({
  gender = 'MALE',
  studentId = null,
  wardenMode = false,
  onBedRequested = null,
  activeAllotment = null,
  isDarkMode = false
}) {
  const [activeFloor, setActiveFloor] = useState(0); // 0 = Ground, 1 = 1st, 2 = 2nd
  const [layoutData, setLayoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBed, setSelectedBed] = useState(null); // { room, bed }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeHostelGender, setActiveHostelGender] = useState(gender);

  useEffect(() => {
    setActiveHostelGender(gender);
  }, [gender]);

  const fetchLayout = async () => {
    setLoading(true);
    try {
      const g = activeHostelGender === 'FEMALE' ? 'FEMALE' : 'MALE';
      const url = `http://127.0.0.1:8000/api/hostels/grid?gender=${g}${studentId ? `&student_id=${studentId}` : ''}`;
      const response = await axios.get(url);
      setLayoutData(response.data);
    } catch (error) {
      console.error('Error fetching hostel layout:', error);
      toast.error('Failed to load hostel floor grid. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayout();
  }, [activeHostelGender, studentId]);

  const handleBedClick = (room, bed) => {
    if (wardenMode) return;
    if (activeAllotment && (activeAllotment.status === 'APPROVED' || activeAllotment.status === 'PENDING')) {
      toast.error(
        activeAllotment.status === 'APPROVED'
          ? 'You already have an approved room allotment!'
          : 'You already have a pending allotment request awaiting Warden approval.'
      );
      return;
    }
    if (bed.is_occupied) {
      toast.error(`Bed ${bed.bed_code} in Room ${room.room_number} is already occupied!`);
      return;
    }
    setSelectedBed({ room, bed });
  };

  const handleRequestAllotment = async () => {
    if (!selectedBed || !studentId) {
      toast.error('Please select an available bed first!');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/hostels/request-bed', {
        student_id: studentId,
        room_id: selectedBed.room.id,
        bed_id: selectedBed.bed.id
      });

      toast.success(response.data.message || 'Bed allotment request submitted successfully! ⏳', {
        duration: 5000,
        style: { borderRadius: '12px', background: '#0f172a', color: '#fff' }
      });
      setSelectedBed(null);
      fetchLayout();
      if (onBedRequested) onBedRequested();
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to submit bed request. Check server connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-500 animate-pulse uppercase tracking-wider">
          Loading {activeHostelGender === 'FEMALE' ? 'Girls Linear' : 'Boys H-Block'} Blueprint Grid...
        </p>
      </div>
    );
  }

  if (!layoutData) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <p className="text-gray-500 font-bold mb-4">Hostel Layout unavailable.</p>
        <button
          onClick={fetchLayout}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow hover:bg-blue-700"
        >
          Reload Layout
        </button>
      </div>
    );
  }

  const floorRooms = layoutData.rooms.filter((r) => r.floor_number === activeFloor);
  const leftWingRooms = floorRooms.filter((r) => r.wing === 'LEFT');
  const centerWingRooms = floorRooms.filter((r) => r.wing === 'CENTER');
  const rightWingRooms = floorRooms.filter((r) => r.wing === 'RIGHT');
  const linearRooms = floorRooms;

  // Floor stats
  const totalBedsOnFloor = floorRooms.length * 3;
  const occupiedBedsOnFloor = floorRooms.reduce((acc, r) => acc + r.occupied_count, 0);
  const availableBedsOnFloor = totalBedsOnFloor - occupiedBedsOnFloor;

  const isFemale = activeHostelGender === 'FEMALE' || layoutData.gender_type === 'FEMALE';

  return (
    <div className="w-full space-y-6">
      {/* 🌟 HOSTEL HEADER & FLOOR SWITCHER */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-5 md:p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl">{isFemale ? '👩🏢' : '👨🏢'}</span>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {layoutData.name}
            </h3>
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                isFemale
                  ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800'
                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
              }`}
            >
              {layoutData.shape_type === 'H_SHAPE' ? 'H-Shape Blueprint' : 'Linear Corridor Blueprint'}
            </span>
          </div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Cinema Seat Booking Architecture • 3 Beds per Room (Bed A, Bed B, Bed C)
          </p>
        </div>

        {/* FLOOR TABS */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-900/80 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
          {[
            { floor: 0, label: 'Ground Floor (G)' },
            { floor: 1, label: '1st Floor' },
            { floor: 2, label: '2nd Floor' }
          ].map((item) => (
            <button
              key={item.floor}
              onClick={() => {
                setActiveFloor(item.floor);
                setSelectedBed(null);
              }}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                activeFloor === item.floor
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/60 dark:border-gray-700 scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 STATUS LEGEND (CINEMA STYLE) */}
      <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-3.5 border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
        <div className="flex flex-wrap items-center gap-5">
          <span className="text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px]">Seat Legend:</span>
          
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 ring-2 ring-emerald-500/30"></span>
            <span className="text-gray-700 dark:text-gray-300">🟢 Available (0/3 Occupied)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-500 ring-2 ring-amber-500/30"></span>
            <span className="text-gray-700 dark:text-gray-300">🟡 Partially Booked (1-2/3 Occupied)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500 ring-2 ring-rose-500/30"></span>
            <span className="text-gray-700 dark:text-gray-300">🔴 Full (3/3 Occupied)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-blue-600 ring-2 ring-blue-400 shadow-sm"></span>
            <span className="text-gray-700 dark:text-gray-300">🔵 Selected / Awaiting Approval</span>
          </div>
        </div>

        <div className="text-[11px] font-extrabold text-gray-500 dark:text-gray-400">
          Floor Stats: <span className="text-emerald-600 dark:text-emerald-400">{availableBedsOnFloor} Vacant</span> / {totalBedsOnFloor} Total Beds
        </div>
      </div>

      {/* 🌟 ACTIVE ALLOTMENT BANNER IF ANY */}
      {activeAllotment && activeAllotment.status === 'PENDING' && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg animate-pulse">
              ⏳
            </div>
            <div>
              <p className="text-xs font-black uppercase text-blue-700 dark:text-blue-300 tracking-wider">
                Allotment Request Pending Warden Approval
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Requested: Room <span className="text-blue-600 dark:text-blue-400">{activeAllotment.room_number}</span> (Bed {activeAllotment.bed_code})
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
            Pending Review
          </span>
        </div>
      )}

      {activeAllotment && activeAllotment.status === 'APPROVED' && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <div>
              <p className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-300 tracking-wider">
                Bed Allotment Confirmed by Warden
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Allocated: Room <span className="text-emerald-600 dark:text-emerald-400">{activeAllotment.room_number}</span> (Bed {activeAllotment.bed_code}) • {activeAllotment.hostel_name}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
            Allotted & Active
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 BLUEPRINT RENDERER: BOYS (H-SHAPE) vs GIRLS (LINEAR) */}
      {/* ========================================================================= */}

      {!isFemale ? (
        /* ================= 1. BOYS HOSTEL (H-SHAPE BLUEPRINT) ================= */
        <div className="relative bg-slate-900 rounded-3xl p-6 md:p-8 border-2 border-slate-700 shadow-2xl text-white overflow-x-auto">
          {/* Architectural Blueprint Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 rounded-3xl pointer-events-none"></div>

          {/* Blueprint Title Banner */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-blue-900/60 border border-blue-500/50 text-[11px] font-black uppercase tracking-widest text-blue-300">
                Architectural H-Block Layout
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Floor {activeFloor === 0 ? '0 (Ground)' : activeFloor} • 9 Triple Rooms
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-400">
              <span>⬅️ Birsa Munda Block (101-103)</span>
              <span>↔️ Central Connector (104-106)</span>
              <span>➡️ Dr. Rajendra Prasad Block (107-109)</span>
            </div>
          </div>

          {/* H-SHAPE GRID CONTAINER */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 min-w-[760px]">
            {/* LEFT WING (COLUMN 1 OF 'H') - BIRSA MUNDA BLOCK */}
            <div className="space-y-4 bg-slate-800/80 rounded-2xl p-4 border border-slate-700 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                  🏢 Birsa Munda Block (Left Wing)
                </span>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded font-mono">
                  {leftWingRooms.length} Rooms
                </span>
              </div>
              <div className="space-y-4">
                {leftWingRooms.map((room) => renderRoomCard(room))}
              </div>
            </div>

            {/* CENTRAL CONNECTOR / COURTYARD (BRIDGE OF 'H') */}
            <div className="space-y-4 flex flex-col justify-between">
              {/* North Garden / Open Space */}
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl p-3 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
                <span>🌿</span> North Courtyard &amp; Lawn <span>🌿</span>
              </div>

              {/* Central Rooms Corridor */}
              <div className="space-y-4 bg-slate-800/80 rounded-2xl p-4 border border-slate-700 shadow-lg my-auto">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                    🏛️ Central Corridor
                  </span>
                  <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded font-mono">
                    {centerWingRooms.length} Rooms
                  </span>
                </div>
                <div className="space-y-4">
                  {centerWingRooms.map((room) => renderRoomCard(room))}
                </div>
              </div>

              {/* South Garden / Open Space */}
              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl p-3 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-2">
                <span>🌳</span> South Garden &amp; Badminton Court <span>🌳</span>
              </div>
            </div>

            {/* RIGHT WING (COLUMN 2 OF 'H') - DR. RAJENDRA PRASAD BLOCK */}
            <div className="space-y-4 bg-slate-800/80 rounded-2xl p-4 border border-slate-700 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                  🏢 Dr. Rajendra Prasad Block (Right Wing)
                </span>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded font-mono">
                  {rightWingRooms.length} Rooms
                </span>
              </div>
              <div className="space-y-4">
                {rightWingRooms.map((room) => renderRoomCard(room))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= 2. GIRLS HOSTEL (SAVITRIBAI PHULE GIRLS HOSTEL) ================= */
        <div className="relative bg-slate-900 rounded-3xl p-6 md:p-8 border-2 border-slate-700 shadow-2xl text-white overflow-x-auto">
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40 rounded-3xl pointer-events-none"></div>

          {/* Linear Blueprint Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-pink-900/60 border border-pink-500/50 text-[11px] font-black uppercase tracking-widest text-pink-300">
                🌸 Savitribai Phule Girls Hostel
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Floor {activeFloor === 0 ? '0 (Ground)' : activeFloor} • 8 Triple Rooms
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
              <span>🚶‍♀️ Central Walkway Corridor • Rooms 101 - 108</span>
            </div>
          </div>

          {/* LINEAR ROOMS GRID (PARALLEL ROWS ALONG CORRIDOR) */}
          <div className="relative z-10 space-y-6 min-w-[760px]">
            {/* ROW 1: ROOMS 101 - 104 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {linearRooms.slice(0, 4).map((room) => renderRoomCard(room))}
            </div>

            {/* ILLUMINATED CENTRAL CORRIDOR WALKWAY */}
            <div className="py-2.5 px-6 rounded-xl bg-slate-800 border border-pink-500/30 flex items-center justify-between text-xs font-bold text-slate-300 shadow-inner">
              <span>🚪 West Entry & Staircase</span>
              <span className="tracking-widest uppercase text-pink-400 font-black">
                ✨ Main Illuminated Walkway Corridor ✨
              </span>
              <span>🚪 East Fire Exit & Balcony</span>
            </div>

            {/* ROW 2: ROOMS 105 - 108 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {linearRooms.slice(4, 8).map((room) => renderRoomCard(room))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 SELECTED BED ACTION CARD (STUDENT BOOKING DRAWER) */}
      {/* ========================================================================= */}
      {!wardenMode && selectedBed && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl bg-slate-900/95 backdrop-blur-xl border-2 border-blue-500 text-white rounded-3xl p-5 md:p-6 shadow-2xl shadow-blue-950/80 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-600/40 shrink-0">
                🛏️
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-800">
                  Ready to Request Allotment
                </span>
                <h4 className="text-lg md:text-xl font-black text-white mt-0.5">
                  Room {selectedBed.room.room_number} • Bed {selectedBed.bed.bed_code}
                </h4>
                <p className="text-xs text-slate-300 flex items-center gap-3 mt-1">
                  <span>🪑 Study Chair</span>
                  <span>🖥️ Study Desk</span>
                  <span>🔒 Personal Locker</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setSelectedBed(null)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestAllotment}
                disabled={isSubmitting}
                className="flex-1 md:flex-initial px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <span>Request Bed Allotment 🚀</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ---------------------------------------------------------
  // HELPER: RENDER ROOM CARD (CINEMA STYLE)
  // ---------------------------------------------------------
  function renderRoomCard(room) {
    const isSelectedRoom = selectedBed && selectedBed.room.id === room.id;

    // Status styling
    let statusBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    let statusText = 'Vacant';
    let roomBorder = 'border-slate-700 hover:border-slate-500';

    if (room.occupied_count === room.capacity) {
      statusBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      statusText = 'Full (3/3)';
      roomBorder = 'border-rose-900/40';
    } else if (room.occupied_count > 0) {
      statusBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      statusText = `${room.occupied_count}/${room.capacity} Booked`;
      roomBorder = 'border-amber-900/40';
    }

    if (isSelectedRoom) {
      roomBorder = 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
    }

    return (
      <div
        key={room.id}
        className={`bg-slate-900/90 rounded-2xl p-3.5 border-2 transition-all duration-200 ${roomBorder}`}
      >
        {/* ROOM TOP HEADER */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-white tracking-wide">
              🚪 Room {room.room_number}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              ({room.wing} Wing)
            </span>
          </div>

          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${statusBadgeColor}`}>
            {statusText}
          </span>
        </div>

        {/* 3 BEDS ROW (BED A, BED B, BED C) */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {room.beds.map((bed) => {
            const isBedSelected = selectedBed && selectedBed.bed.id === bed.id;
            const isPendingForMe = bed.pending_request_by_me;
            const isOccupied = bed.is_occupied;

            // Bed button style
            let bedBtnBg = 'bg-slate-800 hover:bg-emerald-900/40 border-emerald-600/50 text-emerald-300';
            let bedStatusLabel = 'Vacant';
            let bedIcon = '🛏️';

            if (isOccupied) {
              bedBtnBg = 'bg-slate-800/60 border-slate-700 text-slate-500 cursor-not-allowed opacity-75';
              bedStatusLabel = bed.current_student_name ? bed.current_student_name.split(' ')[0] : 'Occupied';
              bedIcon = '🔒';
            } else if (isPendingForMe) {
              bedBtnBg = 'bg-blue-900/80 border-blue-400 text-blue-200 ring-2 ring-blue-500 shadow-md';
              bedStatusLabel = 'Pending';
              bedIcon = '⏳';
            } else if (isBedSelected) {
              bedBtnBg = 'bg-blue-600 border-white text-white scale-105 shadow-lg shadow-blue-600/60';
              bedStatusLabel = 'Selected';
              bedIcon = '✓';
            }

            return (
              <button
                key={bed.id}
                type="button"
                disabled={isOccupied && !wardenMode}
                onClick={() => handleBedClick(room, bed)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-200 text-center relative group ${bedBtnBg}`}
                title={
                  isOccupied
                    ? `Bed ${bed.bed_code} is occupied by ${bed.current_student_name || 'Student'}`
                    : `Click to select Bed ${bed.bed_code}`
                }
              >
                <span className="text-lg mb-0.5">{bedIcon}</span>
                <span className="text-xs font-black tracking-wider">Bed {bed.bed_code}</span>
                <span className="text-[9px] font-bold uppercase truncate max-w-[70px] mt-0.5 opacity-90">
                  {bedStatusLabel}
                </span>

                {/* WARDEN MODE: STUDENT NAME HOVER TOOLTIP */}
                {wardenMode && bed.current_student_name && (
                  <span className="absolute -top-7 bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap hidden group-hover:block z-20">
                    🧑‍🎓 {bed.current_student_name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ROOM AMENITIES ICONS */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-2 px-1">
          <span className="flex items-center gap-1">🪑 Desk/Chair</span>
          <span className="flex items-center gap-1">🗄️ Locker</span>
          <span className="flex items-center gap-1">📶 Wi-Fi</span>
        </div>
      </div>
    );
  }
}

export default RoomAllocationGrid;
