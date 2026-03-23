// src/pages/ParentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png.png';

function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('book_stay');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const navigate = useNavigate();

  const currentFormattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Guest Stay Logic
  const [stayDays, setStayDays] = useState(1);
  const [mealCoupons, setMealCoupons] = useState(0);
  const roomChargePerDay = 200;
  const mealCharge = 50;

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
      {/* SIDEBAR (Dark Charcoal) */}
      <aside className={`fixed top-0 left-0 h-[100dvh] w-72 bg-[#111827] text-gray-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-[#1f2937] text-center flex flex-col items-center relative shrink-0">
          <div className="w-24 h-24 rounded-full p-1 border-2 border-orange-500 overflow-hidden mb-4 bg-gray-800">
             <div className="w-full h-full flex items-center justify-center text-4xl">👨‍👩‍👦</div>
          </div>
          <h2 className="text-xl font-black text-white">Guest / Parent</h2>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full mt-2 border border-white/20">Short Stay Access</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 text-sm font-bold">
          {[
            { id: 'book_stay', name: 'Book Stay & Meals', icon: '🛏️' },
            { id: 'history', name: 'Payment History', icon: '🧾' },
            { id: 'helpdesk', name: 'Helpdesk', icon: '💁' }
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
        {/* HEADER (Deep Maroon) */}
        <header className="bg-[#800000] text-white px-6 md:px-10 py-4 border-b border-[#5c0000] flex justify-between items-center shadow-md z-30">
          <div className="flex items-center gap-3.5">
            <div className="bg-white p-1 h-12 w-12 rounded-full shadow-lg flex items-center justify-center"><img src={logo} alt="GP Barh Logo" className="h-full w-full object-contain" /></div>
            <div>
              <h1 className="text-lg md:text-2xl font-black">Government Polytechnic, Barh</h1>
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Guest Accommodation Portal</p>
            </div>
          </div>
          <div className="hidden md:flex items-center text-teal-100 bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-sm font-bold">{currentFormattedDate}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-4xl mx-auto">

            {activeTab === 'book_stay' && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-3xl font-black text-[#800000]">Book Guest Room & Meals</h2>
                <p className="text-sm font-bold text-gray-500">Maximum stay allowed is 3 days. Includes access to guest dining.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <form className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Student Details (Who you are visiting)</label>
                        <input type="text" placeholder="Student Name & Reg No." className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0d5a57] text-sm font-bold bg-gray-50" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Check-in Date</label>
                          <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-gray-50" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Number of Days</label>
                          <select value={stayDays} onChange={(e) => setStayDays(parseInt(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-gray-50">
                            <option value="1">1 Day</option><option value="2">2 Days</option><option value="3">3 Days (Max)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Add Guest Meal Coupons (₹50 / Meal)</label>
                        <input type="number" min="0" value={mealCoupons} onChange={(e) => setMealCoupons(parseInt(e.target.value) || 0)} placeholder="e.g. 2" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-bold bg-gray-50" />
                      </div>
                    </form>
                  </div>

                  <div className="bg-[#0d5a57] text-white p-8 rounded-3xl shadow-lg border border-[#0a4745] flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-black mb-4 border-b border-teal-700 pb-2">Payment Summary</h3>
                      <div className="space-y-3 text-sm font-medium">
                        <div className="flex justify-between"><span>Room Charge ({stayDays} Days)</span><span>₹{stayDays * roomChargePerDay}</span></div>
                        <div className="flex justify-between"><span>Meal Coupons ({mealCoupons})</span><span>₹{mealCoupons * mealCharge}</span></div>
                      </div>
                    </div>
                    <div className="border-t border-teal-700 pt-4 mt-6">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-black uppercase tracking-widest">Total Pay</span>
                        <span className="text-3xl font-black font-mono">₹{(stayDays * roomChargePerDay) + (mealCoupons * mealCharge)}</span>
                      </div>
                      <button className="w-full bg-white text-[#0d5a57] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 shadow-lg">Pay & Confirm Booking</button>
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

export default ParentDashboard;