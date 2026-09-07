// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard';
import MessScanner from './pages/MessScanner';

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ className: 'font-bold text-sm' }} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 🍽️ DIGITAL MESS SCANNER & MEAL TOKEN */}
        <Route path="/mess-scanner" element={<MessScanner />} />
        <Route path="/mess_scanner" element={<MessScanner />} />
        <Route path="/scanner" element={<MessScanner />} />
        <Route path="/meal-pass" element={<MessScanner />} />
        
        {/* 🎓 STUDENT DASHBOARD & ALIASES */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student dashboard" element={<StudentDashboard />} />
        <Route path="/student%20dashboard" element={<StudentDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/studentdashboard" element={<StudentDashboard />} />
        <Route path="/student_dashboard" element={<StudentDashboard />} />

        {/* 🛡️ WARDEN DASHBOARD & ALIASES */}
        <Route path="/warden-dashboard" element={<WardenDashboard />} />
        <Route path="/warden/dashboard" element={<WardenDashboard />} />
        <Route path="/warden dashboard" element={<WardenDashboard />} />
        <Route path="/warden%20dashboard" element={<WardenDashboard />} />
        <Route path="/warden" element={<WardenDashboard />} />
        <Route path="/wardendashboard" element={<WardenDashboard />} />
        <Route path="/warden_dashboard" element={<WardenDashboard />} />

        {/* 🌐 SMART WILDCARD FALLBACK */}
        <Route path="*" element={<WardenFallbackRoute />} />
      </Routes>
    </Router>
  );
}

function WardenFallbackRoute() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('scanner') || path.includes('meal')) return <MessScanner />;
  if (path.includes('warden')) return <WardenDashboard />;
  if (path.includes('student')) return <StudentDashboard />;
  return <Login />;
}

export default App;