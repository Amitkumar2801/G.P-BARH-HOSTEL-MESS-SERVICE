// src/pages/WardenDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png.png';

function WardenDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const navigate = useNavigate();

  const wardenAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'/%3E%3C/svg%3E";

  const today = new Date();
  const currentFormattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    alert("Warden Logged Out Successfully!");
    navigate("/");
  };

  return (
    <div className="h-screen bg-[#f3f4f6] flex font-sans overflow-hidden text-gray-900">

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* ================= LEFT SIDEBAR (High Contrast Dark) ================= */}
      <aside
        className={`fixed top-0 left-0 h-[100dvh] w-72 bg-[#111827] text-gray-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-r border-[#1f2937] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-8 border-b border-[#1f2937] text-center flex flex-col items-center relative shrink-0">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white bg-white/10 rounded-full h-8 w-8 flex items-center justify-center transition-colors"
          >✕</button>

          <div className="w-24 h-24 rounded-full p-4 border-2 border-yellow-500 overflow-hidden mb-4 bg-gray-800 mt-2 lg:mt-0 shadow-xl">
             <img src={wardenAvatar} alt="Warden Profile" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">Chief Warden</h2>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full mt-2.5 border border-white/20">Administrator</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 text-sm font-bold hide-scrollbar">
          {[
            { id: 'overview', name: 'Live Overview', icon: '📊' },
            { id: 'students', name: 'Manage Students', icon: '🧑‍🎓' },
            { id: 'fees', name: 'Fee Defaulters', icon: '💰' },
            { id: 'leaves', name: 'Leave Approvals', icon: '✈️' },
            { id: 'complaints', name: 'Resolve Complaints', icon: '📢' },
            { id: 'settings', name: 'System Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className={`w-full text-left py-3.5 px-5 rounded-lg transition-all flex items-center gap-3.5 ${
                activeTab === tab.id
                ? 'bg-[#800000] text-white shadow-lg border-l-4 border-yellow-500'
                : 'hover:bg-white/10 text-gray-300'
              }`}
            >
              <span className="text-lg">{tab.icon}</span> {tab.name}
            </button>
          ))}
        </nav>

        <div className="p-5 border-t border-[#1f2937] bg-[#0b0f19] shrink-0">
          <button onClick={handleLogout} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors flex justify-center items-center gap-2.5 shadow-md shadow-red-900/50">
            <span>🚪</span> Log Out
          </button>
        </div>
      </aside>

      {/* ================= RIGHT MAIN CONTENT ================= */}
      <div className={`flex-1 h-full overflow-hidden flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'} relative`}>

        {/* HEADER (Deep Maroon) */}
        <header className="bg-[#800000] text-white px-6 md:px-10 py-4 border-b border-[#5c0000] flex justify-between items-center shrink-0 shadow-md z-30">
          <div className="flex items-center gap-5">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors text-white lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div className="flex items-center gap-3.5">
              <div className="bg-white p-1 h-12 w-12 rounded-full shadow-lg flex items-center justify-center overflow-hidden">
                <img src={logo} alt="GP Barh Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-black tracking-tight">Government Polytechnic, Barh</h1>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Warden Administration Portal</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
             <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                <span className="text-xs font-bold uppercase tracking-widest">🛡️ Admin Access</span>
             </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto">

            {/* ----------------- 1. LIVE OVERVIEW ----------------- */}
            {activeTab === 'overview' && (
              <div className="animate-fade-in space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-[#800000] tracking-tight">Hostel Overview</h2>
                  <p className="text-sm font-bold text-gray-500 mt-1">Live statistics and pending actions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-blue-500">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Students</p>
                    <h3 className="text-4xl font-black text-gray-900">145<span className="text-xl text-gray-400">/150</span></h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-green-500">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Present in Hostel</p>
                    <h3 className="text-4xl font-black text-green-600">138</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1">7 on Approved Leave</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-red-500">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Pending Dues</p>
                    <h3 className="text-4xl font-black text-red-600">₹45.2K</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1">From 12 Defaulters</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-orange-500">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Open Complaints</p>
                    <h3 className="text-4xl font-black text-orange-500">3</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1">Action Required</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
                   <h3 className="text-lg font-black text-gray-800 mb-6 border-b border-gray-100 pb-4">Quick Actions</h3>
                   <div className="flex gap-4">
                      <button onClick={() => setActiveTab('complaints')} className="bg-[#800000] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-[#5c0000] transition-colors">View Complaints</button>
                      <button onClick={() => setActiveTab('leaves')} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-colors">Pending Leaves</button>
                   </div>
                </div>
              </div>
            )}

            {/* ----------------- 2. MANAGE STUDENTS ----------------- */}
            {activeTab === 'students' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-[#800000] tracking-tight">Student Directory</h2>
                  <p className="text-sm font-bold text-gray-500 mt-1">Search and manage all hostel residents.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <input type="text" placeholder="Search by Name or Reg No..." className="px-4 py-2 rounded-lg border border-gray-300 w-full max-w-md text-sm outline-none focus:ring-2 focus:ring-[#800000]" />
                  </div>
                  <div className="overflow-x-auto w-full p-2">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-200">
                          <th className="p-4 font-black pl-8">Reg No.</th>
                          <th className="p-4 font-black">Student Name</th>
                          <th className="p-4 font-black">Room</th>
                          <th className="p-4 font-black">Status</th>
                          <th className="p-4 font-black text-center pr-8">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4 font-mono font-bold text-gray-600 pl-8">1554424049</td>
                          <td className="p-4 font-black text-gray-900">Amit Kumar</td>
                          <td className="p-4 font-bold text-gray-700">102</td>
                          <td className="p-4"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest">In Hostel</span></td>
                          <td className="p-4 text-center pr-8"><button className="text-blue-600 font-bold text-xs hover:underline">View Profile</button></td>
                        </tr>
                        <tr className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4 font-mono font-bold text-gray-600 pl-8">1554424050</td>
                          <td className="p-4 font-black text-gray-900">Rahul Singh</td>
                          <td className="p-4 font-bold text-gray-700">105</td>
                          <td className="p-4"><span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest">On Leave</span></td>
                          <td className="p-4 text-center pr-8"><button className="text-blue-600 font-bold text-xs hover:underline">View Profile</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- 3. LEAVE APPROVALS ----------------- */}
            {activeTab === 'leaves' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-[#800000] tracking-tight">Leave Approvals</h2>
                  <p className="text-sm font-bold text-gray-500 mt-1">Review and approve student outing and clearance requests.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto w-full p-2 mt-4">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-200">
                          <th className="p-4 font-black pl-8">Student</th>
                          <th className="p-4 font-black">Type</th>
                          <th className="p-4 font-black">Dates / Reason</th>
                          <th className="p-4 font-black">Proof</th>
                          <th className="p-4 font-black text-center pr-8">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4 pl-8">
                            <p className="font-black text-gray-900">Ravi Kumar</p>
                            <p className="text-xs font-mono text-gray-500">1554424088</p>
                          </td>
                          <td className="p-4"><span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest">Temporary</span></td>
                          <td className="p-4">
                            <p className="font-bold text-gray-800 text-xs">24 Mar - 28 Mar</p>
                            <p className="text-[10px] text-gray-500">Going home for Holi.</p>
                          </td>
                          <td className="p-4">-</td>
                          <td className="p-4 text-center pr-8 flex gap-2 justify-center">
                             <button className="bg-green-600 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-green-700">Approve</button>
                             <button className="bg-red-600 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-700">Reject</button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4 pl-8">
                            <p className="font-black text-gray-900">Sohan Das</p>
                            <p className="text-xs font-mono text-gray-500">1554424012</p>
                          </td>
                          <td className="p-4"><span className="bg-red-100 text-red-700 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest">Vacate</span></td>
                          <td className="p-4">
                            <p className="font-bold text-gray-800 text-xs">Course Completed</p>
                            <p className="text-[10px] text-gray-500">Leaving on 30 Mar</p>
                          </td>
                          <td className="p-4"><button className="text-blue-600 font-bold text-xs underline">View No-Dues PDF</button></td>
                          <td className="p-4 text-center pr-8 flex gap-2 justify-center">
                             <button className="bg-green-600 text-white px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-green-700">Clear & Refund</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- 4. COMPLAINTS RESOLUTION ----------------- */}
            {activeTab === 'complaints' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-[#800000] tracking-tight">Manage Complaints</h2>
                  <p className="text-sm font-bold text-gray-500 mt-1">Review and resolve issues raised by students.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto w-full p-2 mt-4">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-200">
                          <th className="p-4 font-black pl-8">Date / Student</th>
                          <th className="p-4 font-black">Category</th>
                          <th className="p-4 font-black">Issue Description</th>
                          <th className="p-4 font-black">Proof</th>
                          <th className="p-4 font-black text-center pr-8">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4 pl-8">
                            <p className="font-black text-gray-900">Today</p>
                            <p className="text-xs font-bold text-gray-500">Amit (Room 102)</p>
                          </td>
                          <td className="p-4 font-bold text-gray-700">Plumbing</td>
                          <td className="p-4">
                            <p className="font-bold text-gray-800 text-sm">Water cooler not working</p>
                          </td>
                          <td className="p-4"><button className="text-blue-600 font-bold text-xs underline">View Photo</button></td>
                          <td className="p-4 text-center pr-8">
                             <button className="bg-[#800000] text-white px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-[#5c0000]">Mark Resolved</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* 🌟 STYLISH FOOTER */}
        <footer className="bg-[#800000] text-white py-5 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-30">
          <div className="text-center md:text-left mb-3 md:mb-0">
            <p className="font-bold tracking-wide text-sm">Government Polytechnic Barh</p>
            <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest mt-0.5">Warden Administration Portal</p>
          </div>
          <div className="flex items-center gap-2 text-teal-100 bg-white/10 px-4 py-2 rounded-lg border border-white/20">
            <span className="text-lg">📅</span>
            <span className="font-serif italic font-bold tracking-wider text-sm">{currentFormattedDate}</span>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default WardenDashboard;