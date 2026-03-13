// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Apne dono pages import kar rahe hain
import Login from './pages/Login';
import Signup from './pages/Signup'; // Ye naya page import kiya

function App() {
  return (
    <Router>
      <Routes>
        {/* Default rasta: Login Page */}
        <Route path="/" element={<Login />} />

        {/* Naya rasta: Signup Page */}
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;