// src/pages/WardenDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png.png';
import toast, { Toaster } from 'react-hot-toast';
import RoomAllocationGrid from '../components/RoomAllocationGrid';

function WardenDashboard() {
  const [activeNavTab, setActiveNavTab] = useState('allocations'); // 'allocations', 'analytics', 'leaves', 'fees', 'directory'
  const [allocationSubTab, setAllocationSubTab] = useState('pending'); // 'boys', 'girls', 'pending'
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Analytics State
  const [analytics, setAnalytics] = useState({
    total_capacity: 153,
    total_occupied: 42,
    occupancy_pct: 27.5,
    boys_total: 81,
    boys_occupied: 28,
    boys_occupancy_pct: 34.6,
    girls_total: 72,
    girls_occupied: 14,
    girls_occupancy_pct: 19.4,
    pending_requests_count: 3,
    total_pending_dues: 189000
  });

  // Pending Requests State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionRemarks, setActionRemarks] = useState({});
  const [processingId, setProcessingId] = useState(null);

  // Student Directory State
  const [studentDirectory, setStudentDirectory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');

  // Leave Approvals State
  const [leaveList, setLeaveList] = useState([
    { id: 1, studentName: 'Amit Kumar Sharma', regNo: '1554424049', room: '102', destination: 'Patna (Home)', from: '2026-08-25', to: '2026-08-28', reason: 'Family celebration', status: 'PENDING' },
    { id: 2, studentName: 'Rahul Verma', regNo: '1554424052', room: '105', destination: 'Barh Market', from: '2026-08-24 16:00', to: '2026-08-24 19:30', reason: 'College Project Components', status: 'PENDING' },
    { id: 3, studentName: 'Pooja Kumari', regNo: '1554424088', room: '204', destination: 'Gaya', from: '2026-08-26', to: '2026-08-30', reason: 'Medical Checkup', status: 'APPROVED' }
  ]);

  // Fee Verification State
  const [feeReceipts, setFeeReceipts] = useState([
    { id: 'UTR-992140', studentName: 'Amit Sharma', regNo: '1554424049', feeType: 'Hostel Rent (Aug 2026)', amount: 2000, utr: 'UPI/283948291038/SBIN', date: '23 Aug 2026', status: 'PENDING' },
    { id: 'UTR-992141', studentName: 'Priya Singh', regNo: '1554424077', feeType: 'Mess Bill (Aug 2026)', amount: 2500, utr: 'UPI/998234120943/HDFC', date: '23 Aug 2026', status: 'VERIFIED' }
  ]);

  const wardenAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'/%3E%3C/svg%3E";

  // Fetch Analytics & Pending Requests
  const fetchWardenData = async () => {
    try {
      const [anaRes, pendRes, studRes] = await Promise.allSettled([
        axios.get('http://127.0.0.1:8000/api/warden/analytics'),
        axios.get('http://127.0.0.1:8000/api/warden/allotments/pending'),
        axios.get('http://127.0.0.1:8000/api/warden/students')
      ]);

      if (anaRes.status === 'fulfilled' && anaRes.value.data) {
        setAnalytics(anaRes.value.data);
      }
      if (pendRes.status === 'fulfilled' && pendRes.value.data) {
        setPendingRequests(pendRes.value.data);
      }
      if (studRes.status === 'fulfilled' && studRes.value.data) {
        setStudentDirectory(studRes.value.data);
      }
    } catch (error) {
      console.error('Warden data load error:', error);
    }
  };

  useEffect(() => {
    fetchWardenData();
  }, []);

  const handleAllotmentAction = async (requestId, action) => {
    setProcessingId(requestId);
    try {
      const remarks = actionRemarks[requestId] || (action === 'approve' ? 'Approved by Chief Warden' : 'Rejected by Chief Warden');
      const response = await axios.post(`http://127.0.0.1:8000/api/warden/allotments/${requestId}/action`, {
        action: action,
        remarks: remarks
      });

      toast.success(response.data.message || `Request ${action}d successfully!`, {
        duration: 4000,
        style: { borderRadius: '12px', background: '#0f172a', color: '#fff' }
      });

      // Refresh list & analytics
      fetchWardenData();
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.detail);
      } else {
        toast.error(`Failed to ${action} request.`);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleLeaveAction = (id, newStatus) => {
    setLeaveList(leaveList.map(l => l.id === id ? { ...l, status: newStatus } : l));
    toast.success(`Outpass application #${id} has been ${newStatus.toLowerCase()}!`);
  };

  const handleVerifyFee = (id) => {
    setFeeReceipts(feeReceipts.map(f => f.id === id ? { ...f, status: 'VERIFIED' } : f));
    toast.success(`UTR payment receipt #${id} verified & marked official!`);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Full Name', 'Reg No', 'Roll No', 'Branch', 'Academic Session', 'Gender', 'Mobile', 'Room No', 'Bed', 'Status'];
    const rows = filteredStudents.map(s => [
      s.id,
      `"${s.full_name}"`,
      `"${s.reg_no}"`,
      `"${s.roll_no}"`,
      `"${s.branch}"`,
      `"${s.semester || '2024-27'}"`,
      s.gender,
      s.mobile,
      s.room_number,
      s.bed_code,
      s.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GP_Barh_Hostel_Students_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Student Directory exported to CSV successfully! 📊');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Warden Session Terminated Successfully.');
    navigate('/');
  };

  const filteredStudents = studentDirectory.filter(s => {
    const matchSearch = (s.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.reg_no || '').includes(searchQuery) ||
      (s.room_number || '').includes(searchQuery);
    const matchBranch = branchFilter === 'ALL' || s.branch === branchFilter;
    return matchSearch && matchBranch;
  });

  return (
    <div className={`h-screen flex font-sans overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <Toaster position="top-right" />

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 LEFT SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        className={`fixed top-0 left-0 h-[100dvh] w-72 bg-slate-900 text-gray-200 z-50 flex flex-col justify-between transform transition-transform duration-300 border-r border-slate-800 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="p-6 border-b border-slate-800 text-center relative flex flex-col items-center">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="w-20 h-20 rounded-full p-3 border-2 border-yellow-500 overflow-hidden mb-3 bg-slate-800 shadow-xl">
              <img src={wardenAvatar} alt="Warden" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-base font-black tracking-tight text-white">Chief Warden Office</h2>
            <p className="text-[10px] text-yellow-300 font-bold uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full mt-1.5 border border-slate-700">
              Hostel Administrator
            </p>
          </div>

          <nav className="p-4 space-y-1.5 text-sm font-bold">
            {[
              { id: 'allocations', name: 'Hostel Seat Allocations', icon: '🛏️', badge: pendingRequests.length },
              { id: 'analytics', name: 'Occupancy Analytics', icon: '📊' },
              { id: 'leaves', name: 'Outpass / Leave Approvals', icon: '✈️', badge: leaveList.filter(l => l.status === 'PENDING').length },
              { id: 'fees', name: 'Fee & UTR Verification', icon: '💳', badge: feeReceipts.filter(f => f.status === 'PENDING').length },
              { id: 'directory', name: 'Student Master Directory', icon: '🧑‍🎓' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveNavTab(tab.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`w-full text-left py-3.5 px-4 rounded-xl transition-all flex items-center justify-between ${
                  activeNavTab === tab.id
                    ? 'bg-[#800000] text-white shadow-lg border-l-4 border-yellow-500'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-500 text-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex justify-center items-center gap-2 shadow-md"
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 🌟 MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 lg:ml-72 h-full overflow-hidden flex flex-col relative">
        {/* TOP HEADER */}
        <header className="bg-[#720e0e] text-white px-6 py-4 border-b border-[#5c0000] flex justify-between items-center shrink-0 shadow-md z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white lg:hidden"
            >
              ☰
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 h-10 w-10 rounded-full shadow flex items-center justify-center overflow-hidden">
                <img src={logo} alt="GP Barh Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-black tracking-tight leading-tight">राजकीय पॉलिटेक्निक, बाढ़</h1>
                <p className="text-[10px] text-yellow-300 font-bold uppercase tracking-widest">Warden Administration & Bed Allocation Control</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* MAIN SCROLLABLE VIEW */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">

          {/* ========================================================================= */}
          {/* 🌟 1. TOP METRIC ANALYTICS CARDS */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CAPACITY VS OCCUPIED */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-t-4 border-t-blue-500">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Capacity vs Occupied</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {analytics.total_occupied} <span className="text-base text-slate-400 font-semibold">/ {analytics.total_capacity} Beds</span>
              </h3>
              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                {analytics.occupancy_pct}% Overall Occupancy
              </p>
            </div>

            {/* BOYS VS GIRLS OCCUPANCY */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-t-4 border-t-indigo-500">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Boys vs Girls Occupancy %</p>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <span className="text-xs font-bold text-slate-400">Boys (H-Block)</span>
                  <p className="text-xl font-black text-indigo-600">{analytics.boys_occupancy_pct}%</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400">Girls (Linear)</span>
                  <p className="text-xl font-black text-pink-600">{analytics.girls_occupancy_pct}%</p>
                </div>
              </div>
            </div>

            {/* PENDING ALLOTMENT REQUESTS */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-t-4 border-t-amber-500">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pending Allotment Queue</p>
              <h3 className="text-3xl font-black text-amber-500">{pendingRequests.length}</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Students awaiting bed lock confirmation</p>
            </div>

            {/* TOTAL PENDING FEE DUES */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 border-t-4 border-t-rose-500">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estimated Pending Dues</p>
              <h3 className="text-3xl font-black text-rose-600 font-mono">₹{(analytics.total_pending_dues / 1000).toFixed(0)}K</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">Hostel Room Rent + Mess Boarding</p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 🌟 2. HOSTEL ALLOCATION MASTER SWITCHER & APPROVAL WORKSPACE */}
          {/* ========================================================================= */}
          {activeNavTab === 'allocations' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* MASTER SEGMENTED SWITCHER */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAllocationSubTab('pending')}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                      allocationSubTab === 'pending'
                        ? 'bg-amber-500 text-black shadow-md font-black'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>📋</span>
                    <span>Pending Requests Queue</span>
                    {pendingRequests.length > 0 && (
                      <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px]">
                        {pendingRequests.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setAllocationSubTab('boys')}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                      allocationSubTab === 'boys'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>🏢</span>
                    <span>Boys Hostel (Birsa Munda &amp; Dr. Rajendra Prasad Blocks)</span>
                  </button>

                  <button
                    onClick={() => setAllocationSubTab('girls')}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                      allocationSubTab === 'girls'
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>🏢</span>
                    <span>Girls Hostel (Savitribai Phule Block)</span>
                  </button>
                </div>

                <div className="text-xs font-bold text-slate-400 px-2">
                  Warden Super-View Active
                </div>
              </div>

              {/* VIEW 1: PENDING REQUESTS ACTION PANEL */}
              {allocationSubTab === 'pending' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        Pending Bed Allotment Queue
                      </h3>
                      <p className="text-xs text-slate-500">
                        Review student registration details, requested rooms, and execute approval/rejection actions.
                      </p>
                    </div>
                    <button
                      onClick={fetchWardenData}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      🔄 Refresh Queue
                    </button>
                  </div>

                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                      <span className="text-4xl">🎉</span>
                      <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">All caught up!</h4>
                      <p className="text-xs text-slate-400">There are no pending bed allotment requests awaiting review.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase text-[10px]">
                            <th className="py-3 px-4">Student Details</th>
                            <th className="py-3 px-4">Branch & Roll</th>
                            <th className="py-3 px-4">Requested Bed & Room</th>
                            <th className="py-3 px-4">Applied Time</th>
                            <th className="py-3 px-4">Remarks / Reason</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                          {pendingRequests.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-600">
                                    {req.student_photo ? (
                                      <img src={req.student_photo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      req.student_name[0]
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-black text-sm text-slate-900 dark:text-white">{req.student_name}</p>
                                    <p className="text-[11px] font-mono text-slate-500">Reg: {req.student_reg}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-bold text-slate-800 dark:text-slate-200">{req.student_branch}</p>
                                <p className="text-[11px] text-slate-400 font-mono">Roll: {req.student_roll}</p>
                              </td>
                              <td className="py-4 px-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold">
                                  <span>🚪 Room {req.room_number}</span>
                                  <span>•</span>
                                  <span className="font-black">Bed {req.bed_code}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 font-mono text-slate-500 text-[11px]">
                                {new Date(req.applied_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                              </td>
                              <td className="py-4 px-4">
                                <input
                                  type="text"
                                  placeholder="Approval / Rejection note..."
                                  value={actionRemarks[req.id] || ''}
                                  onChange={(e) => setActionRemarks({ ...actionRemarks, [req.id]: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none"
                                />
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    disabled={processingId === req.id}
                                    onClick={() => handleAllotmentAction(req.id, 'approve')}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow transition-all flex items-center gap-1"
                                  >
                                    <span>✓</span>
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    disabled={processingId === req.id}
                                    onClick={() => handleAllotmentAction(req.id, 'reject')}
                                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow transition-all flex items-center gap-1"
                                  >
                                    <span>✕</span>
                                    <span>Reject</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: BOYS HOSTEL GRID */}
              {allocationSubTab === 'boys' && (
                <div className="space-y-4">
                  <RoomAllocationGrid
                    gender="MALE"
                    wardenMode={true}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}

              {/* VIEW 3: GIRLS HOSTEL GRID */}
              {allocationSubTab === 'girls' && (
                <div className="space-y-4">
                  <RoomAllocationGrid
                    gender="FEMALE"
                    wardenMode={true}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🌟 3. OUTPASS / LEAVE APPROVALS */}
          {/* ========================================================================= */}
          {activeNavTab === 'leaves' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Student Outpass & Leave Approvals
                </h3>
                <p className="text-xs text-slate-500">
                  Review student leave requests, destination city, and issue official digital permissions.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase text-[10px]">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Room No</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Departure - Return</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4 text-center">Status / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {leaveList.map(leave => (
                      <tr key={leave.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {leave.studentName}
                          <p className="text-[10px] text-slate-400 font-mono">Reg #{leave.regNo}</p>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">Room {leave.room}</td>
                        <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">{leave.destination}</td>
                        <td className="py-3.5 px-4 text-slate-500">{leave.from} ➔ {leave.to}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{leave.reason}</td>
                        <td className="py-3.5 px-4 text-center">
                          {leave.status === 'PENDING' ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleLeaveAction(leave.id, 'APPROVED')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleLeaveAction(leave.id, 'REJECTED')}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {leave.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🌟 4. FEE & UTR VERIFICATION */}
          {/* ========================================================================= */}
          {activeNavTab === 'fees' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in duration-300">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Fee & UTR Matching Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Verify bank UTR reference numbers submitted by students for hostel room rent and mess boarding dues.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase text-[10px]">
                      <th className="py-3 px-4">Receipt ID</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Fee Category</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Bank UTR Ref</th>
                      <th className="py-3 px-4 text-center">Status / Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {feeReceipts.map(fee => (
                      <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{fee.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{fee.studentName}</td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{fee.feeType}</td>
                        <td className="py-3.5 px-4 font-mono font-black text-emerald-600">₹{fee.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{fee.utr}</td>
                        <td className="py-3.5 px-4 text-center">
                          {fee.status === 'PENDING' ? (
                            <button
                              onClick={() => handleVerifyFee(fee.id)}
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase shadow"
                            >
                              Verify UTR ✓
                            </button>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                              Verified & Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🌟 5. STUDENT MASTER DIRECTORY WITH CSV EXPORT */}
          {/* ========================================================================= */}
          {activeNavTab === 'directory' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Student Master Directory
                  </h3>
                  <p className="text-xs text-slate-500">Full roster of enrolled students and room allotments.</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow flex items-center gap-2"
                  >
                    <span>📊</span> Export CSV
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search by Name, Reg No, Room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 min-w-[240px] px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs outline-none"
                />

                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs outline-none cursor-pointer"
                >
                  <option value="ALL">All Branches</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase text-[10px]">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Reg No</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4">Session</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Mobile</th>
                      <th className="py-3 px-4">Allocated Room</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{student.full_name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{student.reg_no}</td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{student.branch}</td>
                        <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold">{student.semester || '2024-27'}</span></td>
                        <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">{student.gender}</span></td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{student.mobile}</td>
                        <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                          {student.room_number !== 'Unassigned' ? `Room ${student.room_number} (Bed ${student.bed_code})` : 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            student.status === 'Allotted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default WardenDashboard;