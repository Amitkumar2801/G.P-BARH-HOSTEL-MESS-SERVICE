import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🌟 NAYA: Login page se aaya hua data pakdo. Agar data nahi hai, toh default 'boy' (student) dikhao.
  const [currentRole, setCurrentRole] = useState(location.state?.userRole || 'boy');
  const userName = location.state?.userName || 'Student';

  // Taki agar 'student' role aaye, toh hum usko apne UI ke hisaab se 'boy' me map kar dein
  useEffect(() => {
    if (location.state?.userRole === 'student') setCurrentRole('boy');
    else if (location.state?.userRole === 'warden') setCurrentRole('warden');
    else if (location.state?.userRole === 'parent') setCurrentRole('parent');
  }, [location.state]);

  // Payment Simulation States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCallback, setPaymentCallback] = useState(null);

  const simulatePayment = (amount, callback) => {
    setPaymentAmount(amount);
    setPaymentCallback(() => callback);
    setShowPaymentModal(true);
    setPaymentStep(1);
    setTimeout(() => {
      setPaymentStep(2);
      setTimeout(() => {
        setPaymentStep(3);
        setTimeout(() => {
          setShowPaymentModal(false);
          if (callback) callback();
        }, 2000);
      }, 2000);
    }, 1500);
  };

  const handleLogout = () => {
    toast.success("Authentication session terminated successfully.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }});
    setTimeout(() => navigate("/"), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <Toaster position="top-right" />
      <style>{`
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'}}>
          <div style={{background: '#ffffff', width: '90%', maxWidth: '420px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #e2e8f0'}}>
            <div style={{background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'DM Sans', sans-serif"}}>
                <div style={{width: '28px', height: '28px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
                </div>
                SecurePay Gateway
              </div>
              <div style={{fontSize: '12px', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px'}}>GP Barh</div>
            </div>
            <div style={{padding: '40px 32px', textAlign: 'center'}}>
              {paymentStep === 1 && (
                <div className="animate-fade-in">
                  <div style={{fontSize: '56px', marginBottom: '24px', display: 'inline-block', animation: 'pulse 2s infinite'}}>🏦</div>
                  <h3 style={{fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: '#0f172a'}}>Connecting to Secure Server...</h3>
                  <p style={{color: '#64748b', fontSize: '15px', fontWeight: 500}}>Establishing 256-bit encrypted connection to bank.</p>
                </div>
              )}
              {paymentStep === 2 && (
                <div className="animate-fade-in">
                  <div style={{margin: '0 auto 32px', width: '64px', height: '64px', border: '5px solid #f1f5f9', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                  <h3 style={{fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: '#0f172a'}}>Processing Processing: {paymentAmount}</h3>
                  <p style={{color: '#dc2626', fontSize: '14px', fontWeight: 700}}>Please do not refresh or close this window.</p>
                </div>
              )}
              {paymentStep === 3 && (
                <div className="animate-fade-in">
                  <div style={{width: '72px', height: '72px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)'}}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h3 style={{fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: '#0f172a'}}>Transaction Authorized!</h3>
                  <p style={{color: '#64748b', fontSize: '15px', fontWeight: 600}}>Redirecting back to your dashboard...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className="w-full md:w-64 bg-[#4a0404] text-white shadow-xl flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center space-x-3">
          <div className="bg-white p-1 rounded-full h-10 w-10 flex items-center justify-center">
            <span className="text-[#4a0404] font-black text-xs">GPB</span>
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest uppercase text-yellow-500">Hostel Portal</h2>
            <p className="text-[10px] text-gray-300">Govt. Polytechnic, Barh</p>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2 text-sm font-semibold">
          <a href="#" className="block py-2.5 px-4 rounded-lg bg-white/10 text-yellow-400 border-l-4 border-yellow-400">🏠 Dashboard Home</a>
          <a href="#" className="block py-2.5 px-4 rounded-lg hover:bg-white/5 transition-colors">🍽️ Mess Menu & Rebate</a>
          <a href="#" className="block py-2.5 px-4 rounded-lg hover:bg-white/5 transition-colors">💸 Fee & Payments</a>
          <a href="#" className="block py-2.5 px-4 rounded-lg hover:bg-white/5 transition-colors">📝 Complaints</a>
          <a href="#" className="block py-2.5 px-4 rounded-lg hover:bg-white/5 transition-colors">🧹 Room Cleaning</a>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors">
            Log Out
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-grow flex flex-col h-screen overflow-y-auto">

        {/* TOP NAVBAR */}
        <header className="bg-white shadow-sm py-4 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center border-b border-gray-200 sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Welcome to Dashboard</h1>
            <p className="text-xs text-gray-500 font-medium">Your digital hostel assistant.</p>
          </div>

          {/* 🛠️ DEV MODE: ROLE SWITCHER */}
          <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-yellow-50 p-2 rounded-lg border border-yellow-200">
            <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest">⚙️ Dev Test: Switch Role</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="text-sm font-bold bg-white border border-yellow-300 text-gray-800 rounded px-2 py-1 outline-none cursor-pointer shadow-sm"
            >
              <option value="boy">👨 Boys Hostel</option>
              <option value="girl">👩 Girls Hostel</option>
              <option value="warden">🛡️ Warden / Admin</option>
              <option value="parent">👪 Parents/Guest</option>
            </select>
          </div>
        </header>

        {/* DYNAMIC DASHBOARD CONTENT */}
        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* ----------------------------------------------------------------- */}
          {/* 1. STUDENT SECTION (Boys & Girls Combined Features for UI Demo) */}
          {/* ----------------------------------------------------------------- */}
          {(currentRole === 'boy' || currentRole === 'girl') && (
            <>
              {/* WELCOME BANNER */}
              <div className={`p-6 rounded-2xl shadow-lg text-white col-span-1 md:col-span-2 lg:col-span-3 flex justify-between items-center ${
                currentRole === 'boy' ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-pink-600 to-purple-800'
              }`}>
                <div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
                    {currentRole === 'boy' ? 'Boys Hostel Wing' : 'Girls Hostel Wing'}
                  </span>
                  <h2 className="text-3xl font-black">Hello, {currentRole === 'boy' ? 'Amit Sharma' : 'ANUSHKA'}</h2>
                  <p className="opacity-90 mt-1">Room No. {currentRole === 'boy' ? '102' : '205'} | Reg: 15544240{currentRole === 'boy' ? '49' : '50'}</p>
                </div>
                <div className="hidden md:block text-6xl opacity-20">
                  {currentRole === 'boy' ? '🛏️' : '🛡️'}
                </div>
              </div>

              {/* 🌟 NAYA: LEAVE & MESS REBATE */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-yellow-500 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">Leave & Mess Rebate</h3>
                  <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-bold">Active</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Going home? Apply for leave to pause your daily mess charges automatically.</p>
                <button onClick={() => toast.success("Leave/Rebate application submitted successfully.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }})} className="w-full bg-yellow-50 text-yellow-700 font-bold text-xs py-2.5 rounded hover:bg-yellow-100 transition-colors border border-yellow-200">
                  ✈️ Apply Leave / Rebate
                </button>
              </div>

              {/* 🌟 NAYA: COMPLAINT BOX */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-gray-700 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-800 mb-2">Helpdesk & Complaints</h3>
                <p className="text-xs text-gray-500 mb-4">Fan not working? Plumbing issue? Mess food problem? Raise a ticket here.</p>
                <button onClick={() => toast.success("Complaint officially registered.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }})} className="w-full bg-gray-100 text-gray-800 font-bold text-xs py-2.5 rounded hover:bg-gray-200 transition-colors border border-gray-300">
                  📢 Lodge a Complaint
                </button>
              </div>

              {/* PENDING DUES */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-red-500 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-800 mb-1">Pending Mess Dues</h3>
                <p className="text-3xl font-black text-red-600">₹ 2,450</p>
                <p className="text-[10px] text-gray-400 mt-1 mb-3">Due date: 10th of this month</p>
                <button onClick={() => simulatePayment("₹ 2,450", () => toast.success("Dues successfully cleared.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }}))} className="w-full bg-red-50 text-red-600 font-bold text-xs py-2.5 rounded hover:bg-red-100 transition-colors border border-red-200">
                  💳 Pay Now
                </button>
              </div>

              {/* TODAY'S MENU */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-green-500 hover:shadow-md transition-shadow col-span-1 md:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-800">Today's Mess Menu</h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Wednesday</span>
                </div>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-2 rounded text-sm"><strong className="text-black">🍳 Breakfast:</strong> Poha, Jalebi, Tea</div>
                  <div className="bg-gray-50 p-2 rounded text-sm"><strong className="text-black">🍛 Lunch:</strong> Rajma Chawal, Roti, Salad</div>
                  <div className="bg-gray-50 p-2 rounded text-sm"><strong className="text-black">🥘 Dinner:</strong> Paneer Masala, Naan, Gulab Jamun</div>
                </div>
              </div>

              {/* 🌟 BONUS: PREMIUM SERVICES */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-indigo-500 hover:shadow-md transition-shadow col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-4">
                <div className="col-span-2"><h3 className="font-bold text-gray-800 mb-1">Hostel Facilities</h3></div>

                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex flex-col justify-center">
                  <span className="text-xl mb-1">🧹</span>
                  <h4 className="text-xs font-bold text-indigo-900 mb-1">Room Cleaning</h4>
                  <p className="text-[9px] text-indigo-700/70 mb-2">Request sweep & mop.</p>
                  <button onClick={() => toast.success("Cleaning scheduled successfully.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }})} className="bg-indigo-600 text-white text-[10px] font-bold py-1.5 rounded hover:bg-indigo-700">Schedule</button>
                </div>

                <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-100 flex flex-col justify-center">
                  <span className="text-xl mb-1">🧺</span>
                  <h4 className="text-xs font-bold text-cyan-900 mb-1">Laundry Slot</h4>
                  <p className="text-[9px] text-cyan-700/70 mb-2">Book washing machine.</p>
                  <button onClick={() => toast.success("Laundry slot booked successfully.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }})} className="bg-cyan-600 text-white text-[10px] font-bold py-1.5 rounded hover:bg-cyan-700">Book Slot</button>
                </div>
              </div>
            </>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* 2. WARDEN / ADMIN SECTION (Supercharged) */}
          {/* ----------------------------------------------------------------- */}
          {currentRole === 'warden' && (
            <>
              {/* WARDEN WELCOME BANNER */}
              <div className="bg-gradient-to-br from-gray-800 to-black p-6 rounded-2xl shadow-lg text-white col-span-1 md:col-span-2 lg:col-span-3 flex justify-between items-center border-l-4 border-yellow-500">
                <div>
                  <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">Chief Warden Portal</span>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Welcome, Admin</h2>
                  <p className="text-gray-400 mt-1 font-medium">GP Barh Central Hostel Management</p>
                </div>
                <div className="hidden md:block text-6xl opacity-30">🛡️</div>
              </div>

              {/* QUICK STATS (Live Dashboard Numbers) */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500 flex flex-col justify-center">
                <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Total Students</h3>
                <p className="text-4xl font-black text-gray-800">145<span className="text-lg text-gray-400 font-medium">/150</span></p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-green-500 flex flex-col justify-center">
                <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Currently In Hostel</h3>
                <p className="text-4xl font-black text-green-600">138</p>
                <p className="text-xs text-gray-400 mt-1">7 students on approved leave</p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-red-500 flex flex-col justify-center">
                <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Pending Fees (Total)</h3>
                <p className="text-4xl font-black text-red-600">₹ 45.2K</p>
                <p className="text-xs text-gray-400 mt-1">From 12 students</p>
              </div>

              {/* STUDENT MANAGEMENT TABLE */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 col-span-1 md:col-span-2 lg:col-span-3 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-800">Student Directory & Status</h3>
                  <button className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700">🔍 Search Student</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest">
                        <th className="p-4 font-bold border-b border-gray-200">Reg No.</th>
                        <th className="p-4 font-bold border-b border-gray-200">Name</th>
                        <th className="p-4 font-bold border-b border-gray-200">Room</th>
                        <th className="p-4 font-bold border-b border-gray-200">Status</th>
                        <th className="p-4 font-bold border-b border-gray-200">Pending Dues</th>
                        <th className="p-4 font-bold border-b border-gray-200 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {/* Student 1 */}
                      <tr className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                        <td className="p-4 font-mono text-xs text-gray-600">1554424049</td>
                        <td className="p-4 font-bold text-gray-800">Amit Sharma</td>
                        <td className="p-4 font-medium text-gray-600">102</td>
                        <td className="p-4">
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center w-fit"><span className="h-1.5 w-1.5 bg-green-500 rounded-full mr-1.5"></span>In Hostel</span>
                        </td>
                        <td className="p-4 font-bold text-red-500">₹ 2,450</td>
                        <td className="p-4 text-center">
                          <button className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-3 py-1 rounded">View</button>
                        </td>
                      </tr>
                      {/* Student 2 */}
                      <tr className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                        <td className="p-4 font-mono text-xs text-gray-600">1554424050</td>
                        <td className="p-4 font-bold text-gray-800">ANUSHKA</td>
                        <td className="p-4 font-medium text-gray-600">205</td>
                        <td className="p-4">
                          <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center w-fit"><span className="h-1.5 w-1.5 bg-yellow-500 rounded-full mr-1.5"></span>On Leave</span>
                        </td>
                        <td className="p-4 font-bold text-gray-400">Nil</td>
                        <td className="p-4 text-center">
                          <button className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-3 py-1 rounded">View</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ----------------------------------------------------------------- */}
          {/* 3. PARENTS / GUEST SECTION */}
          {/* ----------------------------------------------------------------- */}
          {currentRole === 'parent' && (
            <>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl shadow-lg text-white col-span-1 md:col-span-2 lg:col-span-3 flex justify-between items-center">
                <div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">Guest & Guardian Portal</span>
                  <h2 className="text-3xl font-black">Welcome, Parent</h2>
                  <p className="opacity-90 mt-1">Viewing details for: Amit Sharma (Room 102)</p>
                </div>
                <div className="hidden md:block text-6xl opacity-20">👪</div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-orange-500">
                <h3 className="font-bold text-gray-800 mb-2">Visitor Entry Pass</h3>
                <p className="text-xs text-gray-500 mb-3">Pre-approve your visit to avoid delays at the main gate.</p>
                <button onClick={() => toast.success("Entry pass request submitted.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }})} className="w-full bg-orange-50 border border-orange-200 text-orange-700 font-bold text-xs py-2.5 rounded hover:bg-orange-100 transition-colors">Request Entry Pass</button>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500">
                <h3 className="font-bold text-gray-800 mb-2">Pay Ward's Dues</h3>
                <p className="text-3xl font-black text-gray-800">₹ 2,450</p>
                <p className="text-xs text-gray-500 mt-1 mb-3">Due for Mess Bill (March)</p>
                <button onClick={() => simulatePayment("₹ 2,450", () => toast.success("Payment securely processed.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }}))} className="w-full bg-blue-600 text-white font-bold text-xs py-2.5 rounded hover:bg-blue-700 transition-colors">Secure Payment</button>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-green-500">
                <h3 className="font-bold text-gray-800 mb-2">Ward's Status</h3>
                <div className="flex items-center space-x-2 mt-4">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-bold text-gray-700">Currently in Hostel</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Last entry scan: Today, 05:30 PM</p>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default Dashboard;