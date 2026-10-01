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

/* ------------------------------------------------------------------ */
/*  Default Layout Factory (Ensures zero blank screens or glitches)    */
/* ------------------------------------------------------------------ */
const generateDefaultLayout = (genderType) => {
  const isFem = String(genderType).toUpperCase() === 'FEMALE';
  if (isFem) {
    const rooms = [];
    let idCounter = 1;
    [2, 1].forEach((floorNum) => {
      for (let i = 1; i <= 20; i++) {
        const roomNum = `${floorNum}${String(i).padStart(2, '0')}`;
        rooms.push({
          id: idCounter++,
          room_number: roomNum,
          floor_number: floorNum,
          capacity: 3,
          occupied_count: 0,
          block_name: 'Savitribai Phule Girls Hostel',
          wing: i <= 10 ? 'LEFT' : 'RIGHT',
          beds: [
            { id: (idCounter - 1) * 3 + 1, bed_code: 'A', is_occupied: false, current_student_id: null, pending_request_by_me: false },
            { id: (idCounter - 1) * 3 + 2, bed_code: 'B', is_occupied: false, current_student_id: null, pending_request_by_me: false },
            { id: (idCounter - 1) * 3 + 3, bed_code: 'C', is_occupied: false, current_student_id: null, pending_request_by_me: false },
          ],
        });
      }
    });
    return {
      hostel_name: 'Savitribai Phule Girls Hostel',
      gender_type: 'FEMALE',
      total_rooms: 40,
      total_beds: 120,
      occupied_beds: 0,
      vacant_beds: 120,
      rooms,
    };
  }

  // Boys Hostel
  const rooms = [];
  let idCounter = 1;
  // Birsa Munda
  BOYS_FLOORS.Birsa.forEach((floor) => {
    const allRooms = [...floor.topRooms, ...floor.midRooms, ...floor.botRooms];
    allRooms.forEach((rNum) => {
      rooms.push({
        id: idCounter++,
        room_number: String(rNum),
        floor_number: floor.floorNum,
        capacity: 3,
        occupied_count: 0,
        block_name: 'Birsa Munda Boys Hostel',
        wing: 'BIRSA',
        beds: [
          { id: (idCounter - 1) * 3 + 1, bed_code: 'A', is_occupied: false, current_student_id: null, pending_request_by_me: false },
          { id: (idCounter - 1) * 3 + 2, bed_code: 'B', is_occupied: false, current_student_id: null, pending_request_by_me: false },
          { id: (idCounter - 1) * 3 + 3, bed_code: 'C', is_occupied: false, current_student_id: null, pending_request_by_me: false },
        ],
      });
    });
  });

  // Dr. Rajendra Prasad
  BOYS_FLOORS.Rajendra.forEach((floor) => {
    const allRooms = [...floor.topRooms, ...floor.midRooms, ...floor.botRooms];
    allRooms.forEach((rNum) => {
      rooms.push({
        id: idCounter++,
        room_number: String(rNum),
        floor_number: floor.floorNum,
        capacity: 3,
        occupied_count: 0,
        block_name: 'Dr. Rajendra Prasad Boys Hostel',
        wing: 'RAJENDRA',
        beds: [
          { id: (idCounter - 1) * 3 + 1, bed_code: 'A', is_occupied: false, current_student_id: null, pending_request_by_me: false },
          { id: (idCounter - 1) * 3 + 2, bed_code: 'B', is_occupied: false, current_student_id: null, pending_request_by_me: false },
          { id: (idCounter - 1) * 3 + 3, bed_code: 'C', is_occupied: false, current_student_id: null, pending_request_by_me: false },
        ],
      });
    });
  });

  return {
    hostel_name: 'Govt. Polytechnic Barh Boys Hostel',
    gender_type: 'MALE',
    total_rooms: 67,
    total_beds: 201,
    occupied_beds: 0,
    vacant_beds: 201,
    rooms,
  };
};

function RoomAllocationGrid({
  gender = 'MALE',
  studentId = null,
  wardenMode = false,
  onBedRequested = null,
  activeAllotment = null,
  upgradeMode = false,
  onCancelUpgrade = null,
  isDarkMode = true,
}) {
  const normGender = String(gender).toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE';
  const [activeHostelGender, setActiveHostelGender] = useState(normGender);
  const [layoutData, setLayoutData] = useState(() => generateDefaultLayout(normGender));
  const [loading, setLoading] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [activeRoomModal, setActiveRoomModal] = useState(null);
  const [selectedBedLetter, setSelectedBedLetter] = useState('A');
  const [requestSentInfo, setRequestSentInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sceneWrapRef = React.useRef(null);
  const roomElRef = React.useRef(null);

  useEffect(() => {
    const g = String(gender).toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE';
    setActiveHostelGender(g);
    setLayoutData((prev) => (prev && prev.rooms?.length ? prev : generateDefaultLayout(g)));
  }, [gender]);

  const fetchLayout = useCallback(async () => {
    try {
      const g = activeHostelGender === 'FEMALE' ? 'FEMALE' : 'MALE';
      const url = `http://127.0.0.1:8000/api/hostels/grid?gender=${g}${studentId ? `&student_id=${studentId}` : ''}`;
      const response = await axios.get(url, { timeout: 4000 });
      if (response?.data && response.data.rooms && response.data.rooms.length > 0) {
        setLayoutData(response.data);
      }
    } catch (error) {
      console.error('Error fetching layout:', error);
    }
  }, [activeHostelGender, studentId]);

  useEffect(() => {
    fetchLayout();
    const interval = setInterval(fetchLayout, 10000);
    return () => clearInterval(interval);
  }, [fetchLayout]);


  const handleRoomClick = (room) => {
    if (wardenMode) return;
    if (activeAllotment && activeAllotment.status === 'APPROVED' && !upgradeMode) {
      toast.error('You already have an approved room allotment! Click "Request Room / Seat Change" if you wish to upgrade/change your room.');
      return;
    }
    if (activeAllotment && activeAllotment.status === 'PENDING' && !upgradeMode) {
      toast.error('You already have a pending allotment request awaiting Warden approval.');
      return;
    }

    const roomBeds = (room.beds && room.beds.length > 0)
      ? room.beds
      : [
          { id: `${room.id}-A`, bed_code: 'A', is_occupied: false },
          { id: `${room.id}-B`, bed_code: 'B', is_occupied: false },
          { id: `${room.id}-C`, bed_code: 'C', is_occupied: false },
        ];
    const safeRoom = { ...room, beds: roomBeds };

    const availableBed = roomBeds.find((b) => !b.is_occupied);
    if (!availableBed) {
      toast.error(`Room ${room.room_number} is fully occupied!`);
      return;
    }

    // Open Interior Room View Modal
    setActiveRoomModal(safeRoom);
    setSelectedBedLetter(availableBed.bed_code || 'A');
    setSelectedBed({ room: safeRoom, bed: availableBed });
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

  const getRoomKey = (r) => {
    if (!r) return '';
    const blockKey = (r.block_name || r.wing || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${r.id || ''}_${blockKey}_${r.room_number || ''}`;
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
      const resolvedHostelId = activeRoomModal.hostel_id || 
        (activeRoomModal.block_name?.includes('Birsa') ? 1 : 
        (activeRoomModal.block_name?.includes('Rajendra') ? 2 : 3));

      const payload = {
        student_id: studentId,
        hostel_id: resolvedHostelId,
        room_id: activeRoomModal.id,
        bed_id: bedToRequest.id,
        bed_code: selectedBedLetter,
        request_type: upgradeMode ? 'UPGRADE' : 'NEW',
      };

      const response = await axios.post('http://127.0.0.1:8000/api/allotment/request', payload);

      const msg = response.data.message || (upgradeMode ? 'Room upgrade request submitted successfully! 🔄' : 'Seat allotment request submitted successfully! 🎟️');
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

      setRequestSentInfo(
        upgradeMode
          ? `Upgrade requested for Room ${activeRoomModal.room_number}(${selectedBedLetter}) — Awaiting Warden Approval`
          : `Request sent for Room ${activeRoomModal.room_number}(${selectedBedLetter}) — Awaiting Warden Approval`
      );
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
  /*  Dual-Theme High-Contrast Room Card Design                         */
  /* ------------------------------------------------------------------ */
  const renderTile = (room) => {
    const isPendingForMe = room.beds?.some((b) => b.pending_request_by_me);
    const isMyAllottedRoom =
      activeAllotment &&
      String(activeAllotment.room_number) === String(room.room_number) &&
      (!activeAllotment.hostel_name ||
        room.block_name?.toLowerCase().includes(activeAllotment.hostel_name?.toLowerCase().split(' ')[0] || ''));

    const isSelectedRoom =
      (selectedBed?.room && (selectedBed.room.id === room.id || getRoomKey(selectedBed.room) === getRoomKey(room))) ||
      (activeRoomModal && (activeRoomModal.id === room.id || getRoomKey(activeRoomModal) === getRoomKey(room))) ||
      isPendingForMe ||
      isMyAllottedRoom;

    const isFull = room.occupied_count === room.capacity;
    const isPartiallyBooked = room.occupied_count > 0 && !isFull;
    const freeBeds = Math.max(0, room.capacity - (room.occupied_count || 0));

    let statusClass = '';
    if (isFull) {
      statusClass = 'full';
    } else if (isPartiallyBooked) {
      statusClass = 'partial';
    }

    if (isSelectedRoom) {
      statusClass += ' selected';
    }

    return (
      <div
        key={room.id}
        data-room={room.room_number}
        disabled={isFull && !wardenMode}
        onClick={() => handleRoomClick(room)}
        aria-label={`Room ${room.room_number}, ${isFull ? 'fully occupied' : `${freeBeds} of ${room.capacity} beds free`}`}
        title={`Room ${room.room_number} • ${freeBeds} of ${room.capacity} beds available`}
        className={`room ${statusClass.trim()}`}
      >
        <div className="room-label">Room</div>
        <div className="room-number">{room.room_number}</div>
      </div>
    );
  };

  const renderPlaceholder = (num) => (
    <div key={num} className="room invisible pointer-events-none" style={{ visibility: 'hidden' }}>
      <div className="room-label">Room</div>
      <div className="room-number">{num}</div>
    </div>
  );

  const findRoom = (blockPrefix, floorNum, num) =>
    rooms.find(
      (r) =>
        r.room_number === String(num) &&
        r.floor_number === floorNum &&
        (r.block_name?.toLowerCase().includes(blockPrefix.toLowerCase()) || r.wing?.includes(blockPrefix.toUpperCase()))
    );

  const renderBoysFloor = (blockPrefix, floor) => {
    const { floorTitle, floorNum, topRooms, midRooms, botRooms } = floor;
    const allFloorRooms = [...topRooms, ...midRooms, ...botRooms];

    return (
      <div key={floorTitle} className="floor-block">
        <div className="floor-label">
          <div className="line"></div>
          <div className="pill">✦ {floorTitle} ✦</div>
          <div className="line"></div>
        </div>
        <div className="room-grid">
          {allFloorRooms.map((num) => {
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
    const findGirlRoom = (num) => rooms.find((r) => r.room_number === String(num) && r.floor_number === floorNum);

    return (
      <div key={floorTitle} className="floor-block">
        <div className="floor-label">
          <div className="line"></div>
          <div className="pill">✦ {floorTitle} ✦</div>
          <div className="line"></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: 'var(--gold-dark)', textTransform: 'uppercase', marginBottom: '8px' }}>
              LEFT WING
            </div>
            <div className="room-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {leftRooms.map((num) => {
                const r = findGirlRoom(num);
                return r ? renderTile(r) : renderPlaceholder(num);
              })}
            </div>
          </div>
          <div>
            <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: 'var(--gold-dark)', textTransform: 'uppercase', marginBottom: '8px' }}>
              RIGHT WING
            </div>
            <div className="room-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {rightRooms.map((num) => {
                const r = findGirlRoom(num);
                return r ? renderTile(r) : renderPlaceholder(num);
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------------------------------------------------ */
  /*  MAIN RENDER                                                       */
  /* ------------------------------------------------------------------ */
  return (
    <div className="hostel-page-wrapper">
      <style>{`
        .hostel-page-wrapper {
          --bg: ${isDarkMode ? '#0f1117' : '#eef1f6'};
          --cream: ${isDarkMode ? '#161922' : '#fffdf7'};
          --gold: ${isDarkMode ? '#d4a843' : '#e7c565'};
          --gold-dark: ${isDarkMode ? '#e5b84c' : '#b8860b'};
          --gold-text: ${isDarkMode ? '#d8a738' : '#a9700f'};
          --brown-text: ${isDarkMode ? '#ecd39a' : '#6b4b1f'};
          --ink: ${isDarkMode ? '#e8edf5' : '#22262e'};
          --available-bg: ${isDarkMode ? '#0b3823' : '#e7f9ef'};
          --available-border: ${isDarkMode ? '#1f8a4c' : '#7bd8a0'};
          --available-text: ${isDarkMode ? '#4ade80' : '#1f8a4c'};
          --partial: #f0a93b;
          --full: #ef5f7a;
          --selected: #e2a52a;
          --muted: ${isDarkMode ? '#9ca3af' : '#8a93a3'};
          --radius-lg: 22px;
          --radius-md: 14px;
          --radius-sm: 10px;
          
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif;
          color: var(--ink);
          box-sizing: border-box;
        }

        .hostel-page-wrapper * { box-sizing: border-box; }

        /* ---------- Header ---------- */
        .hostel-page-wrapper .header-card {
          background: var(--cream);
          border: 1px solid var(--gold);
          border-radius: var(--radius-lg);
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          box-shadow: 0 2px 10px rgba(184,134,11,0.06);
          margin-bottom: 20px;
        }

        .hostel-page-wrapper .header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .hostel-page-wrapper .header-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: ${isDarkMode ? '#24211a' : '#fdf3d9'};
          border: 1px solid var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: var(--gold-dark);
        }

        .hostel-page-wrapper .header-eyebrow {
          font-size: 11px;
          letter-spacing: 1px;
          color: var(--gold-text);
          font-weight: 700;
          text-transform: uppercase;
        }

        .hostel-page-wrapper .header-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--ink);
          margin-top: 2px;
        }
        .hostel-page-wrapper .header-title b { color: var(--gold-dark); }

        .hostel-page-wrapper .legend {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          font-weight: 600;
          color: ${isDarkMode ? '#cbd5e1' : '#444'};
          flex-wrap: wrap;
        }
        .hostel-page-wrapper .legend span { display: flex; align-items: center; gap: 6px; }
        .hostel-page-wrapper .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        .hostel-page-wrapper .dot.available { background: var(--available-text); }
        .hostel-page-wrapper .dot.partial { background: var(--partial); }
        .hostel-page-wrapper .dot.full { background: var(--full); }
        .hostel-page-wrapper .dot.selected { background: var(--selected); }
        .hostel-page-wrapper .legend-sep { color: #cfd4dc; }

        /* ---------- Hostel columns ---------- */
        .hostel-page-wrapper .hostels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .hostel-page-wrapper .hostel-card {
          background: var(--cream);
          border: 1px solid var(--gold);
          border-radius: var(--radius-lg);
          padding: 18px;
        }

        .hostel-page-wrapper .hostel-banner {
          background: ${isDarkMode ? '#22231b' : '#fdf6dd'};
          border: 1px solid var(--gold);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .hostel-page-wrapper .hostel-banner .bed-icon { font-size: 18px; }
        .hostel-page-wrapper .hostel-name {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: .3px;
          color: var(--gold-dark);
          text-transform: uppercase;
        }
        .hostel-page-wrapper .hostel-sub {
          font-size: 12px;
          color: ${isDarkMode ? '#d1b888' : '#9a8355'};
          margin-top: 2px;
        }
        .hostel-page-wrapper .hostel-sub b { color: var(--available-text); }

        .hostel-page-wrapper .floor-block {
          border: 1px solid var(--gold);
          border-radius: var(--radius-md);
          padding: 14px;
          margin-bottom: 14px;
        }

        .hostel-page-wrapper .floor-label {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
          margin-bottom: 14px;
        }
        .hostel-page-wrapper .floor-label .line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
        .hostel-page-wrapper .floor-label .pill {
          background: ${isDarkMode ? '#3b2f15' : '#fbe8ae'};
          border: 1px solid var(--gold);
          color: var(--brown-text);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 4px 12px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .hostel-page-wrapper .room-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }

        .hostel-page-wrapper .room {
          background: var(--available-bg);
          border: 1px solid var(--available-border);
          border-radius: var(--radius-sm);
          padding: 7px 4px;
          text-align: center;
          cursor: pointer;
          transition: transform .12s ease, box-shadow .12s ease;
          user-select: none;
        }
        .hostel-page-wrapper .room:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,.06); }
        .hostel-page-wrapper .room .room-label {
          font-size: 9px;
          letter-spacing: .5px;
          font-weight: 700;
          color: var(--available-text);
          text-transform: uppercase;
        }
        .hostel-page-wrapper .room .room-number {
          font-size: 14px;
          font-weight: 800;
          color: var(--ink);
        }

        .hostel-page-wrapper .room.partial {
          background: ${isDarkMode ? '#3d2508' : '#fff3de'};
          border-color: ${isDarkMode ? '#a16207' : '#f0c47f'};
        }
        .hostel-page-wrapper .room.partial .room-label { color: ${isDarkMode ? '#fde047' : '#b5791a'}; }

        .hostel-page-wrapper .room.full {
          background: ${isDarkMode ? '#3c1118' : '#fdeaee'};
          border-color: ${isDarkMode ? '#9f1239' : '#f3a9b8'};
          cursor: not-allowed;
          opacity: .85;
        }
        .hostel-page-wrapper .room.full .room-label { color: ${isDarkMode ? '#fca5a5' : '#c33959'}; }

        .hostel-page-wrapper .room.selected {
          background: ${isDarkMode ? '#4a370b' : '#fdeecb'};
          border-color: var(--selected);
          box-shadow: 0 0 0 2px rgba(226,165,42,.6);
          transform: translateY(-2px) scale(1.02);
        }
        .hostel-page-wrapper .room.selected .room-label { color: var(--gold-dark); }

        /* ---------- Footer status ---------- */
        .hostel-page-wrapper .footer-bar {
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 12px;
          color: var(--muted);
          padding: 6px 4px;
        }
        .hostel-page-wrapper .footer-bar b { color: var(--available-text); }

        /* ---------- Responsive ---------- */
        @media (max-width: 900px) {
          .hostel-page-wrapper .hostels { grid-template-columns: 1fr; }
          .hostel-page-wrapper .header-card { flex-direction: column; align-items: flex-start; }
        }

        @media (max-width: 480px) {
          .hostel-page-wrapper .room-grid { grid-template-columns: repeat(3, 1fr); }
          .hostel-page-wrapper .header-title { font-size: 17px; }
          .hostel-page-wrapper .legend { gap: 10px; font-size: 12px; }
        }
      `}</style>

      {/* Upgrade Mode Banner */}
      {upgradeMode && (
        <div style={{
          background: isDarkMode ? '#291e0a' : '#fffbeb',
          border: '2px solid #f59e0b',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(245,158,11,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '24px' }}>🔄</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: isDarkMode ? '#fbbf24' : '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Room / Seat Upgrade Mode (कमरा परिवर्तन मोड)
              </div>
              <div style={{ fontSize: '12px', color: isDarkMode ? '#fde68a' : '#92400e', marginTop: '3px' }}>
                Currently Allotted: <strong>Room {activeAllotment?.room_number || '101'} • Bed {activeAllotment?.bed_code || 'A'}</strong>. Choose any available green room &amp; bed below to submit an upgrade request. Your current room remains active until Warden approves.
              </div>
            </div>
          </div>
          {onCancelUpgrade && (
            <button
              type="button"
              onClick={onCancelUpgrade}
              style={{
                background: isDarkMode ? '#1e293b' : '#e2e8f0',
                border: '1px solid #94a3b8',
                color: isDarkMode ? '#f8fafc' : '#334155',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel Upgrade ✕
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="header-card">
        <div className="header-left">
          <div className="header-icon">{upgradeMode ? '🔄' : '🛏️'}</div>
          <div>
            <div className="header-eyebrow">GOVT. POLYTECHNIC BARH &nbsp;•&nbsp; {upgradeMode ? 'SEAT CHANGE & UPGRADE' : 'HOSTEL SEAT ALLOCATION'}</div>
            <div className="header-title">
              {isFemale ? (
                <>Savitribai Phule <b>Girls Hostel</b></>
              ) : (
                <>Hostel Seat &amp; Room <b>{upgradeMode ? 'Upgrade Selection' : 'Allocation'}</b></>
              )}
            </div>
          </div>
        </div>
        <div className="legend">
          <span><i className="dot available"></i>Available</span>
          <span className="legend-sep">•</span>
          <span><i className="dot partial"></i>Partial</span>
          <span className="legend-sep">•</span>
          <span><i className="dot full"></i>Full</span>
          <span className="legend-sep">•</span>
          <span><i className="dot selected"></i>Selected</span>
        </div>
      </div>

      {/* Hostels */}
      {!isFemale ? (
        <div className="hostels">
          {/* Birsa Munda Boys Hostel */}
          <div className="hostel-card">
            <div className="hostel-banner">
              <span className="bed-icon">🛏️</span>
              <div>
                <div className="hostel-name">Birsa Munda Boys Hostel</div>
                <div className="hostel-sub">
                  <b>{birsaVacant}</b> beds available • {birsaTotalBeds} Total Beds
                </div>
              </div>
            </div>
            {BOYS_FLOORS.Birsa.map((floor) => renderBoysFloor('Birsa', floor))}
          </div>

          {/* Dr. Rajendra Prasad Boys Hostel */}
          <div className="hostel-card">
            <div className="hostel-banner">
              <span className="bed-icon">🛏️</span>
              <div>
                <div className="hostel-name">Dr. Rajendra Prasad Boys Hostel</div>
                <div className="hostel-sub">
                  <b>{rajendraVacant}</b> beds available • {rajendraTotalBeds} Total Beds
                </div>
              </div>
            </div>
            {BOYS_FLOORS.Rajendra.map((floor) => renderBoysFloor('Rajendra', floor))}
          </div>
        </div>
      ) : (
        /* Girls Hostel */
        <div className="hostel-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="hostel-banner">
            <span className="bed-icon">🛏️</span>
            <div>
              <div className="hostel-name">Savitribai Phule Girls Hostel</div>
              <div className="hostel-sub">
                <b>{availableBeds}</b> beds available • {totalBeds} Total Beds
              </div>
            </div>
          </div>
          {renderGirlsFloor(2, '2ND FLOOR')}
          {renderGirlsFloor(1, '1ST FLOOR')}
        </div>
      )}

      {/* Footer */}
      <div className="footer-bar">
        <div>
          Live Status: <b>{availableBeds}</b> Vacant Beds / <span>{totalBeds}</span> Total Capacity
        </div>
        <div>Govt. Polytechnic Barh • Hostel Management System</div>
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
                        <span>{upgradeMode ? 'Submitting Upgrade Request…' : 'Submitting Request to Warden…'}</span>
                      </>
                    ) : (
                      <>
                        <span>{upgradeMode ? `Confirm & Request Upgrade to Room ${activeRoomModal.room_number}(${selectedBedLetter})` : `Confirm & Book Seat ${activeRoomModal.room_number}(${selectedBedLetter})`}</span>
                        <span className="text-xs sm:text-sm font-bold">➔</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 py-0.5">
                  <div className={`font-bold text-xs sm:text-sm flex items-center gap-1.5 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
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
