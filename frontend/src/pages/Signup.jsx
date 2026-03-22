// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

// ASSETS IMPORT
import logo from '../assets/logo.png.png';
import myPic from '../assets/profile.jpg.jpg';

function Signup() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ---------------------------------------------------------
  // FORM STATES (Data store karne ke liye)
  // ---------------------------------------------------------
  const [fullName, setFullName] = useState("");
  const [regNoEmail, setRegNoEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // 🌟 NAYA: Role State (Default: student)
  const [isLoading, setIsLoading] = useState(false); // Button loading state

  const navigate = useNavigate(); // Signup ke baad Login par bhejne ke liye

  // ---------------------------------------------------------
  // API CALL: HANDLE SIGNUP
  // ---------------------------------------------------------
  const handleSignup = async (e) => {
    e.preventDefault(); // Page ko reload hone se rokne ke liye

    // Basic validation: Check agar koi field khali toh nahi chhod di
    if (!fullName || !regNoEmail || !password) {
      alert("Bhai, saari details bharna zaroori hai! 🛑");
      return;
    }

    setIsLoading(true);

    try {
      // Axios data lekar FastAPI ke paas ja raha hai (Port 8000)
      const response = await axios.post("http://127.0.0.1:8000/signup", {
        full_name: fullName,
        reg_no_email: regNoEmail,
        password: password,
        role: role // 🌟 NAYA: Ab user ka select kiya hua role backend jayega
      });

      // Agar backend ne 201 Created bhej diya
      alert("Success: " + response.data.message + " 🎉");

      // Success ke baad user ko automatically Login page par bhej do
      navigate("/");

    } catch (error) {
      // Agar backend ne error bheja (jaise duplicate user)
      if (error.response && error.response.data) {
        alert("Error: " + error.response.data.detail + " ❌");
      } else {
        alert("Server se connect nahi ho pa raha hai. Backend chalu hai? 🤔");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isDarkMode ? 'dark bg-[#0a0a0a]' : 'bg-gray-100'}`}>

      {/* ================= HEADER SECTION ================= */}
      <header className="w-full z-20 shadow-lg">
        <div className="bg-black text-gray-300 text-[10px] md:text-xs py-2 px-4 md:px-6 flex justify-between items-center">
          <div className="flex space-x-4 items-center font-medium tracking-wide">
            <a href="#" className="hover:text-white transition-colors py-1 hidden md:block">Rules</a>
            <span className="hidden md:inline text-gray-600">|</span>
            <a href="#" className="hover:text-white transition-colors py-1">Mess Menu</a>
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
        <div className="bg-[#720e0e] text-white py-2.5 px-4 md:px-6 flex items-center justify-between border-b-[3px] border-yellow-500/80 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1.5 h-12 w-12 rounded-full shadow-lg flex items-center justify-center overflow-hidden">
              <img src={logo} alt="GP Barh Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-extrabold font-serif tracking-wide leading-tight drop-shadow-sm">राजकीय पॉलिटेक्निक, बाढ़</h1>
            </div>
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
                Create your hostel account
              </p>
            </div>

            {/* 🌟 FORM WITH ROLE SELECTION */}
            <form className="space-y-3.5" onSubmit={handleSignup}>
              <div>
                <label className={`block text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Amit Kumar"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold ${
                    isDarkMode ? 'bg-gray-800/80 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Reg No. / Email
                </label>
                <input
                  type="text"
                  value={regNoEmail}
                  onChange={(e) => setRegNoEmail(e.target.value)}
                  placeholder="e.g. 1554424049"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold ${
                    isDarkMode ? 'bg-gray-800/80 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Create Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold ${
                    isDarkMode ? 'bg-gray-800/80 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400'
                  }`}
                />
              </div>

              {/* 🌟 NAYA: ROLE SELECTION DROPDOWN */}
              <div>
                <label className={`block text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Register As
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold cursor-pointer ${
                    isDarkMode ? 'bg-gray-800/80 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-black'
                  }`}
                >
                  <option value="student">👨‍🎓 Student</option>
                  <option value="warden">🛡️ Warden / Admin</option>
                  <option value="faculty">👨‍🏫 Faculty</option>
                  <option value="parent">👪 Parent / Guest</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-extrabold py-3.5 rounded-lg transition-all shadow-lg text-sm tracking-widest uppercase mt-2 ${
                  isLoading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/40'
                }`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
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
          </div>
        </div>
      </main>

    </div>
  );
}

export default Signup;