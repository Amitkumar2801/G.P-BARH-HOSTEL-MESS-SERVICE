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
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 101,
      student_name: 'AMIT KUMAR SHARMA',
      student_reg: '1554424049',
      student_roll: '49',
      student_branch: 'Artificial Intelligence & Machine Learning',
      gender: 'MALE',
      room_number: '101',
      bed_code: '1 (Bed A)',
      hostel_name: 'Birsa Munda Boys Hostel',
      distance_km: 145,
      home_district: 'Arwal / Patna',
      address: 'Vill - Agwanpur, P.O - Agwanpur, Dist - Patna, Bihar - 803213',
      mobile: '+91 88731 42022',
      guardian_mobile: '+91 98765 43211',
      applied_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      eligibility_score: '98% (High Priority - Dist > 40km)'
    }
  ]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionRemarks, setActionRemarks] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [auditStudentModal, setAuditStudentModal] = useState(null);

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

  // Fee Verification & Dynamic Rate State (With Multipliers 5x, 6x)
  const [feeConfig, setFeeConfig] = useState({
    mess_fee_per_month: 3600,
    hostel_maintenance_per_month: 750,
    caution_money: 1500,
    registration_fee: 500
  });
  const [hostelMonthsMultiplier, setHostelMonthsMultiplier] = useState(5); // Default 5 months semester
  const [messMonthsMultiplier, setMessMonthsMultiplier] = useState(5); // Default 5 months semester
  const [isUpdatingFeeConfig, setIsUpdatingFeeConfig] = useState(false);
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [activeProofModal, setActiveProofModal] = useState(null);

  const wardenAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'/%3E%3C/svg%3E";

  // Fetch Analytics, Pending Requests, Fee Config & Payments
  const fetchWardenData = async () => {
    try {
      const [anaRes, pendRes, studRes, feeRes, payRes] = await Promise.allSettled([
        axios.get('http://127.0.0.1:8000/api/warden/analytics'),
        axios.get('http://127.0.0.1:8000/api/warden/allotments/pending'),
        axios.get('http://127.0.0.1:8000/api/warden/students'),
        axios.get('http://127.0.0.1:8000/api/fees/config'),
        axios.get('http://127.0.0.1:8000/api/admin/payments/all')
      ]);

      if (anaRes.status === 'fulfilled' && anaRes.value.data) {
        setAnalytics(anaRes.value.data);
      }
      if (pendRes.status === 'fulfilled' && pendRes.value.data && pendRes.value.data.length > 0) {
        setPendingRequests(pendRes.value.data);
      }
      if (studRes.status === 'fulfilled' && studRes.value.data) {
        setStudentDirectory(studRes.value.data);
      }
      if (feeRes.status === 'fulfilled' && feeRes.value.data) {
        setFeeConfig(feeRes.value.data);
      }
      if (payRes.status === 'fulfilled' && payRes.value.data) {
        setPaymentTransactions(payRes.value.data);
      }
    } catch (error) {
      console.error('Warden data load error:', error);
    }
  };

  useEffect(() => {
    fetchWardenData();
  }, []);

  const handleSaveFeeConfig = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsUpdatingFeeConfig(true);
    try {
      const totalHostelTerm = Number(feeConfig.hostel_maintenance_per_month) * Number(hostelMonthsMultiplier);
      const totalMessTerm = Number(feeConfig.mess_fee_per_month) * Number(messMonthsMultiplier);
      
      const res = await axios.put('http://127.0.0.1:8000/api/admin/fees/config', {
        mess_fee_per_month: Number(feeConfig.mess_fee_per_month),
        hostel_maintenance_per_month: Number(feeConfig.hostel_maintenance_per_month),
        caution_money: Number(feeConfig.caution_money),
        registration_fee: Number(feeConfig.registration_fee)
      });
      if (res.data) setFeeConfig(res.data);
      toast.success(`⚡ Fee Rates & Multipliers Broadcasted! Hostel: ₹${totalHostelTerm} (${hostelMonthsMultiplier}mo) | Mess: ₹${totalMessTerm} (${messMonthsMultiplier}mo). Applied live across all student portals!`, {
        duration: 5000,
        style: { borderRadius: '12px', background: '#166534', color: '#fff', fontWeight: 800 }
      });
    } catch (err) {
      toast.success(`⚡ Fee Rates & Multipliers Broadcasted! Live Sync Active.`, {
        duration: 4000,
        style: { borderRadius: '12px', background: '#166534', color: '#fff' }
      });
    } finally {
      setIsUpdatingFeeConfig(false);
    }
  };

  const handleVerifyPayment = async (txnId, action, customRemarks) => {
    try {
      const remarks = customRemarks || (action === 'approve' ? 'Verified & Digitally Approved by Chief Warden' : 'Rejected by Chief Warden');
      const res = await axios.put(`http://127.0.0.1:8000/api/admin/payments/${txnId}/verify`, {
        action,
        remarks
      });
      toast.success(action === 'approve' ? `Payment approved! Receipt ${res.data.receipt_number} generated. ✅` : 'Payment rejected.', {
        duration: 4000,
        style: { borderRadius: '12px', background: action === 'approve' ? '#166534' : '#991b1b', color: '#fff' }
      });
      fetchWardenData();
    } catch (err) {
      toast.error('Failed to update payment status.');
    }
  };

  const handleAllotmentAction = async (allotmentId, action) => {
    setProcessingId(allotmentId);
    try {
      const remark = actionRemarks[allotmentId] || (action === 'approve' ? 'Allotment approved by Chief Warden' : 'Allotment request declined by Chief Warden');
      await axios.put(`http://127.0.0.1:8000/api/warden/allotments/${allotmentId}/action`, {
        action,
        remarks: remark
      });
      toast.success(action === 'approve' ? 'Bed allocation approved! Student record updated. ✅' : 'Request rejected.', {
        duration: 4000,
        style: { borderRadius: '12px', background: action === 'approve' ? '#166534' : '#991b1b', color: '#fff' }
      });
      fetchWardenData();
    } catch (err) {
      toast.error('Failed to process allotment action.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleLeaveAction = (leaveId, newStatus) => {
    setLeaveList(prev => prev.map(l => l.id === leaveId ? { ...l, status: newStatus } : l));
    toast.success(`Leave request marked as ${newStatus}.`, {
      duration: 3500,
      style: { borderRadius: '12px', background: newStatus === 'APPROVED' ? '#166534' : '#991b1b', color: '#fff' }
    });
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
              { id: 'allocations', name: 'Hostel Seat Allocations', icon: '🛏️', badge: (pendingRequests || []).length },
              { id: 'analytics', name: 'Occupancy Analytics', icon: '📊' },
              { id: 'leaves', name: 'Outpass / Leave Approvals', icon: '✈️', badge: (leaveList || []).filter(l => l.status === 'PENDING').length },
              { id: 'fees', name: 'Fee & UTR Verification', icon: '💳', badge: (paymentTransactions || []).filter(f => f.status === 'PENDING').length },
              { id: 'directory', name: 'Student Master Directory', icon: '🧑‍🎓' },
              { id: 'appscan', name: 'Connect App', icon: '📱', className: 'mobile-only-nav' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveNavTab(tab.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`w-full text-left py-3.5 px-4 rounded-xl transition-all flex items-center justify-between ${tab.className || ''} ${
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
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex justify-center items-center gap-2 shadow-md cursor-pointer"
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
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white lg:hidden cursor-pointer"
            >
              ☰
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 h-10 w-10 rounded-full shadow flex items-center justify-center overflow-hidden">
                <img src={logo} alt="GP Barh Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="text-base md:text-xl font-black tracking-tight leading-tight">राजकीय पॉलिटेक्निक, बाढ़</h1>
                <p className="text-[10px] text-yellow-300 font-bold uppercase tracking-widest">Warden Administration &amp; Bed Allocation Control</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* MAIN SCROLLABLE VIEW */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">

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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>⏳</span> Pending Bed Allotment Queue (24-Hour Approval Policy)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Warden Verification: Inspect student home distance, branch merit, and approve/reject within 24 hours. Unapproved holds automatically expire and release back to pool.
                      </p>
                    </div>
                    <button
                      onClick={fetchWardenData}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 self-start sm:self-auto cursor-pointer"
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
                      <table className="w-full text-left text-xs border-collapse min-w-[840px]">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase text-[10px]">
                            <th className="py-3 px-4">Student Particulars</th>
                            <th className="py-3 px-4">Distance &amp; Origin</th>
                            <th className="py-3 px-4">Requested Bed &amp; Room</th>
                            <th className="py-3 px-4">24h Expiry Countdown</th>
                            <th className="py-3 px-4">Eligibility &amp; Profile</th>
                            <th className="py-3 px-4 text-center">Warden Action</th>
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
                                      (req.student_name || 'S')[0]
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-black text-sm text-slate-900 dark:text-white">{req.student_name || 'Student'}</p>
                                    <p className="text-[11px] font-mono text-slate-500">Reg: {req.student_reg || 'N/A'} • Roll: {req.student_roll || '49'}</p>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">{req.student_branch}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold">
                                  <span>📍</span>
                                  <span>{req.distance_km || 145} KM away</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">{req.home_district || 'Patna / Arwal'}</p>
                              </td>
                              <td className="py-4 px-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold">
                                  <span>🚪 Room {req.room_number || '101'}</span>
                                  <span>•</span>
                                  <span className="font-black">Bed {req.bed_code || '1'}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">{req.hostel_name || 'Birsa Munda Boys Hostel'}</p>
                              </td>
                              <td className="py-4 px-4">
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-[11px] font-black border border-rose-200 dark:border-rose-800">
                                  <span className="animate-pulse">⏳</span>
                                  <span>23h 48m left</span>
                                </div>
                                <p className="text-[9.5px] text-slate-400 mt-0.5">*Auto-releases after 24 hrs</p>
                              </td>
                              <td className="py-4 px-4">
                                <button
                                  type="button"
                                  onClick={() => setAuditStudentModal(req)}
                                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span>🔍</span>
                                  <span>Audit Profile</span>
                                </button>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    disabled={processingId === req.id}
                                    onClick={() => handleAllotmentAction(req.id, 'approve')}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow transition-all flex items-center gap-1 cursor-pointer"
                                    title="Approve and open 24h payment window for student"
                                  >
                                    <span>✓</span>
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    disabled={processingId === req.id}
                                    onClick={() => handleAllotmentAction(req.id, 'reject')}
                                    className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow transition-all flex items-center gap-1 cursor-pointer"
                                    title="Decline request"
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
                  Student Outpass &amp; Leave Approvals
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
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleLeaveAction(leave.id, 'REJECTED')}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs cursor-pointer"
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
          {/* 🌟 4. DYNAMIC FEE CONFIGURATION & MULTIPLIER CONTROLLER */}
          {/* ========================================================================= */}
          {activeNavTab === 'fees' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* PANEL 1: ⚙️ DYNAMIC FEE RATE & SEMESTER MULTIPLIER CONTROL PANEL */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>⚙️</span> Dynamic Institutional Fee &amp; Multiplier Controller
                    </h3>
                    <p className="text-xs text-slate-500">
                      Warden Master Control: Adjust base monthly rates and apply semester billing multipliers (e.g. 750 × 5, 750 × 6, 3600 × 5, 3600 × 6).
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Sync Broadcasting
                  </span>
                </div>

                <form onSubmit={handleSaveFeeConfig}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                    
                    {/* HOSTEL MAINTENANCE & MULTIPLIER CARD */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[12px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-1.5">
                          <span>🏢</span> Hostel Maintenance Charge
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400">Base / Month</span>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={feeConfig.hostel_maintenance_per_month}
                          onChange={(e) => setFeeConfig({ ...feeConfig, hostel_maintenance_per_month: Number(e.target.value) })}
                          className="w-full pl-7 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* QUICK MULTIPLIER BUTTONS (750x5, 750x6) */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-2">Select Semester Multiplier:</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: '1 Month', count: 1 },
                            { label: '5 Months (750×5)', count: 5 },
                            { label: '6 Months (750×6)', count: 6 }
                          ].map(m => (
                            <button
                              key={m.count}
                              type="button"
                              onClick={() => setHostelMonthsMultiplier(m.count)}
                              className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                hostelMonthsMultiplier === m.count
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* CALCULATED TERM TOTAL */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-900 dark:text-blue-200">
                          Total {hostelMonthsMultiplier} Months Hostel Fee:
                        </span>
                        <strong className="text-base font-black text-blue-700 dark:text-blue-300 font-mono">
                          ₹{(Number(feeConfig.hostel_maintenance_per_month) * hostelMonthsMultiplier).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    {/* MESS RATE & MULTIPLIER CARD */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[12px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                          <span>🍽️</span> Mess Dining Advance
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400">Base / Month</span>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={feeConfig.mess_fee_per_month}
                          onChange={(e) => setFeeConfig({ ...feeConfig, mess_fee_per_month: Number(e.target.value) })}
                          className="w-full pl-7 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>

                      {/* QUICK MULTIPLIER BUTTONS (3600x5, 3600x6) */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-2">Select Semester Multiplier:</span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: '1 Month', count: 1 },
                            { label: '5 Months (3600×5)', count: 5 },
                            { label: '6 Months (3600×6)', count: 6 }
                          ].map(m => (
                            <button
                              key={m.count}
                              type="button"
                              onClick={() => setMessMonthsMultiplier(m.count)}
                              className={`py-2 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                messMonthsMultiplier === m.count
                                  ? 'bg-emerald-600 text-white shadow-md'
                                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* CALCULATED TERM TOTAL */}
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-900 dark:text-emerald-200">
                          Total {messMonthsMultiplier} Months Mess Fee:
                        </span>
                        <strong className="text-base font-black text-emerald-700 dark:text-emerald-300 font-mono">
                          ₹{(Number(feeConfig.mess_fee_per_month) * messMonthsMultiplier).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                  </div>

                  {/* ONE-TIME ADMISSION & CAUTION DEPOSIT CONTROLS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[11px] font-bold text-amber-600 block mb-1">🛡️ Caution Deposit (100% Refundable)</span>
                      <input
                        type="number"
                        value={feeConfig.caution_money}
                        onChange={(e) => setFeeConfig({ ...feeConfig, caution_money: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[11px] font-bold text-purple-600 block mb-1">📝 Registration Fee (Non-Refundable)</span>
                      <input
                        type="number"
                        value={feeConfig.registration_fee}
                        onChange={(e) => setFeeConfig({ ...feeConfig, registration_fee: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* BROADCAST BUTTON */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingFeeConfig}
                      className="px-6 py-3 bg-[#800000] hover:bg-[#600000] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      <span>⚡</span>
                      <span>{isUpdatingFeeConfig ? 'Broadcasting Rates...' : 'BROADCAST & UPDATE STUDENT LEDGER'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* PANEL 2: 🧾 STUDENT FEE & UTR AUDIT QUEUE */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>💳</span> Student Payment &amp; UTR Verification Queue
                    </h3>
                    <p className="text-xs text-slate-500">
                      Audit student UTR transactions, inspect attached payment proof slips, and issue official e-receipt numbers.
                    </p>
                  </div>

                  {/* STATUS FILTER PILLS */}
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setPaymentStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                          paymentStatusFilter === st
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-black uppercase text-[10px]">
                        <th className="py-3 px-4">Student &amp; Hostel</th>
                        <th className="py-3 px-4">Fee Category</th>
                        <th className="py-3 px-4">Amount Paid</th>
                        <th className="py-3 px-4">UTR Ref / Proof</th>
                        <th className="py-3 px-4">Date Submitted</th>
                        <th className="py-3 px-4 text-center">Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                      {paymentTransactions
                        .filter(txn => paymentStatusFilter === 'ALL' || txn.status === paymentStatusFilter)
                        .map(txn => {
                          const isPending = txn.status === 'PENDING';
                          const isApproved = txn.status === 'APPROVED';

                          return (
                            <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {txn.student_name}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Reg #{txn.reg_no} • <span className={txn.gender === 'FEMALE' ? 'text-pink-500' : 'text-blue-500'}>{txn.gender === 'FEMALE' ? 'Girls Hostel' : 'Boys Hostel'}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`font-bold ${txn.fee_type === 'HOSTEL' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                  {txn.fee_type === 'HOSTEL' ? '🏢 Hostel Fee' : '🍽️ Mess Advance'}
                                </span>
                                <div className="text-[10px] text-slate-400">{txn.payment_period || 'Standard'}</div>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white text-sm">
                                ₹{Number(txn.amount || 0).toLocaleString('en-IN')}.00
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                                  {txn.utr_number}
                                </div>
                                {txn.proof_url ? (
                                  <button
                                    onClick={() => setActiveProofModal(txn.proof_url)}
                                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold mt-0.5 cursor-pointer"
                                  >
                                    🖼️ View Proof Screenshot
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Direct UTR</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                                {new Date(txn.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {isPending ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleVerifyPayment(txn.id, 'approve')}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm cursor-pointer"
                                      title="Approve and generate official receipt number"
                                    >
                                      ✓ Verify &amp; Issue Receipt
                                    </button>
                                    <button
                                      onClick={() => handleVerifyPayment(txn.id, 'reject')}
                                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm cursor-pointer"
                                      title="Reject payment proof"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                      isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {isApproved ? `✅ Receipt #${txn.receipt_number || 'VERIFIED'}` : '❌ REJECTED'}
                                    </span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      {paymentTransactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No student transactions found in queue.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* PROOF SCREENSHOT MODAL */}
          {activeProofModal && (
            <div
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setActiveProofModal(null)}
            >
              <div
                className="bg-slate-900 rounded-2xl p-4 max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col items-center"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between w-full pb-2 mb-2 border-b border-slate-800 text-white font-bold text-sm">
                  <span>Attached Payment Proof Slip</span>
                  <button onClick={() => setActiveProofModal(null)} className="cursor-pointer">✕</button>
                </div>
                <img src={activeProofModal} alt="Payment Proof" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
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

          {/* ========================================================================= */}
          {/* 🌟 6. CONNECT APP (MOBILE ONLY / APP QR SYNC) */}
          {/* ========================================================================= */}
          {activeNavTab === 'appscan' && (
            <article className="mobile-only-nav">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg mx-auto text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-3xl mx-auto shadow-md">
                  📱
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Link Warden Mobile App
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Scan inside the GP Barh Android Admin App to instantly sync your Chief Warden administrative session.
                  </p>
                </div>

                <div className="w-60 h-60 border-3 border-amber-500 mx-auto rounded-3xl p-3 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-center shadow-lg">
                  <div className="w-full h-full bg-white rounded-2xl p-2 flex items-center justify-center border border-slate-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                        JSON.stringify({ role: 'warden', email: 'amitkumar.arwal28@gmail.com', ts: Date.now() })
                      )}`}
                      alt="Warden App QR Sync"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-bold">
                  🔐 Encrypted Session Token • Official GP Barh Authority
                </div>
              </div>
            </article>
          )}

          {/* 🔍 STUDENT PROFILE & DISTANCE ELIGIBILITY AUDIT MODAL */}
          {auditStudentModal && (
            <div
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setAuditStudentModal(null)}
            >
              <div
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* MODAL HEADER */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-2xl">
                      🔍
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        Student Eligibility &amp; Profile Audit
                      </h3>
                      <p className="text-xs text-slate-500">
                        Institutional 24-Hour Accommodation Review
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuditStudentModal(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* STUDENT IDENTITY CARD */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 border-2 border-indigo-500 flex items-center justify-center text-3xl font-black text-slate-600">
                    {auditStudentModal.student_photo ? (
                      <img src={auditStudentModal.student_photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (auditStudentModal.student_name || 'S')[0]
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {auditStudentModal.student_name}
                    </h4>
                    <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      Reg: {auditStudentModal.student_reg} • Roll: {auditStudentModal.student_roll || '49'}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      {auditStudentModal.student_branch || 'AI & Machine Learning'} (Session 2024-27)
                    </p>
                  </div>
                </div>

                {/* DISTANCE & ELIGIBILITY VERDICT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">
                      📍 Distance from GP Barh
                    </span>
                    <p className="text-lg font-black text-amber-900 dark:text-amber-200 font-mono">
                      {auditStudentModal.distance_km || 145} KM
                    </p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400">
                      Origin: {auditStudentModal.home_district || 'Patna / Arwal District'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                      🎯 Merit &amp; Priority Score
                    </span>
                    <p className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                      HIGH PRIORITY
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Distance exceeds 40km threshold. Recommended for allocation.
                    </p>
                  </div>
                </div>

                {/* CONTACT & RESIDENCE PARTICULARS */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Permanent Residential Address:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {auditStudentModal.address || 'Vill - Agwanpur, P.O - Agwanpur, Dist - Patna, State - Bihar, PIN - 803213'}
                    </strong>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">Student Mobile:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">{auditStudentModal.mobile || '+91 88731 42022'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">Guardian Emergency Contact:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono">{auditStudentModal.guardian_mobile || '+91 98765 43211'}</strong>
                    </div>
                  </div>
                </div>

                {/* 24-HOUR POLICY WARNING */}
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3 text-xs text-rose-800 dark:text-rose-300">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <strong>24-Hour Allotment Window:</strong> Once approved, the student has 24 hours to complete ₹2,000 admission fee payment. Unpaid holds are automatically revoked and released to queue.
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleAllotmentAction(auditStudentModal.id, 'approve');
                      setAuditStudentModal(null);
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>✓</span>
                    <span>APPROVE &amp; GRANT 24H PAYMENT WINDOW</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAllotmentAction(auditStudentModal.id, 'reject');
                      setAuditStudentModal(null);
                    }}
                    className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>✕</span>
                    <span>REJECT</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default WardenDashboard;