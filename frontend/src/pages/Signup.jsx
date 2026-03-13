import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Link import zaroori hai
import '../App.css';

// ASSETS IMPORT
import logo from '../assets/logo.png.png';
import myPic from '../assets/profile.jpg.jpg';

function Signup() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isDarkMode ? 'dark bg-[#0a0a0a]' : 'bg-gray-100'}`}>

      {/* ================= HEADER SECTION (Same as Login) ================= */}
      <header className="w-full z-20 shadow-lg">
        <div className="bg-black text-gray-300 text-[10px] md:text-xs py-2 px-4 md:px-6 flex justify-between items-center">
          <div className="flex space-x-4 items-center font-medium tracking-wide">
            <a href="#" className="hover:text-white transition-colors py-1 hidden md:block">Rules</a>
            <span className="hidden md:inline text-gray-600">|</span>
            <a href="#" className="hover:text-white transition-colors py-1">Mess Menu</a>
            <span className="text-gray-600">|</span>
            <a href="#" className="hover:text-white transition-colors py-1">Contact Warden</a>
            <span className="text-gray-600">|</span>
            <a href="#" className="hover:text-white transition-colors py-1">Complaint Box</a>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-yellow-400 drop-shadow-md">Theme</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full border border-gray-600 hover:border-yellow-400 hover:scale-110 transition-transform duration-300 shadow-md bg-white h-7 w-7 flex items-center justify-center p-1 overflow-hidden"
              title="Toggle Theme"
            >
              <img src={logo} alt="Theme Toggle" className="h-full w-full object-contain" />
            </button>
          </div>
        </div>

        <div className="bg-[#720e0e] text-white py-2.5 px-4 md:px-6 flex items-center justify-between border-b-[3px] border-yellow-500/80 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1.5 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg flex items-center justify-center overflow-hidden">
              <img src={logo} alt="GP Barh Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold font-serif tracking-wide leading-tight drop-shadow-sm">राजकीय पॉलिटेक्निक, बाढ़</h1>
              <h2 className="text-[9px] md:text-[11px] font-semibold tracking-widest uppercase opacity-95 mt-0.5">Government Polytechnic, Barh</h2>
            </div>
          </div>
          <div className="hidden md:block text-right text-[11px] md:text-xs font-medium text-gray-100 border-l border-white/30 pl-4">
            Science, Technology & Technical Education Dept.<br/>
            <span className="text-yellow-400 font-bold tracking-wide drop-shadow-md">Government of Bihar</span>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT AREA (SIGNUP FORM) ================= */}
      <main className="flex-grow bg-campus flex items-center justify-center p-4 md:p-8 relative">
        <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-black/75' : 'bg-black/40'}`}></div>

        <div className={`relative z-10 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col md:flex-row w-[95%] md:w-full max-w-[760px] overflow-hidden border transition-all duration-300 ${
          isDarkMode ? 'bg-[#121212]/90 border-gray-700 text-white' : 'bg-white/95 border-white/60 text-gray-900'
        }`}>

          <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col justify-center">
            <div className="text-center md:text-left mb-5">
              <h2 className="text-2xl md:text-3xl font-black mb-1 tracking-tight text-blue-600 dark:text-blue-400 drop-shadow-sm">Registration</h2>
              <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Create your student account
              </p>
            </div>

            <form className="space-y-3.5">
              {/* Full Name Field */}
              <div>
                <label className={`block text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amit Kumar"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold ${
                    isDarkMode ? 'bg-gray-800/80 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400 shadow-inner'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Reg No. / Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1554424049"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold ${
                    isDarkMode ? 'bg-gray-800/80 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400 shadow-inner'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Create Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold ${
                    isDarkMode ? 'bg-gray-800/80 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400 shadow-inner'
                  }`}
                />
              </div>

              <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-lg transition-all shadow-lg hover:shadow-blue-500/40 text-sm tracking-widest uppercase mt-1">
                Create Account
              </button>

              <div className="text-center mt-3">
                <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Already have an account? <Link to="/" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">Sign In</Link>
                </p>
              </div>
            </form>
          </div>

          <div className={`hidden md:flex flex-col items-center justify-center px-0 border-l border-r ${
            isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-100/50 border-gray-200'
          }`}>
            <div className={`h-full w-[1px] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>

          <div className={`hidden md:flex w-[45%] p-8 flex-col items-center justify-center ${isDarkMode ? 'bg-[#1a1a1a]/95' : 'bg-gray-50/95'}`}>
            <h3 className={`text-sm font-black mb-6 uppercase tracking-widest text-center leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Digital<br/>Onboarding
            </h3>

            <div className={`w-40 h-40 border-2 border-dashed rounded-full flex flex-col items-center justify-center mb-6 relative overflow-hidden shadow-inner ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
              <div className="absolute w-full h-1 bg-green-500 shadow-[0_0_20px_4px_rgba(34,197,94,0.8)] animate-scan"></div>
              <span className="text-5xl mb-2 opacity-90 drop-shadow-md">🎓</span>
            </div>

            <p className={`text-center text-xs font-semibold leading-relaxed px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Join the GP Barh Hostel System. Register today to access mess menus, rules, and notices digitally.
            </p>
          </div>
        </div>
      </main>

      {/* ================= FOOTER SECTION (Same as Login) ================= */}
      <footer className="bg-[#4a0404] text-gray-300 z-20 border-t-4 border-yellow-500/80 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">

            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <h4 className="text-yellow-400 font-bold mb-3 uppercase tracking-widest text-[11px] border-b border-white/10 pb-1.5 inline-block">Contact Us</h4>
              <p className="leading-relaxed mb-2 text-gray-200">
                <span className="font-bold text-white block">Govt. Polytechnic Barh</span>
                NH-31, Patna, Bihar 803213
              </p>
              <p><a href="#" className="hover:text-white transition-colors py-0.5 block">📞 +91-0612-XXXXXXX</a></p>
              <p><a href="mailto:info@gpbarh.in" className="hover:text-white transition-colors py-0.5 block">✉️ info@gpbarh.in</a></p>
            </div>

            <div>
              <h4 className="text-yellow-400 font-bold mb-3 uppercase tracking-widest text-[11px] border-b border-white/10 pb-1.5 inline-block">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="https://www.gpbarh.in/" target="_blank" rel="noreferrer" className="hover:text-white font-medium transition-colors block">Official Website</a></li>
                <li><a href="#" className="hover:text-white font-medium transition-colors block">Hostel Notice Board</a></li>
                <li><a href="#" className="hover:text-white font-medium transition-colors block">Student Grievance</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-yellow-400 font-bold mb-3 uppercase tracking-widest text-[11px] border-b border-white/10 pb-1.5 inline-block">Total Visitors</h4>
              <div className="flex space-x-1.5 mt-1">
                {['0','1','5','4','4','2'].map((num, i) => (
                  <div key={i} className="bg-black/40 border border-white/20 text-white font-mono px-2 py-1 rounded shadow-inner text-sm font-bold">
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* 🌟 AMIT KUMAR - DEVELOPER PROFILE CARD */}
            <div className="col-span-1 sm:col-span-2 md:col-span-1 relative overflow-hidden bg-gradient-to-br from-black/80 to-[#720e0e]/50 p-4 rounded-xl border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.15)] group">
              <h4 className="text-gray-400 font-bold mb-1.5 uppercase tracking-widest text-[10px]">DEVELOPED BY</h4>
              <p className="text-yellow-400 font-black text-xl tracking-wider group-hover:text-white transition-colors mb-4">AMIT KUMAR</p>

              <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                <button
                  onClick={() => setShowIdCard(true)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-2.5 py-1.5 rounded transition-colors shadow-sm flex items-center"
                >
                  🪪 View ID
                </button>
                <a href="#" target="_blank" rel="noreferrer" className="bg-blue-600/80 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded transition-colors flex items-center">LinkedIn</a>
                <a href="#" target="_blank" rel="noreferrer" className="bg-gray-700/80 hover:bg-gray-600 text-white px-2.5 py-1.5 rounded transition-colors flex items-center">GitHub</a>
                <a href="#" target="_blank" rel="noreferrer" className="bg-pink-600/80 hover:bg-pink-500 text-white px-2.5 py-1.5 rounded transition-colors flex items-center">Portfolio</a>
              </div>
            </div>

          </div>
        </div>

        <div className="bg-[#2a0202] py-3 text-center text-[10px] text-gray-400 font-semibold tracking-wide border-t border-black/20">
          © 2026 GP Barh Hostel System. All Rights Reserved.
        </div>
      </footer>

      {/* ================= CODE-GENERATED ID CARD MODAL ================= */}
      {showIdCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4" onClick={() => setShowIdCard(false)}>

          <div
            className="bg-white w-full max-w-[320px] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] relative animate-scale-in border border-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIdCard(false)}
              className="absolute top-2 right-2 bg-black/20 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors z-10"
            >
              X
            </button>

            <div className="bg-[#800000] p-3 flex flex-col items-center justify-center relative">
              <div className="flex items-center space-x-2 mb-1">
                {/* LOGO IN WHITE CIRCLE (ID Card) */}
                <div className="bg-white rounded-full p-1 shadow-sm h-10 w-10 flex items-center justify-center overflow-hidden">
                  <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                </div>
                <div className="text-center text-white">
                  <h2 className="text-[12px] font-black leading-tight uppercase font-serif tracking-wide">Govt. Polytechnic, Barh</h2>
                </div>
              </div>
              <p className="text-[7px] text-gray-200 uppercase tracking-widest text-center mt-1">Science Technology & Technical Education Dept.</p>
            </div>

            <div className="bg-red-600 text-white text-[9px] font-bold text-center py-1 uppercase tracking-[0.3em] shadow-sm">
              Identity Card
            </div>

            <div className="p-5 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50">

              {/* 👉 TUMHARI PHOTO */}
              <div className="w-20 h-24 bg-white border-2 border-[#800000] mb-3 flex items-center justify-center rounded shadow-md overflow-hidden p-0.5">
                <img src={myPic} alt="Amit Kumar" className="w-full h-full object-cover rounded-sm" />
              </div>

              <h3 className="text-xl font-black text-[#800000] uppercase tracking-wide mb-3">Amit Kumar</h3>

              <div className="w-full text-left space-y-2 text-[11px]">
                <div className="flex border-b border-gray-200 pb-1">
                  <span className="w-20 font-bold text-gray-600 uppercase text-[9px]">Branch</span>
                  <span className="font-bold text-gray-900 leading-tight">: Artificial Intelligence <br/>& Machine Learning</span>
                </div>
                <div className="flex border-b border-gray-200 pb-1">
                  <span className="w-20 font-bold text-gray-600 uppercase text-[9px]">Roll No.</span>
                  <span className="font-bold text-gray-900">: 49/AI&ML/2024</span>
                </div>
                <div className="flex border-b border-gray-200 pb-1">
                  <span className="w-20 font-bold text-gray-600 uppercase text-[9px]">Reg. No.</span>
                  <span className="font-bold text-gray-900">: 1554424049</span>
                </div>
                <div className="flex pb-1">
                  <span className="w-20 font-bold text-gray-600 uppercase text-[9px]">Session</span>
                  <span className="font-bold text-gray-900">: 2024-27</span>
                </div>
              </div>

            </div>

            <div className="bg-yellow-500 h-2 w-full"></div>
            <div className="bg-[#800000] h-1 w-full"></div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Signup;