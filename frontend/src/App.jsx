// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Apne teeno pages import kar rahe hain
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard'; // 🌟 YAHAN NAYA DASHBOARD IMPORT KIYA

function App() {
  return (
    <Router>
      <Routes>
        {/* Default rasta: Login Page */}
        <Route path="/" element={<Login />} />

        {/* Dusra rasta: Signup Page */}
        <Route path="/signup" element={<Signup />} />

        {/* 🌟 TEESRA NAYA RASTA: Dashboard Page */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;