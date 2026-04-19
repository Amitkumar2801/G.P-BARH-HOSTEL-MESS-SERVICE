// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../App.css';

// 🌟 ASSETS IMPORT (Fixed as per your exact file paths)
import logo from '../assets/logo.png.png';
import myPic from '../assets/profile.jpg.jpg';

function Login() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);

  // FORM STATES
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // API CALL: HANDLE LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !password) {
      toast.error("Bhai, ID aur Password dono daalna zaroori hai! 🛑");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/login", {
        reg_no_email: userId,
        password: password
      });
      toast.success(`Success: ${response.data.message} 🎉\nWelcome ${response.data.user.full_name}`, {
        duration: 4000,
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });

      const role = response.data.user.role;
      if (role === 'student') {
        navigate("/student-dashboard", { state: { userRole: role, userName: response.data.user.full_name } });
      } else {
        navigate("/dashboard", { state: { userRole: role, userName: response.data.user.full_name } });
      }

    } catch (error) {
      if (error.response && error.response.data) {
        toast.error("Error: " + error.response.data.detail + " ❌");
      } else {
        toast.error("Server se connect nahi ho pa raha hai. Backend chalu hai? 🤔");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-[100dvh] w-full flex flex-col font-sans transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'dark bg-[#0a0a0a]' : 'bg-gray-100'}`}>

      {/* ================= HEADER SECTION ================= */}
      <header className="w-full z-20 shadow-lg shrink-0">
        <div className="bg-black text-gray-300 text-[10px] md:text-[11px] lg:text-xs py-1.5 md:py-2 px-4 md:px-6 flex justify-between items-center">
          <div className="flex space-x-4 items-center font-medium tracking-wide">
            <a href="#" className="hover:text-white transition-colors py-1 hidden md:block">Rules</a>
            <span className="hidden md:inline text-gray-600">|</span>
            <a href="#" className="hover:text-white transition-colors py-1">Mess Menu</a>
            <span className="text-gray-600">|</span>
            <a href="#" className="hover:text-white transition-colors py-1">Contact Warden</a>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-yellow-400 drop-shadow-md">Theme</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full border border-gray-600 hover:border-yellow-400 hover:scale-110 transition-transform duration-300 shadow-md bg-white h-7 w-7 flex items-center justify-center p-1 overflow-hidden"
            >
              <img src={logo} alt="Theme Toggle" className="h-full w-full object-contain" />
            </button>
          </div>
        </div>

        <div className="bg-[#720e0e] text-white py-2 px-4 md:px-6 flex items-center justify-between border-b-[3px] border-yellow-500/80 shadow-md">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-white p-1 h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full shadow-lg flex items-center justify-center overflow-hidden">
              <img src={logo} alt="GP Barh Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold font-serif tracking-wide leading-tight drop-shadow-sm">राजकीय पॉलिटेक्निक, बाढ़</h1>
              <h2 className="text-[9px] md:text-[11px] font-semibold tracking-widest uppercase opacity-95 mt-0.5">Government Polytechnic, Barh</h2>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-grow bg-campus flex items-center justify-center p-3 md:p-6 lg:p-8 relative">
        <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-black/75' : 'bg-black/40'}`}></div>

        <div className={`relative z-10 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col md:flex-row w-[95%] md:w-full max-w-[760px] overflow-hidden border transition-all duration-300 ${
          isDarkMode ? 'bg-[#121212]/90 border-gray-700 text-white' : 'bg-white/95 border-white/60 text-gray-900'
        }`}>

          <div className="w-full md:w-[55%] p-5 md:p-6 lg:p-8 flex flex-col justify-center">
            <div className="text-center md:text-left mb-4 md:mb-5 lg:mb-6">
              <h2 className="text-2xl md:text-3xl font-black mb-1 tracking-tight text-blue-600 dark:text-blue-400 drop-shadow-sm">Student Login</h2>
              <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Access Hostel & Mess Dashboard
              </p>
            </div>

            {/* 🌟 FORM START */}
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className={`block text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Reg No. / Email
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. 1554424049"
                  className={`w-full px-4 py-2.5 md:py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold ${
                    isDarkMode ? 'bg-gray-800/80 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400 shadow-inner'
                  }`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`block text-[10px] md:text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    Password
                  </label>
                  <a href="#" className="text-[10px] font-bold text-blue-600 hover:text-blue-500 hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 md:py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold ${
                    isDarkMode ? 'bg-gray-800/80 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400 shadow-inner'
                  }`}
                />
              </div>

              <div className="space-y-2 mt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full font-extrabold py-2.5 md:py-3 lg:py-3.5 rounded-lg transition-all shadow-lg text-sm tracking-widest uppercase mt-1 ${
                    isLoading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/40'
                  }`}
                >
                  {isLoading ? 'Checking...' : 'Login'}
                </button>
              </div>

              {/* 🌟 DEMO ACCESS FOR RECRUITERS/TESTERS 🌟 */}
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className={`text-[10px] font-bold uppercase tracking-widest text-center mb-2 md:mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Demo Access (One-Click Login)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/student-dashboard", { state: { userRole: 'student', userName: 'Dummy Student' } })}
                    className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 py-2 rounded hover:bg-blue-100 transition-colors shadow-sm"
                  >
                    👨‍🎓 Student
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard", { state: { userRole: 'warden', userName: 'Chief Warden' } })}
                    className="text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 py-2 rounded hover:bg-red-100 transition-colors shadow-sm"
                  >
                    🛡️ Warden
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard", { state: { userRole: 'parent', userName: 'Dummy Parent' } })}
                    className="text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 py-2 rounded hover:bg-orange-100 transition-colors shadow-sm"
                  >
                    👪 Parent
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard", { state: { userRole: 'faculty_temp', userName: 'Dummy Faculty' } })}
                    className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 py-2 rounded hover:bg-green-100 transition-colors shadow-sm"
                  >
                    👨‍🏫 Faculty
                  </button>
                </div>
              </div>

              <div className="text-center mt-3 mb-2">
                <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Don't have an account? <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">Sign Up</Link>
                </p>
              </div>
            </form>
            {/* 🌟 FORM END */}
          </div>

          <div className={`hidden md:flex flex-col items-center justify-center px-0 border-l border-r ${
            isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-100/50 border-gray-200'
          }`}>
            <div className={`h-full w-[1px] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            <span className={`py-3 px-2 text-[10px] font-bold uppercase rounded-full my-2 ${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400 shadow-sm'}`}>OR</span>
            <div className={`h-full w-[1px] ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>

          <div className={`hidden md:flex w-[45%] p-6 lg:p-8 flex-col items-center justify-center ${isDarkMode ? 'bg-[#1a1a1a]/95' : 'bg-gray-50/95'}`}>
            <h3 className={`text-sm font-black mb-4 lg:mb-6 uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Fast Mobile Login
            </h3>

            <div className={`w-32 h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center mb-4 lg:mb-5 relative overflow-hidden shadow-inner ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
              <div className="absolute w-full h-1 bg-blue-500 shadow-[0_0_20px_4px_rgba(59,130,246,0.8)] animate-scan"></div>
              <span className="text-5xl mb-2 opacity-90 drop-shadow-md">📱</span>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Scan in App</p>
            </div>

            <p className={`text-center text-xs font-semibold leading-relaxed px-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Open the GP Barh App on your phone and scan this code to login instantly.
            </p>
          </div>
        </div>
      </main>

      {/* ================= FOOTER SECTION RESTORED ================= */}
      <footer className="bg-[#4a0404] text-gray-300 z-20 border-t-4 border-yellow-500/80 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">

            <div className="col-span-1 sm:col-span-2 md:col-span-1">
              <h4 className="text-yellow-400 font-bold mb-3 uppercase tracking-widest text-[11px] border-b border-white/10 pb-1.5 inline-block">Contact Us</h4>
              <p className="leading-relaxed mb-2 text-gray-200">
                <span className="font-bold text-white block">Govt. Polytechnic Barh</span>
                NH-31, Patna, Bihar 803213
              </p>
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

            {/* 🌟 AMIT KUMAR - DEVELOPER PROFILE CARD 🌟 */}
            <div className="col-span-1 sm:col-span-2 md:col-span-1 relative overflow-hidden bg-gradient-to-br from-black/80 to-[#720e0e]/50 p-4 rounded-xl border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.15)] group">
                <h4 className="text-gray-400 font-bold mb-1.5 uppercase tracking-widest text-[10px]">Developer Profile</h4>
                <p className="text-yellow-400 font-black text-lg md:text-xl tracking-wider group-hover:text-white transition-colors mb-2 md:mb-3">AMIT KUMAR</p>

                <p className="text-[11px] font-bold text-gray-200 mt-2 mb-1.5 uppercase tracking-wide border-b border-white/10 pb-0.5 inline-block">Connect With Me</p>

                <div className="flex flex-nowrap justify-center gap-1.5 text-[10px] font-bold w-full">
                    <button
                        onClick={() => setShowIdCard(true)}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black px-2.5 py-1.5 rounded transition-colors shadow-sm flex items-center gap-1.5"
                    >
                        🪪 <span>View ID</span>
                    </button>
                    <a
                        href="https://amitkumar2801.github.io/its.Portfolio/"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-blue-600/90 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                        🌐 <span>Portfolio</span>
                    </a>
                    <a
                        href="https://www.instagram.com/its._chamgadar?igsh=MW9tbzdseWFtOW5o"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white px-2.5 py-1.5 rounded transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.919-.058-1.265-.069-1.646-.069-4.849 0-3.204.012-3.583.069-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        <span>Instagram</span>
                    </a>
                </div>
            </div>

          </div>
        </div>

        <div className="bg-[#2a0202] py-3 text-center text-[10px] text-gray-400 font-semibold tracking-wide border-t border-black/20">
          © 2026 GP Barh Hostel System. All Rights Reserved.
        </div>
      </footer>

      {/* ================= ID CARD MODAL ================= */}
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

export default Login;