const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { registrationNumber, email, password, phone, fullName, dateOfBirth, gender, course, semester } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ 
            $or: [{ registrationNumber }, { email }] 
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this registration number or email'
            });
        }

        // Create user
        const user = await User.create({
            registrationNumber,
            email,
            password, // Automatically hashed by pre-save middleware
            phone,
            fullName,
            dateOfBirth,
            gender,
            course,
            semester,
            role: 'student'
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    _id: user._id,
                    registrationNumber: user.registrationNumber,
                    fullName: user.fullName,
                    email: user.email,
                    course: user.course,
                    semester: user.semester,
                    role: user.role,
                    token: generateToken(user._id)
                }
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { registrationNumber, password } = req.body;

        // Find user by registration number
        const user = await User.findOne({ registrationNumber });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid registration number or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid registration number or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                registrationNumber: user.registrationNumber,
                fullName: user.fullName,
                email: user.email,
                course: user.course,
                semester: user.semester,
                role: user.role,
                hostelType: user.hostelType,
                roomAllocated: user.roomAllocated,
                roomNumber: user.roomNumber,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    res.json({
        success: true,
        message: 'Password reset link would be sent to email (to be implemented)'
    });
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};

module.exports = {
    register,
    login,
    getProfile,
    forgotPassword,
    logout
};