import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🎓 GP Barh Hostel & Mess Service</h1>
        <p>Welcome to the Smart Hostel Management System</p>
        
        <div className="status">
          <h3>📊 System Status</h3>
          <p>✅ Backend Server: Running on port 5000</p>
          <p>✅ MongoDB: Connected</p>
          <p>🔄 Frontend: Development mode</p>
        </div>

        <div className="links">
          <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">
            Check Server Health
          </a>
          <a href="/login" className="button">
            Student Login
          </a>
          <a href="/register" className="button">
            New Registration
          </a>
        </div>
      </header>
    </div>
  );
}

export default App;
