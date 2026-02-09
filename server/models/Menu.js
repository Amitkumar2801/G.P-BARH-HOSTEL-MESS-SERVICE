const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER']
    },
    calories: Number,
    description: String,
    isSpecial: {
        type: Boolean,
        default: false
    }
});

const dailyMenuSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    day: {
        type: String,
        enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    },
    
    // Meals
    breakfast: [foodItemSchema],
    lunch: [foodItemSchema],
    snacks: [foodItemSchema],
    dinner: [foodItemSchema],
    
    // Special notes
    specialNote: String,
    isHoliday: {
        type: Boolean,
        default: false
    },
    holidayReason: String,
    
    // AI Food Detection Data
    aiDetectedFoods: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        mealType: String,
        detectedItems: [{
            name: String,
            confidence: Number,
            calories: Number
        }],
        photoUrl: String,
        detectedAt: Date
    }],
    
    // Pricing
    mealRate: {
        type: Number,
        default: 100
    },
    
    // Stats
    totalStudentsPresent: {
        type: Number,
        default: 0
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Menu', dailyMenuSchema);