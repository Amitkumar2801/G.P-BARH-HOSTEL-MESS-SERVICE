const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'cash', 'upi', 'card', 'netbanking'],
        default: 'razorpay'
    },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    
    // Daily mess deduction ke liye
    isDailyDeduction: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    
    // Holiday tracking
    isHoliday: {
        type: Boolean,
        default: false
    },
    holidayAmount: {
        type: Number,
        default: 0
    },
    
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'completed'
    }
});

const walletSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    currentBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    totalCredited: {
        type: Number,
        default: 0
    },
    totalDebited: {
        type: Number,
        default: 0
    },
    
    // Daily mess rate
    dailyMessRate: {
        type: Number,
        default: 100 // Rs. 100 per day
    },
    
    // Auto-deduction settings
    autoDeduction: {
        type: Boolean,
        default: true
    },
    lastDeductionDate: Date,
    
    // Holiday wallet (tumhara idea)
    holidayWallet: {
        type: Number,
        default: 0
    },
    
    transactions: [transactionSchema],
    
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Daily balance check middleware
walletSchema.pre('save', function(next) {
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('Wallet', walletSchema);