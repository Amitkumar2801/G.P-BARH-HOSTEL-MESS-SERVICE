// src/pages/WardenDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function WardenDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const navigate = useNavigate();

  // 🌟 NAYA: Student State for Warden Control (Room Assignment & Payment Block)
  const [students, setStudents] = useState([
    { id: '1554424049', name: 'Amit Kumar', branch: 'AI & ML', room: '102', status: 'In Hostel', paymentBlocked: false },
    { id: '1554424050', name: 'Rahul Singh', branch: 'Civil', room: '', status: 'On Leave', paymentBlocked: true },
    { id: '1554424051', name: 'Vikas Sharma', branch: 'Electrical', room: '105', status: 'In Hostel', paymentBlocked: false },
    { id: '1554424052', name: 'Priya Kumari', branch: 'Computer Sc.', room: '201', status: 'In Hostel', paymentBlocked: false },
  ]);

  // Toggle Payment Block logic
  const togglePaymentBlock = (regNo) => {
    setStudents(students.map(s => s.id === regNo ? { ...s, paymentBlocked: !s.paymentBlocked } : s));
  };

  // Update Room Number logic
  const updateRoom = (regNo, newRoom) => {
    setStudents(students.map(s => s.id === regNo ? { ...s, room: newRoom } : s));
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="h-screen bg-[#f8fafc] flex font-sans overflow-hidden text-gray-900">

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* ================= LEFT SIDEBAR (EXACT MATCH: Deep Maroon Theme) ================= */}
      <aside
        className={`fixed top-0 left-0 h-[100dvh] w-64 bg-[#6f1111] text-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-[#4f0b0b]">
          <div className="bg-white text-[#6f1111] font-black text-xl w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
            GPB
          </div>
          <div>
            <h2 className="font-black text-yellow-400 tracking-wider text-sm leading-tight uppercase">Hostel Portal</h2>
            <p className="text-[10px] text-gray-200">Govt. Polytechnic, Barh</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 text-sm font-bold">
          {[
            { id: 'dashboard', name: 'Dashboard Home', icon: '🏠' },
            { id: 'directory', name: 'Student Control', icon: '🧑‍🎓' }, // New Control Tab
            { id: 'fees', name: 'Fee & Payments', icon: '💸' },
            { id: 'leaves', name: 'Leave & Vacate', icon: '✈️' },
            { id: 'complaints', name: 'Complaints', icon: '📢' },
            { id: 'settings', name: 'System Setup', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className={`w-full text-left py-3.5 px-4 rounded-xl transition-all flex items-center gap-3 ${
                activeTab === tab.id
                ? 'bg-[#510808] text-yellow-400 border-l-4 border-yellow-400 shadow-inner'
                : 'hover:bg-white/10 text-gray-200'
              }`}
            >
              <span className="text-lg">{tab.icon}</span> {tab.name}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 bg-[#510808] shrink-0">
          <button onClick={handleLogout} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black tracking-widest uppercase transition-colors shadow-md">
            Log Out
          </button>
        </div>
      </aside>

      {/* ================= RIGHT MAIN CONTENT ================= */}
      <div className={`flex-1 h-full overflow-hidden flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'} relative`}>

        {/* HEADER (Clean White with Role Switcher look) */}
        <header className="bg-white px-6 md:px-10 py-4 border-b border-gray-200 flex justify-between items-center shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 rounded-lg text-gray-600 lg:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome to Dashboard</h1>
              <p className="text-xs font-bold text-gray-500">Chief Warden Control Center</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
             <span className="text-yellow-600 text-xs font-black uppercase tracking-widest">⚙️ Role: Admin</span>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">

            {/* ----------------- 1. DASHBOARD HOME (Blue Banner Theme) ----------------- */}
            {activeTab === 'dashboard' && (
              <div className="animate-fade-in space-y-6">

                {/* Big Blue Banner from your screenshot */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4"></div>
                  <div className="relative z-10">
                    <span className="bg-yellow-400 text-[#6f1111] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Chief Warden Portal</span>
                    <h2 className="text-4xl font-black tracking-tight mb-1">Hello, Admin!</h2>
                    <p className="text-blue-100 font-medium">GP Barh Central Hostel Management System is active.</p>
                  </div>
                </div>

                {/* Stats Grid (Colorful Top Borders) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Students</p>
                    <h3 className="text-5xl font-black text-gray-900">145<span className="text-2xl text-gray-300">/150</span></h3>
                  </div>
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-green-500 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Currently in Hostel</p>
                    <h3 className="text-5xl font-black text-green-500">138</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-2">7 students on leave</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-red-500 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pending Fees (Total)</p>
                    <h3 className="text-5xl font-black text-red-600 font-mono">₹ 45.2K</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-2">From 12 Defaulters</p>
                  </div>
                </div>

              </div>
            )}

            {/* ----------------- 2. STUDENT CONTROL (Room Assign & Payment Block) ----------------- */}
            {activeTab === 'directory' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Student Control Center</h2>
                  <p className="text-sm font-bold text-gray-500 mt-1">Assign rooms, block payments, and manage access.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <input type="text" placeholder="Search by Reg No. or Name..." className="px-5 py-3 rounded-xl border border-gray-300 w-full max-w-md text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                  </div>
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-200 bg-white">
                          <th className="p-5 font-black pl-8">Reg No.</th>
                          <th className="p-5 font-black">Student Details</th>
                          <th className="p-5 font-black">Room Allotment</th>
                          <th className="p-5 font-black text-center">Payment Access</th>
                          <th className="p-5 font-black text-center pr-8">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {students.map((student) => (
                          <tr key={student.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                            <td className="p-5 pl-8 font-mono font-black text-gray-600">{student.id}</td>
                            <td className="p-5">
                              <p className="font-black text-gray-900">{student.name}</p>
                              <p className="text-[10px] font-bold text-gray-500">{student.branch}</p>
                            </td>
                            {/* 🌟 WARDEN CAN MANUALLY SET ROOM NUMBER */}
                            <td className="p-5">
                              <input
                                type="text"
                                value={student.room}
                                onChange={(e) => updateRoom(student.id, e.target.value)}
                                placeholder="Not Set"
                                className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-center font-bold text-blue-700 bg-blue-50 focus:bg-white focus:ring-2 outline-none transition-all"
                              />
                            </td>
                            {/* 🌟 WARDEN CAN BLOCK PAYMENT ACCESS */}
                            <td className="p-5 text-center">
                              <button
                                onClick={() => togglePaymentBlock(student.id)}
                                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none shadow-inner ${student.paymentBlocked ? 'bg-red-500' : 'bg-green-500'}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${student.paymentBlocked ? 'translate-x-1' : 'translate-x-7'}`} />
                              </button>
                              <p className={`text-[9px] font-black uppercase mt-1 ${student.paymentBlocked ? 'text-red-600' : 'text-green-600'}`}>
                                {student.paymentBlocked ? 'Blocked' : 'Active'}
                              </p>
                            </td>
                            <td className="p-5 text-center pr-8">
                              <button className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg text-xs font-black hover:bg-blue-600 hover:text-white transition-all">View Full</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- 3. FEE & PAYMENTS ----------------- */}
            {activeTab === 'fees' && (
              <div className="animate-fade-in space-y-6">
                <div><h2 className="text-3xl font-black text-gray-900 tracking-tight">Fee Management</h2></div>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden p-10 text-center">
                   <h3 className="text-xl font-black text-gray-800 mb-2">Defaulters List</h3>
                   <p className="text-gray-500 font-bold mb-6">List of students who haven't paid this month's fee.</p>
                   <button className="bg-red-600 text-white font-black px-6 py-3 rounded-xl shadow-lg hover:bg-red-700">Send Bulk Reminder Alert</button>
                </div>
              </div>
            )}

            {/* ----------------- 4. LEAVE & VACATE ----------------- */}
            {activeTab === 'leaves' && (
               <div className="animate-fade-in space-y-6">
                 <div><h2 className="text-3xl font-black text-gray-900 tracking-tight">Leave & Vacate Approvals</h2></div>

                 <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-200 bg-gray-50">
                          <th className="p-5 font-black pl-8">Student</th>
                          <th className="p-5 font-black">Type</th>
                          <th className="p-5 font-black">Details</th>
                          <th className="p-5 font-black text-center pr-8">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                          <td className="p-5 pl-8">
                            <p className="font-black text-gray-900">Rahul Singh</p>
                            <p className="text-xs font-mono text-gray-500">1554424050</p>
                          </td>
                          <td className="p-5"><span className="bg-orange-100 text-orange-700 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-orange-200">Outing</span></td>
                          <td className="p-5">
                            <p className="font-bold text-gray-800 text-xs">24 Mar - 28 Mar</p>
                            <p className="text-[10px] text-gray-500">Going home for holidays.</p>
                          </td>
                          <td className="p-5 text-center pr-8 flex gap-2 justify-center">
                             <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-green-700 shadow-md">Approve</button>
                             <button className="bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-200">Reject</button>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                          <td className="p-5 pl-8">
                            <p className="font-black text-gray-900">Sohan Das</p>
                            <p className="text-xs font-mono text-gray-500">1554424012</p>
                          </td>
                          <td className="p-5"><span className="bg-red-100 text-red-700 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-red-200">Vacate</span></td>
                          <td className="p-5">
                            <p className="font-bold text-gray-800 text-xs">Course Completed</p>
                            <button className="text-[10px] text-blue-600 font-bold underline mt-1">View No-Dues PDF</button>
                          </td>
                          <td className="p-5 text-center pr-8">
                             <button className="bg-[#6f1111] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#4f0b0b] shadow-md w-full">Clear & Process Refund</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
               </div>
            )}

            {/* ----------------- 5. COMPLAINTS ----------------- */}
            {activeTab === 'complaints' && (
               <div className="animate-fade-in space-y-6">
                 <div><h2 className="text-3xl font-black text-gray-900 tracking-tight">Complaints Resolution</h2></div>

                 <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
                    <div className="border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50">
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-orange-200">Pending</span>
                              <p className="font-black text-gray-900 text-lg">Water cooler not working</p>
                           </div>
                           <p className="text-xs font-bold text-gray-500">Reported by: Amit Kumar (Room 102) • Electrical Issue</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                           <input type="text" placeholder="Add Admin Remark (e.g. Electrician assigned)" className="px-4 py-2 text-xs font-bold rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-green-500" />
                           <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-md">Mark as Resolved</button>
                        </div>
                    </div>
                 </div>
               </div>
            )}

            {/* ----------------- 6. SYSTEM SETUP ----------------- */}
            {activeTab === 'settings' && (
               <div className="animate-fade-in space-y-6">
                 <div><h2 className="text-3xl font-black text-gray-900 tracking-tight">System Setup</h2><p className="text-sm font-bold text-gray-500">Configure global base fees and late fines.</p></div>

                 <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 max-w-2xl">
                    <form className="space-y-5">
                       <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Registration Fee (₹)</label>
                            <input type="number" defaultValue="500" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-black font-mono bg-gray-50 outline-none focus:ring-2 focus:ring-[#6f1111]" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Security Deposit (₹)</label>
                            <input type="number" defaultValue="1500" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-black font-mono bg-gray-50 outline-none focus:ring-2 focus:ring-[#6f1111]" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Monthly Room Rent (₹)</label>
                            <input type="number" defaultValue="750" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-black font-mono bg-gray-50 outline-none focus:ring-2 focus:ring-[#6f1111]" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Monthly Mess Bill (₹)</label>
                            <input type="number" defaultValue="3400" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-black font-mono bg-gray-50 outline-none focus:ring-2 focus:ring-[#6f1111]" />
                         </div>
                       </div>
                       <button type="button" className="w-full bg-[#6f1111] text-white font-black text-sm tracking-widest uppercase py-4 rounded-xl hover:bg-[#4f0b0b] shadow-lg mt-4">Save Global Fees</button>
                    </form>
                 </div>
               </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default WardenDashboard;