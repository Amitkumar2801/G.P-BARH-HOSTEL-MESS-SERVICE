// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard';
// 🌟 NAYE IMPORTS
import ParentDashboard from './pages/ParentDashboard';

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ className: 'font-bold text-sm' }} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/warden-dashboard" element={<WardenDashboard />} />
        {/* 🌟 NAYE RASTE */}
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;