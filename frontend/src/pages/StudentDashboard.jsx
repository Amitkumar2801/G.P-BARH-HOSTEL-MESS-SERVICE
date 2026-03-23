// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png.png';

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const navigate = useNavigate();

  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'/%3E%3C/svg%3E";
  const [profilePic, setProfilePic] = useState(defaultAvatar);

  const [profileData, setProfileData] = useState({
    fullName: "",
    regNo: "1554424049",
    branch: "",
    bloodGroup: "",
    contact: "",
    email: "",
    address: ""
  });

  const handleSaveProfile = () => {
    alert("Profile Data Captured! Ready to send to Database: \n" + JSON.stringify(profileData, null, 2));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePic(imageUrl);
    }
  };

  // Payment Form States
  const [paymentType, setPaymentType] = useState("");
  const [paymentCycle, setPaymentCycle] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(1200);

  // Header Date Calculation
  const today = new Date();
  const currentFormattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // DYNAMIC LATE FINE LOGIC
  const currentDay = today.getDate();
  const daysLate = Math.max(0, currentDay - 5);
  const isLate = daysLate > 0;
  const lateFine = daysLate * 50;

  const monthlyHostelRent = 750;
  const monthlyMessFee = 3400;

  let baseAmount = 0;
  if (paymentType === 'monthly_hostel') baseAmount = monthlyHostelRent;
  else if (paymentType === 'monthly_mess') baseAmount = monthlyMessFee;
  else if (paymentType === 'security') baseAmount = 1500;
  else if (paymentType === 'misc') baseAmount = 500;
  else if (paymentType === 'sem_hostel') {
    baseAmount = paymentCycle === 'Jan-May' ? 3750 : 4500;
  }
  else if (paymentType === 'sem_mess') {
    baseAmount = paymentCycle === 'Jan-May' ? 17000 : 20400;
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    alert("Logged Out Successfully!");
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
          >
            ✕
          </button>

          <div className="w-24 h-24 rounded-full p-1 border-2 border-[#800000] overflow-hidden mb-4 bg-gray-800 mt-2 lg:mt-0 shadow-xl relative group">
             <img src={profilePic} alt="Profile" className={`w-full h-full object-cover rounded-full ${profilePic === defaultAvatar ? 'p-2 opacity-50' : ''}`} />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">{profileData.fullName || "Student Name"}</h2>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full mt-2.5 border border-white/20">Update Profile</p>
          <p className="text-xs text-gray-400 mt-2 font-mono font-medium">Reg: {profileData.regNo}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 text-sm font-bold hide-scrollbar">
          {[
            { id: 'profile', name: 'Manage Profile', icon: '👤' },
            { id: 'payment', name: 'Payments Hub', icon: '💳' },
            { id: 'hostel', name: 'Hostel Passbook', icon: '🏢' },
            { id: 'mess', name: 'Mess Passbook', icon: '🍽️' },
            { id: 'leave', name: 'Hostel Clearance', icon: '✈️' },
            { id: 'complaint', name: 'Complaints', icon: '📢' },
            { id: 'qr_scanner', name: 'App Web Scan', icon: '📱' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className={`w-full text-left py-3.5 px-5 rounded-lg transition-all flex items-center gap-3.5 ${
                activeTab === tab.id
                ? 'bg-[#800000] text-white shadow-lg border-l-4 border-yellow-500' // Maroon Active state
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
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Hostel & Mess Management System</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
             <div className="bg-white/10 px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]"></span>
                <span className="text-xs font-bold uppercase tracking-widest">In Hostel</span>
             </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto">

            {/* ----------------- 1. MY PROFILE ----------------- */}
            {activeTab === 'profile' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-[#800000] tracking-tight">Manage Profile</h2>
                  <p className="text-sm font-bold text-gray-500 mt-1">Keep your details updated for official records.</p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-md border border-gray-200">
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="flex flex-col items-center space-y-4 w-full md:w-1/4">
                      <div className="relative w-32 h-32 rounded-full border-4 border-gray-100 shadow-md bg-gray-50 flex items-center justify-center">
                        <img src={profilePic} alt="Profile" className={`w-full h-full object-cover rounded-full ${profilePic === defaultAvatar ? 'p-6 opacity-30' : ''}`} />
                        <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full cursor-pointer shadow-lg border-2 border-white transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Profile Photo</p>
                    </div>

                    <div className="w-full md:w-3/4">
                      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
                          <input type="text" value={profileData.fullName} onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} placeholder="e.g. Amit Kumar" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold text-gray-800 bg-gray-50" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Registration Number</label>
                          <input type="text" value={profileData.regNo} disabled className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed text-sm font-mono font-bold" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Branch & Semester</label>
                          <input type="text" value={profileData.branch} onChange={(e) => setProfileData({...profileData, branch: e.target.value})} placeholder="e.g. AI & ML (4th Sem)" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold text-gray-800 bg-gray-50" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Blood Group</label>
                          <select value={profileData.bloodGroup} onChange={(e) => setProfileData({...profileData, bloodGroup: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold text-gray-800 bg-gray-50">
                            <option value="">Select Group</option><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Contact Number</label>
                          <input type="text" value={profileData.contact} onChange={(e) => setProfileData({...profileData, contact: e.target.value})} placeholder="e.g. +91 98765 43210" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold text-gray-800 bg-gray-50" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                          <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} placeholder="e.g. student@gpb.ai.in" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold text-gray-800 bg-gray-50" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Full Permanent Address</label>
                          <textarea rows="2" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} placeholder="Vill, City, State, Pincode" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-bold text-gray-800 bg-gray-50 resize-none"></textarea>
                        </div>
                        <div className="md:col-span-2 flex justify-end mt-2">
                          <button type="button" onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs tracking-widest uppercase px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2">
                            <span>💾</span> Save Profile Data
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- 2. PAYMENTS CENTER ----------------- */}
            {activeTab === 'payment' && (
              <div className="animate-fade-in space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-[#800000] tracking-tight">Payments Hub</h2>
                  <p className="text-sm font-bold text-gray-500 mt-1">Smart payment gateway. Late fine applies automatically after 5th of every month.</p>
                </div>

                <div className="bg-gradient-to-r from-[#0d5a57] to-[#168a85] rounded-2xl p-8 flex justify-between items-center shadow-lg text-white border border-[#0a4745]">
                  <div>
                    <p className="text-xs font-bold text-teal-100 uppercase tracking-widest mb-1">My Prepaid Wallet Balance</p>
                    <h3 className="text-4xl font-black font-mono">₹ {walletBalance}</h3>
                    <p className="text-xs font-medium text-teal-100 mt-2">Deduction due on 1st: ₹{monthlyHostelRent + monthlyMessFee}</p>
                  </div>
                  <div className="text-4xl opacity-20 hidden md:block">💳</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Payment Form */}
                  <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 h-full">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                      <h3 className="text-lg font-black text-gray-800 flex items-center gap-2.5"><span>⚡</span> Instant Gateway Pay</h3>
                      {(paymentType === 'monthly_hostel' || paymentType === 'monthly_mess') && isLate &&
                        <span className="bg-red-100 text-red-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border border-red-200">Late Fine Active</span>
                      }
                    </div>

                    <form className="space-y-5">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Select Payment Type</label>
                        <select
                          value={paymentType}
                          onChange={(e) => {
                              setPaymentType(e.target.value);
                              setPaymentCycle("");
                          }}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0d5a57] outline-none text-sm font-bold bg-gray-50 cursor-pointer"
                        >
                          <option value="" disabled>-- Choose Option --</option>
                          <optgroup label="Direct Gateway Pay">
                            <option value="custom_topup">Top-up Wallet Balance (GateWay)</option>
                          </optgroup>
                          <optgroup label="Monthly Dues">
                            <option value="monthly_hostel">Monthly Hostel Rent (₹750)</option>
                            <option value="monthly_mess">Monthly Mess Bill (₹3400)</option>
                          </optgroup>
                          <optgroup label="Full Semester Advance">
                            <option value="sem_hostel">Hostel Rent (Full Semester)</option>
                            <option value="sem_mess">Mess Bill (Full Semester)</option>
                          </optgroup>
                          <optgroup label="One-Time Dues">
                            <option value="security">Security Deposit (₹1500)</option>
                            <option value="misc">Misc / Generator Fee (₹500)</option>
                          </optgroup>
                        </select>
                      </div>

                      {(paymentType === 'sem_hostel' || paymentType === 'sem_mess') && (
                        <div className="animate-fade-in">
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Select Payment Cycle</label>
                          <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setPaymentCycle("Jan-May")} className={`py-3 rounded-xl border font-bold text-xs transition-colors ${paymentCycle === 'Jan-May' ? 'bg-[#0d5a57] text-white border-[#0d5a57]' : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'}`}>Jan to May (5 Mths)</button>
                            <button type="button" onClick={() => setPaymentCycle("Jul-Dec")} className={`py-3 rounded-xl border font-bold text-xs transition-colors ${paymentCycle === 'Jul-Dec' ? 'bg-[#0d5a57] text-white border-[#0d5a57]' : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'}`}>Jul to Dec (6 Mths)</button>
                          </div>
                        </div>
                      )}

                      {paymentType && (
                        <div className="bg-[#fdfbf7] p-5 rounded-xl border border-[#e5d5b5]">
                          {paymentType === 'custom_topup' ? (
                            <div>
                              <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Enter Manual Amount (₹)</label>
                              <input
                                type="number"
                                placeholder="e.g. 5000"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0d5a57] outline-none text-lg font-black text-gray-900 font-mono"
                              />
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-700">Base Amount:</span>
                                <span className="text-sm font-mono font-black text-gray-900">₹{baseAmount}</span>
                              </div>

                              {(paymentType === 'monthly_hostel' || paymentType === 'monthly_mess') && isLate && (
                                <div className="flex justify-between items-center text-red-600">
                                  <span className="text-xs font-bold uppercase tracking-widest">Late Fine ({daysLate} days late):</span>
                                  <span className="text-xs font-mono font-black">+ ₹{lateFine}</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center border-t border-gray-300 pt-3 mt-3">
                                <span className="text-sm font-black uppercase tracking-widest text-[#800000]">Total Payable:</span>
                                <span className="text-2xl font-mono font-black text-[#0d5a57]">
                                  ₹{baseAmount + ((paymentType === 'monthly_hostel' || paymentType === 'monthly_mess') && isLate ? lateFine : 0)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <button type="button" disabled={!paymentType || ((paymentType === 'sem_hostel' || paymentType === 'sem_mess') && !paymentCycle)} className={`w-full font-black text-sm tracking-widest uppercase py-4 rounded-xl transition-all ${paymentType && (!(paymentType === 'sem_hostel' || paymentType === 'sem_mess') || paymentCycle) ? 'bg-[#0d5a57] text-white hover:bg-[#0a4745] shadow-lg cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                        Proceed to Pay Securely
                      </button>
                    </form>
                  </div>

                  <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 h-full">
                    <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2.5 border-b border-gray-100 pb-4"><span>📥</span> Statements & Legacy</h3>
                    <div className="space-y-6">
                        <form className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Statement Category</label>
                            <select className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0d5a57] outline-none text-sm font-bold bg-gray-50 cursor-pointer">
                              <option>Hostel Fee Receipts</option>
                              <option>Mess Fee Receipts</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Select Semester / Year</label>
                            <select className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0d5a57] outline-none text-sm font-bold bg-gray-50 cursor-pointer">
                              <option>Semester 1 (1st Year)</option>
                              <option>Semester 2 (1st Year)</option>
                            </select>
                          </div>
                          <button type="button" className="w-full bg-[#fdfbf7] border-2 border-[#0d5a57] text-[#0d5a57] font-black text-sm tracking-widest uppercase py-3.5 rounded-xl hover:bg-[#0d5a57] hover:text-white transition-all flex items-center justify-center gap-2">
                            Generate Official PDF
                          </button>
                        </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- 3. HOSTEL PASSBOOK ----------------- */}
            {activeTab === 'hostel' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in space-y-0">
                <div className="bg-[#f5ebd6] p-6 border-b-2 border-[#800000]">
                  <h3 className="text-2xl font-black text-[#800000] mb-1">Hostel Passbook Ledger</h3>
                  <p className="text-xs font-bold text-gray-600">Monthly deduction history and available balance.</p>
                </div>
                <div className="bg-[#800000] text-white px-6 py-4 flex justify-between items-center">
                  <span className="text-sm font-bold tracking-wide">Current Hostel Balance:</span>
                  <span className="text-2xl font-black font-mono">₹4000</span>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[700px] bg-[#fdfbf7]">
                    <thead>
                      <tr className="text-gray-600 text-[11px] uppercase tracking-widest border-b-2 border-[#e5d5b5]">
                        <th className="p-4 font-black pl-6">Date</th>
                        <th className="p-4 font-black">Description</th>
                        <th className="p-4 font-black text-[#c82333]">Debit (-)</th>
                        <th className="p-4 font-black text-[#0d5a57]">Credit (+)</th>
                        <th className="p-4 font-black text-gray-800">Balance</th>
                        <th className="p-4 font-black text-center pr-6">Receipt PDF</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-[#e5d5b5] hover:bg-white transition-colors">
                        <td className="p-4 font-bold text-gray-600 pl-6">{currentFormattedDate}</td>
                        <td className="p-4 font-bold text-gray-800">Monthly Rent Deduction</td>
                        <td className="p-4 font-black text-[#c82333] font-mono">-₹750</td>
                        <td className="p-4 font-bold text-gray-400">-</td>
                        <td className="p-4 font-black text-gray-900 font-mono">₹3250</td>
                        <td className="p-4 text-center pr-6">
                           <button className="bg-[#800000] text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider hover:bg-[#5c0000]">Download</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ----------------- 4. MESS PASSBOOK ----------------- */}
            {activeTab === 'mess' && (
               <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in space-y-0">
               <div className="bg-[#e2f0ef] p-6 border-b-2 border-[#0d5a57]">
                 <h3 className="text-2xl font-black text-[#0d5a57] mb-1">Mess Passbook Ledger</h3>
                 <p className="text-xs font-bold text-gray-600">Monthly deduction history and available mess balance.</p>
               </div>
               <div className="bg-[#0d5a57] text-white px-6 py-4 flex justify-between items-center">
                 <span className="text-sm font-bold tracking-wide">Current Mess Balance:</span>
                 <span className="text-2xl font-black font-mono">₹18400</span>
               </div>
               <div className="overflow-x-auto w-full">
                 <table className="w-full text-left border-collapse min-w-[700px] bg-[#fdfbf7]">
                   <thead>
                     <tr className="text-gray-600 text-[11px] uppercase tracking-widest border-b-2 border-[#d2e0df]">
                       <th className="p-4 font-black pl-6">Date</th>
                       <th className="p-4 font-black">Description</th>
                       <th className="p-4 font-black text-[#c82333]">Debit (-)</th>
                       <th className="p-4 font-black text-[#0d5a57]">Credit (+)</th>
                       <th className="p-4 font-black text-gray-800">Balance</th>
                       <th className="p-4 font-black text-center pr-6">Receipt PDF</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     <tr className="border-b border-[#d2e0df] hover:bg-white transition-colors">
                       <td className="p-4 font-bold text-gray-600 pl-6">{currentFormattedDate}</td>
                       <td className="p-4 font-bold text-gray-800">Paid Mess Dues</td>
                       <td className="p-4 font-black text-[#c82333] font-mono">-₹3400</td>
                       <td className="p-4 font-bold text-gray-400">-</td>
                       <td className="p-4 font-black text-gray-900 font-mono">₹15000</td>
                       <td className="p-4 text-center pr-6">
                          <button className="bg-[#0d5a57] text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider hover:bg-[#0a4745]">Download</button>
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </div>
             </div>
            )}

            {/* ----------------- 5. LEAVE & VACATE PORTAL (RESTORED FULL FORM) ----------------- */}
            {activeTab === 'leave' && (
              <div className="animate-fade-in">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
                  <div className="text-center mb-8 border-b border-gray-100 pb-8">
                    <h3 className="text-2xl font-black text-[#800000] mb-2">Hostel Clearance & Vacate Portal</h3>
                    <p className="text-sm font-bold text-gray-500">Only for permanent leave, course completion, or shifting permanently.</p>
                  </div>

                  <form className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Student Details</p>
                        <p className="text-sm font-black text-gray-800">{profileData.fullName || "Name Not Set"} <span className="text-gray-500 font-medium ml-2 font-mono">({profileData.regNo})</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Date of Application</p>
                        <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Reason for Leaving permanently</label>
                        <select className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0d5a57] outline-none text-sm font-bold bg-gray-50 cursor-pointer">
                          <option>Course Completed (Passout)</option>
                          <option>Shifting to Private Room</option>
                          <option>Medical / Other reasons</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Expected Date of Leaving</label>
                        <input type="date" className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0d5a57] outline-none text-sm font-bold bg-gray-50" />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4">Bank Details (For Security Deposit Refund)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <input type="text" placeholder="Account Holder Name" className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none text-sm font-bold bg-white" />
                        </div>
                        <div>
                          <input type="text" placeholder="Bank Name" className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none text-sm font-bold bg-white" />
                        </div>
                        <div>
                          <input type="text" placeholder="Account Number" className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none text-sm font-bold bg-white" />
                        </div>
                        <div className="md:col-span-2">
                          <input type="text" placeholder="IFSC Code" className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none text-sm font-bold bg-white" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 border-dashed text-center">
                      <label className="block text-xs font-black text-blue-700 uppercase tracking-widest mb-3">Upload Signed No-Dues Application (PDF)</label>
                      <input type="file" accept="application/pdf" className="block w-full max-w-sm mx-auto text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer transition-colors" />
                      <p className="text-[10px] text-gray-500 mt-3 font-medium">Form must be signed by Chief Warden & Library In-charge.</p>
                    </div>

                    <button type="button" className="w-full bg-[#0d5a57] text-white font-black text-sm tracking-widest uppercase py-4 rounded-xl hover:bg-[#0a4745] shadow-lg transition-all mt-4">Submit Clearance Request</button>
                  </form>
                </div>
              </div>
            )}

            {/* ----------------- 6. COMPLAINTS (RESTORED FULL FORM) ----------------- */}
            {activeTab === 'complaint' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-fade-in">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                  <h3 className="text-xl font-black text-[#800000] mb-6 flex items-center gap-2.5 border-b border-gray-100 pb-4"><span>📢</span> Lodge a Complaint</h3>
                  <form className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Category</label>
                      <select className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0d5a57] outline-none text-sm font-bold bg-gray-50 cursor-pointer">
                        <option>Electrical (Fan, Light, Switch)</option>
                        <option>Plumbing (Tap, Washroom)</option>
                        <option>Mess / Food Quality</option>
                        <option>Cleaning / Hygiene</option>
                        <option>Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                      <textarea rows="4" placeholder="Describe the exact issue and location..." className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0d5a57] outline-none text-sm font-medium bg-gray-50 resize-none"></textarea>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 border-dashed">
                      <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Upload Proof (Photo / Video)</label>
                      <input type="file" accept="image/*,video/*" className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-white file:border file:border-gray-300 file:text-gray-800 hover:file:bg-gray-100 cursor-pointer transition-colors" />
                    </div>
                    <button type="button" className="w-full bg-[#0d5a57] text-white font-black text-sm tracking-widest uppercase py-4 rounded-xl hover:bg-[#0a4745] shadow-lg transition-all">Submit Complaint</button>
                  </form>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                  <h3 className="text-xl font-black text-[#800000] mb-6 flex items-center gap-2.5 border-b border-gray-100 pb-4"><span>📌</span> My Complaint Status</h3>
                  <div className="space-y-5">
                    <div className="p-5 border-l-4 border-l-orange-500 border border-gray-100 rounded-r-2xl bg-white shadow-sm flex flex-col gap-2 relative">
                      <span className="absolute top-5 right-5 bg-orange-50 text-orange-600 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-orange-100">Pending</span>
                      <p className="font-bold text-gray-900 text-lg pr-16 leading-tight">Water cooler not working</p>
                      <p className="text-xs font-medium text-gray-500">Submitted: 2 hrs ago</p>
                      <button className="text-xs text-blue-600 font-bold hover:underline self-start mt-1 flex items-center gap-1.5"><span>📎</span> View Attached Proof</button>
                    </div>
                    <div className="p-5 border-l-4 border-l-green-500 border border-gray-100 rounded-r-2xl bg-white shadow-sm flex flex-col gap-2 relative opacity-75">
                      <span className="absolute top-5 right-5 bg-green-50 text-green-600 px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-green-100">Resolved</span>
                      <p className="font-bold text-gray-900 text-lg pr-16 leading-tight line-through decoration-gray-300">Fan regulator broken</p>
                      <p className="text-xs font-medium text-gray-500">Resolved: 2 Days ago</p>
                      <div className="bg-green-50 p-2 mt-2 rounded border border-green-100 text-xs font-medium text-green-800">
                        <strong>Admin:</strong> "Electrician replaced the switch."
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- 7. APP WEB SCAN ----------------- */}
            {activeTab === 'qr_scanner' && (
              <div className="animate-fade-in">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-200 max-w-2xl mx-auto text-center">
                  <h2 className="text-3xl font-black text-[#800000] tracking-tight mb-2">Connect to Mobile App</h2>
                  <p className="text-sm font-bold text-gray-500 mb-8">Scan this unique QR code from your GP Barh Mobile App to sync your session.</p>

                  <div className="w-64 h-64 bg-gray-50 border-4 border-gray-200 rounded-3xl mx-auto flex items-center justify-center relative overflow-hidden shadow-inner cursor-pointer hover:border-[#0d5a57] transition-all">
                      <div className="grid grid-cols-4 gap-2 opacity-30">
                          {[...Array(16)].map((_, i) => <div key={i} className="w-10 h-10 bg-gray-800 rounded-sm"></div>)}
                      </div>
                      <div className="absolute w-full h-1 bg-[#0d5a57] shadow-[0_0_20px_4px_rgba(13,90,87,0.8)] animate-scan"></div>
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
            <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest mt-0.5">Government Polytechnic, Barh</p>
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

export default StudentDashboard;