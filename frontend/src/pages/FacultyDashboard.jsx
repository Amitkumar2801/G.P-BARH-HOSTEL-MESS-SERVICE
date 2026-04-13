// src/pages/FacultyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png.png';

function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const navigate = useNavigate();

  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
  const [profilePic, setProfilePic] = useState(defaultAvatar);

  const currentFormattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🌟 FIX: Removed ugly alert. Silent & smooth navigation.
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="h-screen bg-[#f3f4f6] flex font-sans overflow-hidden text-gray-900">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* SIDEBAR (Dark Premium) */}
      <aside className={`fixed top-0 left-0 h-[100dvh] w-72 bg-[#111827] text-gray-200 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 border-r border-[#1f2937] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-[#1f2937] text-center flex flex-col items-center shrink-0">
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white bg-white/10 rounded-full h-8 w-8 flex items-center justify-center">✕</button>
          <div className="w-24 h-24 rounded-full p-1 border-2 border-[#800000] overflow-hidden mb-4 bg-gray-800">
             <img src={profilePic} alt="Profile" className={`w-full h-full object-cover rounded-full ${profilePic === defaultAvatar ? 'p-2 opacity-50' : ''}`} />
          </div>
          <h2 className="text-xl font-black text-white">Staff Name</h2>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full mt-2.5 border border-white/20">Faculty Member</p>
          <p className="text-xs text-gray-400 mt-2 font-mono">Emp ID: EMP0012</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 text-sm font-bold hide-scrollbar">
          {[
            { id: 'profile', name: 'Manage Profile', icon: '👤' },
            { id: 'payment', name: 'Payments Hub', icon: '💳' },
            { id: 'quarter', name: 'Quarter Passbook', icon: '🏠' },
            { id: 'mess', name: 'Staff Mess Passbook', icon: '🍽️' },
            { id: 'complaint', name: 'Maintenance', icon: '🔧' }
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} className={`w-full text-left py-3.5 px-5 rounded-lg transition-all flex items-center gap-3.5 ${activeTab === tab.id ? 'bg-[#800000] text-white shadow-lg border-l-4 border-yellow-500' : 'hover:bg-white/10 text-gray-300'}`}>
              <span className="text-lg">{tab.icon}</span> {tab.name}
            </button>
          ))}
        </nav>

        <div className="p-5 border-t border-[#1f2937] bg-[#0b0f19] shrink-0">
          <button onClick={handleLogout} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors shadow-md"><span>🚪</span> Log Out</button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className={`flex-1 h-full overflow-hidden flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        {/* HEADER (Maroon) */}
        <header className="bg-[#800000] text-white px-6 md:px-10 py-4 border-b border-[#5c0000] flex justify-between items-center shrink-0 shadow-md z-30">
          <div className="flex items-center gap-5">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white lg:hidden">☰</button>
            <div className="flex items-center gap-3.5">
              <div className="bg-white p-1 h-12 w-12 rounded-full shadow-lg flex items-center justify-center overflow-hidden"><img src={logo} alt="Logo" className="h-full w-full object-contain" /></div>
              <div>
                <h1 className="text-lg md:text-2xl font-black">Government Polytechnic, Barh</h1>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Faculty & Staff Housing Portal</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'profile' && (
              <div className="animate-fade-in space-y-6">
                <div><h2 className="text-3xl font-black text-[#800000]">Faculty Profile</h2><p className="text-sm font-bold text-gray-500 mt-1">Keep your staff details updated.</p></div>
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Full Name</label><input type="text" placeholder="e.g. Dr. Rakesh Sharma" className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50" /></div>
                    <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Employee ID</label><input type="text" value="EMP0012" disabled className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-200 font-mono" /></div>
                    <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Department</label><input type="text" placeholder="e.g. Mechanical Engg" className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50" /></div>
                    <div><label className="block text-[10px] font-black text-gray-500 uppercase mb-1.5">Quarter Number</label><input type="text" placeholder="e.g. QTR-04" className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50" /></div>
                    <div className="md:col-span-2 flex justify-end mt-2"><button type="button" className="bg-blue-600 text-white font-black text-xs px-8 py-3.5 rounded-xl shadow-lg">Save Profile</button></div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="animate-fade-in space-y-6">
                 <div><h2 className="text-3xl font-black text-[#800000]">Payments Hub</h2></div>
                 <div className="bg-gradient-to-r from-[#0d5a57] to-[#168a85] rounded-2xl p-8 text-white shadow-lg">
                    <p className="text-xs font-bold text-teal-100 uppercase tracking-widest mb-1">Prepaid Wallet Balance</p>
                    <h3 className="text-4xl font-black font-mono">₹ 2,500</h3>
                 </div>
                 <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                    <h3 className="text-lg font-black text-gray-800 mb-6 border-b border-gray-100 pb-4">Pay Quarter Rent</h3>
                    <button className="w-full bg-[#0d5a57] text-white font-black text-sm py-4 rounded-xl">Proceed to Gateway</button>
                 </div>
              </div>
            )}

            {(activeTab === 'quarter' || activeTab === 'mess') && (
              <div className="animate-fade-in">
                 <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center">
                    <h3 className="text-2xl font-black text-gray-800 mb-2">Ledger Passbook</h3>
                    <p className="text-gray-500">Your recent deductions and credits will appear here.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default FacultyDashboard;