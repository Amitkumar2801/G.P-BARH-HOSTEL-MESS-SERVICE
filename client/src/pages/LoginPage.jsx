import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        registrationNumber: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.registrationNumber.match(/^\d{10}$/)) {
            toast.error('Please enter a valid 10-digit registration number');
            return;
        }
        
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            
            if (response.data.success) {
                localStorage.setItem('hostel_token', response.data.data.token);
                localStorage.setItem('hostel_user', JSON.stringify(response.data.data));
                
                toast.success('🎉 Login successful! Redirecting...');
                
                // ALWAYS redirect to dashboard (temporary)
                setTimeout(() => {
                    navigate('/dashboard'); // Always go to dashboard
                }, 1500);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Server connection failed';
            toast.error(`❌ ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = (type) => {
        const demoAccounts = {
            student: { registrationNumber: '1554424049', password: 'password123' },
            warden: { registrationNumber: 'WARDEN001', password: 'warden123' },
            admin: { registrationNumber: 'ADMIN001', password: 'admin123' }
        };
        
        setFormData(demoAccounts[type]);
        toast.success(`${type.toUpperCase()} demo credentials loaded`);
    };

    return (
        <div className="login-page">
            {/* Left Side - With Background Image */}
            <div className="login-left">
                <div className="background-overlay">
                    <div className="college-info">
                        {/* YEH LINE CHANGE: src mein direct path */}
                        <img 
                            src="/assets/logo.png" 
                            alt="GP Barh Logo" 
                            className="college-logo"
                        />
                        <h1>Government Polytechnic Barh</h1>
                        <h2>Hostel & Mess Management System</h2>
                        <p className="tagline">Smart Campus Living Redefined</p>
                        
                        <div className="features-list">
                            <div className="feature-item">
                                <span className="feature-icon">🛏️</span>
                                <span>Online Room Booking</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">💳</span>
                                <span>Digital Wallet & Payments</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">🤖</span>
                                <span>AI Food Calorie Tracker</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📱</span>
                                <span>Real-time Complaint System</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-right">
                <div className="login-form-container">
                    <div className="form-header">
                        <h2>Student Login Portal</h2>
                        <p>Access your hostel & mess services</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label>
                                <span className="label-icon">🎓</span>
                                Registration Number
                            </label>
                            <input
                                type="text"
                                name="registrationNumber"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                placeholder="1554424049"
                                pattern="\d{10}"
                                required
                            />
                            <small className="input-hint">Enter your 10-digit college registration number</small>
                        </div>

                        <div className="input-group">
                            <label>
                                <span className="label-icon">🔐</span>
                                Password
                            </label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    minLength="6"
                                    required
                                />
                                <button 
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                            <small className="input-hint">Minimum 6 characters</small>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <button 
                            type="submit" 
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Authenticating...
                                </>
                            ) : (
                                'Login to Dashboard'
                            )}
                        </button>

                        <div className="demo-section">
                            <p className="demo-title">Quick Demo Access:</p>
                            <div className="demo-buttons">
                                <button 
                                    type="button"
                                    className="demo-btn student"
                                    onClick={() => handleDemoLogin('student')}
                                >
                                    Student Demo
                                </button>
                                <button 
                                    type="button"
                                    className="demo-btn warden"
                                    onClick={() => handleDemoLogin('warden')}
                                >
                                    Warden Demo
                                </button>
                                <button 
                                    type="button"
                                    className="demo-btn admin"
                                    onClick={() => handleDemoLogin('admin')}
                                >
                                    Admin Demo
                                </button>
                            </div>
                        </div>

                        <div className="register-link">
                            <p>New to GP Barh Hostel?</p>
                            <Link to="/register" className="register-btn">
                                Create Student Account →
                            </Link>
                        </div>
                    </form>

                    <div className="login-footer">
                        <p className="security-note">
                            🔒 Secured by JWT Authentication & SSL Encryption
                        </p>
                        <p className="support-contact">
                            Need help? Contact Hostel Office: 
                            <a href="tel:+916122262866"> +91 612 2262866</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;