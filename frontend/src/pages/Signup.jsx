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
  const [role, setRole] = useState("student"); // Default role
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  
  // Dynamic fields
  const [regNo, setRegNo] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [adminId, setAdminId] = useState("");
  const [masterKey, setMasterKey] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // ---------------------------------------------------------
  // API CALL: HANDLE SIGNUP
  // ---------------------------------------------------------
  const handleSignup = async (e) => {
    e.preventDefault();

    // Basic validation based on role
    if (!fullName || !password) {
      alert("Please fill in the common fields (Name & Password)! 🛑");
      return;
    }
    if (role === 'student' && (!regNo || !branch || !email)) {
      alert("Student details incomplete! 🛑");
      return;
    }
    if (role === 'parent' && (!phone || !regNo)) {
      alert("Parent details incomplete! 🛑");
      return;
    }
    if (role === 'faculty' && (!employeeId || !email || !secretCode)) {
      alert("Faculty details incomplete! 🛑");
      return;
    }
    if (role === 'warden' && (!adminId || !masterKey)) {
      alert("Warden details incomplete! 🛑");
      return;
    }

    setIsLoading(true);

    let payload = {
      role,
      full_name: fullName,
      password,
    };

    if (role === 'student') {
      payload.reg_no = regNo;
      payload.branch = branch;
      payload.email = email;
      // Compatibility with backend if it expects reg_no_email
      payload.reg_no_email = regNo; 
    } else if (role === 'parent') {
      payload.phone = phone;
      payload.ward_reg_no = regNo; // Reusing regNo for ward's reg no
    } else if (role === 'faculty') {
      payload.employee_id = employeeId;
      payload.email = email;
      payload.secret_code = secretCode;
    } else if (role === 'warden') {
      payload.admin_id = adminId;
      payload.master_key = masterKey;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/signup", payload);

      alert("Success: " + response.data.message + " 🎉");
      navigate("/");

    } catch (error) {
      if (error.response && error.response.data) {
        alert("Error: " + error.response.data.detail + " ❌");
      } else {
        alert("Server connection failed. Is backend running? 🤔");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-semibold ${
    isDarkMode ? 'bg-gray-800/80 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-black placeholder-gray-400'
  }`;

  const labelClass = `block text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`;

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
            <div className="text-center md:text-left mb-4">
              <h2 className="text-2xl md:text-3xl font-black mb-1 tracking-tight text-blue-600 dark:text-blue-400 drop-shadow-sm">Registration</h2>
              <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Create your hostel account
              </p>
            </div>

            {/* 🌟 DYNAMIC FORM */}
            <form className="space-y-3" onSubmit={handleSignup}>
              
              {/* REGISTER AS DROPDOWN */}
              <div>
                <label className={labelClass}>Register As</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    // Reset fields on role change
                    setFullName(""); setPassword(""); setRegNo(""); setEmail("");
                    setBranch(""); setPhone(""); setEmployeeId(""); setSecretCode("");
                    setAdminId(""); setMasterKey("");
                  }}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold cursor-pointer ${
                    isDarkMode ? 'bg-gray-800 border-gray-600 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  <option value="student">👨‍🎓 Student</option>
                  <option value="warden">🛡️ Warden / Admin</option>
                  <option value="parent">👪 Parent / Guest</option>
                  <option value="faculty">👨‍🏫 Faculty / Staff</option>
                </select>
              </div>

              {/* COMMON FIELD: FULL NAME */}
              <div>
                <label className={labelClass}>
                  {role === 'parent' ? "Parent/Guest Name" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'parent' ? "e.g. Ramesh Kumar" : "e.g. Amit Kumar"}
                  className={inputClass}
                />
              </div>

              {/* STUDENT FIELDS */}
              {role === 'student' && (
                <>
                  <div>
                    <label className={labelClass}>Registration Number</label>
                    <input
                      type="text"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      placeholder="e.g. 1554424049"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <div className="w-1/2">
                      <label className={labelClass}>Branch</label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder="e.g. AI & ML"
                        className={inputClass}
                      />
                    </div>
                    <div className="w-1/2">
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@gmail.com"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PARENT FIELDS */}
              {role === 'parent' && (
                <>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Student's Reg No. (Ward)</label>
                    <input
                      type="text"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      placeholder="e.g. 1554424049"
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {/* WARDEN FIELDS */}
              {role === 'warden' && (
                <>
                  <div>
                    <label className={labelClass}>Admin ID</label>
                    <input
                      type="text"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="e.g. WARDEN-001"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Master Authorization Key</label>
                    <input
                      type="password"
                      value={masterKey}
                      onChange={(e) => setMasterKey(e.target.value)}
                      placeholder="Secret Key"
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {/* FACULTY FIELDS */}
              {role === 'faculty' && (
                <>
                  <div className="flex space-x-3">
                    <div className="w-1/2">
                      <label className={labelClass}>Employee ID</label>
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="e.g. EMP-104"
                        className={inputClass}
                      />
                    </div>
                    <div className="w-1/2">
                      <label className={labelClass}>Official Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="staff@gpbarh.in"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Secret Access Code</label>
                    <input
                      type="password"
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                      placeholder="Provided by College"
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {/* COMMON FIELD: PASSWORD */}
              <div>
                <label className={labelClass}>Create Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-extrabold py-3 rounded-lg transition-all shadow-lg text-sm tracking-widest uppercase mt-4 ${
                  isLoading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/40'
                }`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="text-center mt-2">
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