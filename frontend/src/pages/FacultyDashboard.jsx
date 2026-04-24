// src/pages/FacultyDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png.png';

// Inline SVG Icons
const Icons = {
  Profile: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Wallet: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Book: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Wrench: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Menu: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  X: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Upload: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Camera: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Alert: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();

  const currentFormattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => { navigate("/"); };
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const tabs = [
    { id: 'profile', name: 'Staff Profile', icon: <Icons.Profile /> },
    { id: 'rent', name: 'Quarter Rent Hub', icon: <Icons.Wallet /> },
    { id: 'passbook', name: 'Rent Passbook', icon: <Icons.Book /> },
    { id: 'maintenance', name: 'Maintenance Request', icon: <Icons.Wrench /> }
  ];

  // Dummy data for passbook and maintenance tickets
  const passbookData = [
    { id: 1, date: '2023-10-01', description: 'Wallet Top-up', debit: '-', credit: '₹5,000', balance: '₹5,000' },
    { id: 2, date: '2023-10-05', description: 'Oct Quarter Rent', debit: '₹2,000', credit: '-', balance: '₹3,000' },
    { id: 3, date: '2023-10-10', description: 'Oct Mess Bill', debit: '₹2,500', credit: '-', balance: '₹500' },
  ];

  const maintenanceTickets = [
    { id: 'TKT-001', category: 'Plumbing', description: 'Leaking tap in bathroom', status: 'Pending', date: '2023-10-15' },
    { id: 'TKT-002', category: 'Electrical', description: 'Fan regulator not working', status: 'Resolved', date: '2023-09-28' },
  ];

  return (
    <div className="h-screen bg-[#f3f4f6] flex font-sans overflow-hidden text-gray-900">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-[100dvh] w-72 bg-[#111827] text-gray-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-8 border-b border-[#1f2937] text-center flex flex-col items-center shrink-0 relative">
          {window.innerWidth < 1024 && (
             <button onClick={toggleSidebar} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2">
                <Icons.X />
             </button>
          )}
          <div className="w-24 h-24 rounded-full p-1 border-2 border-[#800000] overflow-hidden mb-4 bg-gray-800 relative group cursor-pointer shadow-lg">
            <div className="w-full h-full flex items-center justify-center text-4xl bg-[#1f2937] rounded-full overflow-hidden">
               <span role="img" aria-label="avatar">👨‍🏫</span>
            </div>
          </div>
          <h2 className="text-xl font-black text-white">Dr. Rakesh Sharma</h2>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full mt-2 border border-white/20">Faculty Quarters</p>
          <p className="text-xs text-gray-400 mt-2 font-mono bg-[#0b0f19] px-2 py-1 rounded shadow-inner">Emp ID: EMP0012</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 text-sm font-bold">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => {
                setActiveTab(tab.id);
                if(window.innerWidth < 1024) setIsSidebarOpen(false);
              }} 
              className={`w-full text-left py-3.5 px-5 rounded-xl transition-all flex items-center gap-3.5 ${activeTab === tab.id ? 'bg-[#800000] text-white border-l-4 border-[#eab308] shadow-lg' : 'hover:bg-white/10 text-gray-300'}`}
            >
              <span className={activeTab === tab.id ? 'text-[#eab308]' : 'text-gray-400'}>{tab.icon}</span> 
              {tab.name}
            </button>
          ))}
        </nav>
        <div className="p-5 border-t border-[#1f2937] bg-[#0b0f19] shrink-0">
          <button onClick={handleLogout} className="w-full py-4 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-colors shadow-md flex items-center justify-center gap-2">
            <Icons.Logout /> Log Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 h-full overflow-hidden flex flex-col transition-all duration-300 lg:ml-72">
        <header className="bg-[#800000] text-white px-4 md:px-10 py-4 border-b border-[#5c0000] flex justify-between items-center shadow-md z-30 shrink-0">
          <div className="flex items-center gap-3.5">
            <button onClick={toggleSidebar} className="lg:hidden p-2 -ml-2 text-white hover:bg-white/10 rounded-lg transition-colors">
              <Icons.Menu />
            </button>
            <div className="bg-white p-1 h-10 w-10 md:h-12 md:w-12 rounded-full shadow-lg flex items-center justify-center shrink-0">
              <img src={logo} alt="GP Barh Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-base md:text-2xl font-black leading-tight">Government Polytechnic, Barh</h1>
              <p className="text-[9px] md:text-[10px] text-gray-200 font-bold uppercase tracking-widest mt-0.5">Faculty & Staff Housing Portal</p>
            </div>
          </div>
          <div className="hidden md:flex items-center text-yellow-100 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-sm font-bold shadow-inner">
            {currentFormattedDate}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f3f4f6]">
          <div className="max-w-5xl mx-auto pb-10">
            
            {/* TAB: STAFF PROFILE */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-black text-[#111827]">Staff Profile</h2>
                </div>
                
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#111827] to-[#1f2937] p-6 text-white flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Personal Information</h3>
                      <p className="text-xs text-gray-400 mt-1">Update your housing and contact details</p>
                    </div>
                    <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                      <Icons.Profile />
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8">
                    <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 flex flex-col items-center justify-center mb-4">
                        <div className="relative group">
                           <div className="w-28 h-28 rounded-full border-4 border-gray-100 shadow-md overflow-hidden bg-gray-50 flex items-center justify-center">
                              <span className="text-5xl" role="img" aria-label="avatar">👨‍🏫</span>
                           </div>
                           <label className="absolute bottom-0 right-0 bg-[#800000] text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-[#5c0000] transition-colors border-2 border-white">
                              <Icons.Camera />
                              <input type="file" className="hidden" accept="image/*" />
                           </label>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-3">Click icon to upload profile picture</p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                        <input type="text" defaultValue="Dr. Rakesh Sharma" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-white focus:ring-2 focus:ring-[#800000] outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Employee ID</label>
                        <input type="text" value="EMP0012" disabled readOnly className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-bold bg-gray-100 text-gray-500 cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Department</label>
                        <input type="text" defaultValue="Mechanical Engineering" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-white focus:ring-2 focus:ring-[#800000] outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Quarter / Room Number</label>
                        <input type="text" defaultValue="Type-IV, Qtr-04" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-white focus:ring-2 focus:ring-[#800000] outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Contact Number</label>
                        <input type="text" defaultValue="+91 98765 43210" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-white focus:ring-2 focus:ring-[#800000] outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                        <input type="email" defaultValue="rakesh.sharma@gpbarh.ac.in" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-white focus:ring-2 focus:ring-[#800000] outline-none transition-all" />
                      </div>
                      
                      <div className="md:col-span-2 pt-4 border-t border-gray-100 flex justify-end mt-2">
                        <button type="button" className="bg-[#800000] hover:bg-[#6a0000] text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg transition-colors flex items-center gap-2">
                           Save Profile Data
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: QUARTER RENT HUB */}
            {activeTab === 'rent' && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-black text-[#111827]">Quarter Rent Hub</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* WALLET CARD */}
                  <div className="md:col-span-1 bg-gradient-to-br from-[#111827] to-[#1f2937] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" /></svg>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Prepaid Wallet Balance</p>
                        <h3 className="text-4xl font-black text-[#eab308]">₹500.00</h3>
                        <p className="text-xs text-gray-400 mt-2">Available for rent & mess deductions</p>
                     </div>
                     <button className="w-full bg-[#eab308] hover:bg-yellow-400 text-gray-900 font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-colors mt-6 flex items-center justify-center gap-2 relative z-10">
                        <Icons.Plus /> Top-up Wallet
                     </button>
                  </div>

                  {/* QUICK PAY OPTIONS */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
                        <div>
                           <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                           </div>
                           <h4 className="text-lg font-bold text-gray-900">Monthly Quarter Rent</h4>
                           <p className="text-xs text-gray-500 mt-1 leading-relaxed">Pay your standard monthly accommodation deduction.</p>
                           <p className="text-xl font-black text-[#800000] mt-3">₹2,000</p>
                        </div>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl mt-5 transition-colors shadow-md">
                           Pay from Wallet
                        </button>
                     </div>

                     <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between group hover:shadow-md transition-shadow">
                        <div>
                           <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>
                           </div>
                           <h4 className="text-lg font-bold text-gray-900">Monthly Mess Bill</h4>
                           <p className="text-xs text-gray-500 mt-1 leading-relaxed">Settle your monthly dining and mess charges.</p>
                           <p className="text-xl font-black text-[#800000] mt-3">₹2,500</p>
                        </div>
                        <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl mt-5 transition-colors shadow-md">
                           Pay from Wallet
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RENT PASSBOOK */}
            {activeTab === 'passbook' && (
              <div className="animate-fade-in space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-2xl md:text-3xl font-black text-[#111827]">Rent Passbook</h2>
                  <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
                     <Icons.Download /> Download PDF
                  </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                          <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase tracking-widest">Description</th>
                          <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Debit (Out)</th>
                          <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Credit (In)</th>
                          <th className="p-4 md:p-5 text-xs font-black text-gray-500 uppercase tracking-widest text-right rounded-tr-lg">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {passbookData.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4 md:p-5 text-sm font-medium text-gray-600 whitespace-nowrap">{row.date}</td>
                            <td className="p-4 md:p-5 text-sm font-bold text-gray-900">{row.description}</td>
                            <td className="p-4 md:p-5 text-sm font-bold text-red-600 text-right">{row.debit}</td>
                            <td className="p-4 md:p-5 text-sm font-bold text-green-600 text-right">{row.credit}</td>
                            <td className="p-4 md:p-5 text-sm font-black text-gray-900 text-right">{row.balance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {passbookData.length === 0 && (
                     <div className="p-8 text-center text-gray-500">
                        <Icons.Book className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm font-medium">No transactions found</p>
                     </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: MAINTENANCE REQUEST */}
            {activeTab === 'maintenance' && (
              <div className="animate-fade-in space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl md:text-3xl font-black text-[#111827]">Maintenance Request</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* NEW REQUEST FORM */}
                   <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-[#111827] p-5 text-white flex items-center gap-3">
                         <Icons.Wrench />
                         <h3 className="text-lg font-bold">Lodge New Complaint</h3>
                      </div>
                      <div className="p-6 md:p-8">
                         <form className="space-y-5">
                           <div>
                              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                              <select className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-white focus:ring-2 focus:ring-[#800000] outline-none transition-all appearance-none cursor-pointer">
                                 <option value="">Select Category</option>
                                 <option value="plumbing">Plumbing</option>
                                 <option value="electrical">Electrical</option>
                                 <option value="carpentry">Carpentry</option>
                                 <option value="cleaning">Cleaning</option>
                                 <option value="other">Other</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                              <textarea rows="4" placeholder="Describe the issue in detail..." className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-medium bg-white focus:ring-2 focus:ring-[#800000] outline-none transition-all resize-none"></textarea>
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Upload Photo (Optional)</label>
                              <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#800000] transition-colors cursor-pointer bg-gray-50/50 group">
                                 <div className="group-hover:-translate-y-1 transition-transform">
                                    <Icons.Upload />
                                 </div>
                                 <span className="text-xs font-bold mt-2">Click to upload or drag & drop</span>
                                 <span className="text-[10px] mt-1">PNG, JPG up to 5MB</span>
                                 <input type="file" className="hidden" accept="image/*" />
                              </div>
                           </div>
                           <button type="button" className="w-full bg-[#800000] hover:bg-[#6a0000] text-white font-black text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg transition-colors mt-2">
                              Submit Request
                           </button>
                         </form>
                      </div>
                   </div>

                   {/* ACTIVE TICKETS */}
                   <div className="space-y-4">
                      <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                         <Icons.Book /> Active Maintenance Tickets
                      </h3>
                      <div className="space-y-4">
                         {maintenanceTickets.map(ticket => (
                            <div key={ticket.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative overflow-hidden">
                               <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${ticket.status === 'Resolved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                               <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                     <span className="text-xs font-black text-gray-500 bg-gray-100 px-2 py-1 rounded">{ticket.id}</span>
                                     <span className="text-sm font-bold text-gray-900">{ticket.category}</span>
                                  </div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 ${ticket.status === 'Resolved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                     {ticket.status === 'Resolved' ? <Icons.Check /> : <Icons.Alert />}
                                     {ticket.status}
                                  </span>
                               </div>
                               <p className="text-sm text-gray-600 mt-2 font-medium line-clamp-2">{ticket.description}</p>
                               <div className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                                  <span>Lodged on: {ticket.date}</span>
                               </div>
                            </div>
                         ))}
                         {maintenanceTickets.length === 0 && (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center text-gray-500">
                               <Icons.Wrench />
                               <p className="text-sm font-medium mt-2">No active maintenance tickets</p>
                            </div>
                         )}
                      </div>
                   </div>
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