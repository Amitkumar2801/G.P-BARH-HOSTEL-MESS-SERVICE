import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Private Route Component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('hostel_token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontSize: '16px',
              padding: '16px 24px',
              borderRadius: '10px'
            },
            success: {
              style: {
                background: '#4CAF50',
              },
            },
            error: {
              style: {
                background: '#f44336',
              },
            },
          }}
        />
        
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          
          <Route path="/student/dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          
          <Route path="/admin/dashboard" element={<h1>Admin Dashboard (Coming Soon)</h1>} />
          <Route path="/warden/dashboard" element={<h1>Warden Dashboard (Coming Soon)</h1>} />
          
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;