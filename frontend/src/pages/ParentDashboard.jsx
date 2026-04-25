// src/pages/ParentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png.png';
import toast, { Toaster } from 'react-hot-toast';

// Inline SVG Icons for zero-dependency
const Icons = {
  Bed: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, 
  Wallet: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Help: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Menu: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  X: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Phone: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Mail: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Send: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  CheckCircle: () => <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('book_stay');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();

  const currentFormattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Guest Stay State
  const [stayDays, setStayDays] = useState(1);
  const [mealCoupons, setMealCoupons] = useState(0);
  const roomChargePerDay = 250; // Set to 250 as an example for Guest Accommodation
  const mealCharge = 50;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          toast.success(`Transaction of ${amount} Completed Successfully`, { style: { borderRadius: '10px', background: '#333', color: '#fff' }});
          if (callback) callback();
        }, 2000);
      }, 2000);
    }, 1500);
  };

  const handleLogout = () => { navigate("/"); };
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const tabs = [
    { id: 'book_stay', name: 'Book Stay & Meals', icon: <Icons.Bed /> },
    { id: 'pay_dues', name: "Pay Ward's Dues", icon: <Icons.Wallet /> },
    { id: 'helpdesk', name: 'Helpdesk', icon: <Icons.Help /> }
  ];

  return (
    <div className="h-screen bg-[#f3f4f6] flex font-sans overflow-hidden text-gray-900">
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
                  <h3 style={{fontSize: '22px', fontWeight: 800, marginBottom: '12px', color: '#0f172a'}}>Processing Payment of {paymentAmount}</h3>
                  <p style={{color: '#dc2626', fontSize: '14px', fontWeight: 700}}>Please do not refresh or close this window.</p>
                </div>
              )}
              {paymentStep === 3 && (
                <div className="animate-fade-in">
                  <div style={{width: '72px', height: '72px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)'}}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <h3 style={{fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: '#0f172a'}}>Payment Authorized!</h3>
                  <p style={{color: '#64748b', fontSize: '15px', fontWeight: 600}}>Redirecting back to your dashboard...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          <div className="w-24 h-24 rounded-full p-1 border-2 border-[#800000] overflow-hidden mb-4 bg-gray-800 shadow-lg group">
             <div className="w-full h-full flex items-center justify-center text-4xl bg-[#1f2937] rounded-full">
                <span role="img" aria-label="parent">👨‍👩‍👦</span>
             </div>
          </div>
          <h2 className="text-xl font-black text-white">Guest / Parent</h2>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full mt-2 border border-white/20">Short Stay Access</p>
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
        
        {/* HEADER */}
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
              <p className="text-[9px] md:text-[10px] text-gray-200 font-bold uppercase tracking-widest mt-0.5">Guest Accommodation Portal</p>
            </div>
          </div>
          <div className="hidden md:flex items-center text-yellow-100 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-sm font-bold shadow-inner">
            {currentFormattedDate}
          </div>
        </header>

        {/* DYNAMIC TAB CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f3f4f6]">
          <div className="max-w-5xl mx-auto pb-10">
            
            {/* TAB: BOOK STAY & MEALS */}
            {activeTab === 'book_stay' && (
              <div className="animate-fade-in space-y-6">
                <div>
                   <h2 className="text-2xl md:text-3xl font-black text-[#111827]">Book Stay & Meals</h2>
                   <p className="text-sm font-medium text-gray-500 mt-1">Reserve a guest room on campus for short visits (Max 3 days).</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* BOOKING FORM */}
                  <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200">
                    <form className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Student Details (Who you are visiting)</label>
                        <input type="text" placeholder="e.g. Amit Sharma - Reg No. 1554424049" className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#800000] text-sm font-bold bg-gray-50 outline-none transition-all placeholder:text-gray-400" />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Check-in Date</label>
                          <input type="date" className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#800000] text-sm font-bold bg-gray-50 outline-none transition-all cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Number of Days</label>
                          <select 
                            value={stayDays} 
                            onChange={(e) => setStayDays(parseInt(e.target.value))} 
                            className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#800000] text-sm font-bold bg-gray-50 outline-none transition-all cursor-pointer appearance-none"
                          >
                            <option value="1">1 Day</option>
                            <option value="2">2 Days</option>
                            <option value="3">3 Days (Max)</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                        <label className="block text-[10px] font-black text-orange-800 uppercase tracking-widest mb-2 ml-1">Add Guest Meal Coupons (₹50 / Meal)</label>
                        <p className="text-xs text-orange-600 font-medium mb-3 ml-1">Coupons can be used for Breakfast, Lunch, or Dinner at the campus mess.</p>
                        <input 
                          type="number" 
                          min="0" 
                          max="20"
                          value={mealCoupons} 
                          onChange={(e) => setMealCoupons(parseInt(e.target.value) || 0)} 
                          placeholder="0" 
                          className="w-full px-5 py-4 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 text-sm font-bold bg-white outline-none transition-all" 
                        />
                      </div>
                    </form>
                  </div>

                  {/* STICKY PAYMENT SUMMARY */}
                  <div className="lg:col-span-1 lg:sticky lg:top-4 bg-[#111827] text-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-800 flex flex-col justify-between min-h-[350px]">
                    <div>
                      <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                         <Icons.Wallet /> Payment Summary
                      </h3>
                      <div className="space-y-4 text-sm font-medium">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                           <span className="text-gray-300">Room Charge ({stayDays} Days)</span>
                           <span className="font-bold">₹{stayDays * roomChargePerDay}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                           <span className="text-gray-300">Meal Coupons ({mealCoupons})</span>
                           <span className="font-bold">₹{mealCoupons * mealCharge}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-700">
                      <div className="flex justify-between items-end mb-6">
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Payable</span>
                        <span className="text-4xl font-black text-[#eab308]">₹{(stayDays * roomChargePerDay) + (mealCoupons * mealCharge)}</span>
                      </div>
                      <button onClick={() => simulatePayment(`₹${(stayDays * roomChargePerDay) + (mealCoupons * mealCharge)}`, () => toast.success("Booking Request Confirmed!"))} className="w-full bg-[#800000] hover:bg-[#6a0000] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg transition-colors">
                         Pay & Confirm Booking
                      </button>
                      <p className="text-center text-[10px] text-gray-500 mt-4 font-bold uppercase tracking-wider">Secure Payment Gateway</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PAY WARD'S DUES */}
            {activeTab === 'pay_dues' && (
              <div className="animate-fade-in space-y-6">
                <div>
                   <h2 className="text-2xl md:text-3xl font-black text-[#111827]">Pay Ward's Dues</h2>
                   <p className="text-sm font-medium text-gray-500 mt-1">Clear pending hostel or mess fees for your linked student.</p>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-200 text-center max-w-2xl mx-auto mt-10 relative overflow-hidden">
                   <div className="absolute top-0 left-0 right-0 h-2 bg-[#800000]"></div>
                   
                   <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icons.Wallet className="w-10 h-10" />
                   </div>
                   
                   <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-2">Total Pending Fees</h3>
                   <p className="text-6xl font-black text-gray-900 mb-2">₹4,250</p>
                   <p className="text-sm font-bold text-[#800000] mb-8 bg-red-50 inline-block px-4 py-1.5 rounded-full border border-red-100">
                      For Student: Amit Sharma (Reg: 1554424049)
                   </p>
                   
                   <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8 border border-gray-100">
                      <h4 className="font-bold text-sm text-gray-900 mb-4 border-b border-gray-200 pb-2">Fee Breakdown</h4>
                      <div className="space-y-3 text-sm">
                         <div className="flex justify-between text-gray-600"><span className="font-medium">Monthly Mess Bill (Oct)</span><span className="font-bold text-gray-900">₹2,250</span></div>
                         <div className="flex justify-between text-gray-600"><span className="font-medium">Hostel Rent (Oct)</span><span className="font-bold text-gray-900">₹2,000</span></div>
                      </div>
                   </div>

                   <button onClick={() => simulatePayment("₹4,250", () => toast.success("Dues Cleared successfully!"))} className="w-full sm:w-auto px-12 py-4 bg-[#111827] hover:bg-black text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-transform hover:-translate-y-1">
                      Pay Now
                   </button>
                </div>
              </div>
            )}

            {/* TAB: HELPDESK */}
            {activeTab === 'helpdesk' && (
              <div className="animate-fade-in space-y-6">
                <div>
                   <h2 className="text-2xl md:text-3xl font-black text-[#111827]">Administration Helpdesk</h2>
                   <p className="text-sm font-medium text-gray-500 mt-1">Get in touch with the hostel warden for any queries.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start mt-6">
                   
                   {/* CONTACT INFO CARD */}
                   <div className="md:col-span-2 bg-[#800000] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
                      <div className="absolute -right-10 -bottom-10 opacity-10">
                         <Icons.Help className="w-64 h-64" />
                      </div>
                      
                      <h3 className="text-2xl font-black mb-6 relative z-10">Contact Warden</h3>
                      
                      <div className="space-y-6 relative z-10">
                         <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-xl"><Icons.Phone /></div>
                            <div>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 mb-1">Phone Number</p>
                               <p className="font-bold text-lg">+91 98765 43210</p>
                               <p className="text-xs text-gray-300 mt-1">Available 9:00 AM - 6:00 PM</p>
                            </div>
                         </div>
                         
                         <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-3 rounded-xl"><Icons.Mail /></div>
                            <div>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 mb-1">Email Address</p>
                               <p className="font-bold text-base">warden.gpb@gpbarh.ac.in</p>
                               <p className="text-xs text-gray-300 mt-1">Replies within 24 hours</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* MESSAGE FORM */}
                   <div className="md:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                      <h3 className="text-xl font-black text-[#111827] mb-6">Drop a Message</h3>
                      
                      <form className="space-y-5">
                         <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                            <input type="text" placeholder="Enter your full name" className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#800000] text-sm font-bold bg-gray-50 outline-none transition-all" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Linked Student Reg No.</label>
                            <input type="text" placeholder="e.g. 1554424049" className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#800000] text-sm font-bold bg-gray-50 outline-none transition-all" />
                         </div>
                         <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Message</label>
                            <textarea rows="4" placeholder="How can we help you?" className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#800000] text-sm font-medium bg-gray-50 outline-none transition-all resize-none"></textarea>
                         </div>
                         <button type="button" onClick={() => toast.success("Message officially sent to Administration. Please expect a reply within 24 hours.", { style: { borderRadius: '10px', background: '#333', color: '#fff' }})} className="bg-[#111827] hover:bg-black text-white font-black text-xs uppercase tracking-wider py-4 px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 mt-2 w-full sm:w-auto">
                            <Icons.Send /> Send Message
                         </button>
                      </form>
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

export default ParentDashboard;