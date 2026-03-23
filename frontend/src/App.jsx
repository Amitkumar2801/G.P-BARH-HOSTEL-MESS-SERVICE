// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import WardenDashboard from './pages/WardenDashboard'; // 🌟 NAYA IMPORT

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        {/* 🌟 NAYA RASTA WARDEN KE LIYE */}
        <Route path="/warden-dashboard" element={<WardenDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;