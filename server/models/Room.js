const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    
    // Hostel type
    hostelBlock: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'Girls_Hostel'],
        required: true
    },
    floorNumber: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    
    // Room details (tumhara 3 bed wala idea)
    roomType: {
        type: String,
        enum: ['Single', 'Double', 'Triple', 'Four-Seater'],
        default: 'Triple'
    },
    totalBeds: {
        type: Number,
        required: true,
        default: 3
    },
    bedsAvailable: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Facilities
    amenities: [{
        type: String,
        enum: ['AC', 'FAN', 'ALMIRAH', 'TABLE', 'CHAIR', 'ATTACHED_BATHROOM', 'BALCONY']
    }],
    
    // Photos (3D view ke liye)
    photos: [{
        url: String,
        caption: String,
        isPrimary: Boolean
    }],
    
    // 360° view
    threeSixtyView: {
        type: String, // URL for 360 image
        default: null
    },
    
    // Pricing
    rentPerMonth: {
        type: Number,
        required: true
    },
    securityDeposit: {
        type: Number,
        default: 2000
    },
    
    // Occupants
    currentOccupants: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        bedNumber: Number,
        joinedDate: Date
    }],
    
    // Status
    isAvailable: {
        type: Boolean,
        default: true
    },
    underMaintenance: {
        type: Boolean,
        default: false
    },
    
    // Metadata
    lastCleaned: Date,
    wardenIncharge: String
});

module.exports = mongoose.model('Room', roomSchema);