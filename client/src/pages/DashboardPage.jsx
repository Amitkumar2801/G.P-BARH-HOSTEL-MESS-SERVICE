import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './DashboardPage.css';

const DashboardPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('hostel_token');
        const userData = localStorage.getItem('hostel_user');
        
        if (!token || !userData) {
            toast.error('Please login first');
            navigate('/login');
            return;
        }
        
        setUser(JSON.parse(userData));
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('hostel_token');
        localStorage.removeItem('hostel_user');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>🎓 GP Barh Hostel Dashboard</h1>
                    <p>Welcome back, {user?.fullName}</p>
                </div>
                <div className="header-right">
                    <div className="user-info">
                        <span className="user-avatar">{user?.fullName?.charAt(0)}</span>
                        <div className="user-details">
                            <strong>{user?.fullName}</strong>
                            <small>{user?.registrationNumber} | {user?.course}</small>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="dashboard-content">
                {/* Quick Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3>Wallet Balance</h3>
                            <p className="stat-value">₹2,500</p>
                            <small>Available for payments</small>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">🛏️</div>
                        <div className="stat-info">
                            <h3>Room Status</h3>
                            <p className="stat-value">{user?.roomAllocated ? 'Allocated' : 'Not Allocated'}</p>
                            <small>Room {user?.roomNumber || 'N/A'}</small>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <h3>Next Payment</h3>
                            <p className="stat-value">5 Days</p>
                            <small>Due: 25th Feb 2025</small>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-info">
                            <h3>Pending Tasks</h3>
                            <p className="stat-value">3</p>
                            <small>Complaints & Requests</small>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="actions-section">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <button className="action-btn" onClick={() => navigate('/room-booking')}>
                            <span className="action-icon">🏨</span>
                            <span>Book Room</span>
                        </button>
                        
                        <button className="action-btn" onClick={() => navigate('/wallet')}>
                            <span className="action-icon">💳</span>
                            <span>Add Money to Wallet</span>
                        </button>
                        
                        <button className="action-btn" onClick={() => navigate('/complaints')}>
                            <span className="action-icon">📢</span>
                            <span>Submit Complaint</span>
                        </button>
                        
                        <button className="action-btn" onClick={() => navigate('/mess-menu')}>
                            <span className="action-icon">🍽️</span>
                            <span>Today's Mess Menu</span>
                        </button>
                        
                        <button className="action-btn" onClick={() => navigate('/food-tracker')}>
                            <span className="action-icon">🤖</span>
                            <span>AI Food Tracker</span>
                        </button>
                        
                        <button className="action-btn" onClick={() => navigate('/profile')}>
                            <span className="action-icon">👤</span>
                            <span>My Profile</span>
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-section">
                    <h2>Recent Activity</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon">✅</div>
                            <div className="activity-content">
                                <p>Mess fee deducted - ₹100</p>
                                <small>Today, 8:00 AM</small>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon">🏨</div>
                            <div className="activity-content">
                                <p>Room A-201 allocated</p>
                                <small>Yesterday, 3:30 PM</small>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon">💰</div>
                            <div className="activity-content">
                                <p>Wallet topped up - ₹5,000</p>
                                <small>15 Feb 2025, 11:20 AM</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="dashboard-footer">
                <p>GP Barh Hostel Management System • Semester: {user?.semester} • Contact Warden: +91 612 2262866</p>
            </footer>
        </div>
    );
};

export default DashboardPage;