// src/pages/FacultyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png.png';

function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const navigate = useNavigate();

  const currentFormattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => { navigate("/"); };

  return (
    <div className="h-screen bg-[#f3f4f6] flex font-sans overflow-hidden text-gray-900">
      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-[100dvh] w-72 bg-[#111827] text-gray-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-[#1f2937] text-center flex flex-col items-center shrink-0">
          <div className="w-24 h-24 rounded-full p-1 border-2 border-[#800000] overflow-hidden mb-4 bg-gray-800"><div className="w-full h-full flex items-center justify-center text-4xl">👨‍🏫</div></div>
          <h2 className="text-xl font-black text-white">Staff Name</h2>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full mt-2 border border-white/20">Faculty Quarters</p>
          <p className="text-xs text-gray-400 mt-2 font-mono">Emp ID: EMP0012</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 text-sm font-bold">
          {[
            { id: 'profile', name: 'Staff Profile', icon: '👤' },
            { id: 'rent', name: 'Quarter Rent Hub', icon: '💳' },
            { id: 'complaint', name: 'Maintenance Request', icon: '🔧' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left py-3.5 px-5 rounded-lg transition-all flex items-center gap-3.5 ${activeTab === tab.id ? 'bg-[#800000] text-white border-l-4 border-yellow-500 shadow-lg' : 'hover:bg-white/10 text-gray-300'}`}>
              <span className="text-lg">{tab.icon}</span> {tab.name}
            </button>
          ))}
        </nav>
        <div className="p-5 border-t border-[#1f2937] bg-[#0b0f19] shrink-0">
          <button onClick={handleLogout} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors shadow-md"><span>🚪</span> Log Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className={`flex-1 h-full overflow-hidden flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <header className="bg-[#800000] text-white px-6 md:px-10 py-4 border-b border-[#5c0000] flex justify-between items-center shadow-md z-30">
          <div className="flex items-center gap-3.5">
            <div className="bg-white p-1 h-12 w-12 rounded-full shadow-lg flex items-center justify-center"><img src={logo} alt="GP Barh Logo" className="h-full w-full object-contain" /></div>
            <div>
              <h1 className="text-lg md:text-2xl font-black">Government Polytechnic, Barh</h1>
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Faculty & Staff Housing Portal</p>
            </div>
          </div>
          <div className="hidden md:flex items-center text-teal-100 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-sm font-bold">{currentFormattedDate}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'profile' && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-3xl font-black text-[#800000]">Manage Profile</h2>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label><input type="text" placeholder="e.g. Dr. Rakesh Sharma" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-gray-50" /></div>
                    <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Department</label><input type="text" placeholder="e.g. Mechanical Engg." className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-gray-50" /></div>
                    <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Quarter / Room Number</label><input type="text" placeholder="e.g. Qtr-04" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-gray-50" /></div>
                    <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Contact Number</label><input type="text" placeholder="e.g. +91 XXXXX XXXXX" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-gray-50" /></div>
                    <div className="md:col-span-2 flex justify-end mt-4"><button type="button" className="bg-[#0d5a57] text-white font-black text-xs uppercase px-8 py-3.5 rounded-xl shadow-lg">Save Data</button></div>
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

export default FacultyDashboard;