const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    complaintId: {
        type: String,
        unique: true,
        default: () => `COMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    },
    category: {
        type: String,
        enum: ['ROOM', 'MESS', 'ELECTRICITY', 'WATER', 'CLEANING', 'SECURITY', 'OTHER'],
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true
    },
    
    // Multimedia support (tumhara idea)
    attachments: [{
        fileType: {
            type: String,
            enum: ['image', 'video', 'document']
        },
        fileUrl: String,
        thumbnailUrl: String,
        uploadedAt: Date
    }],
    
    // Status tracking
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
        default: 'PENDING'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM'
    },
    
    // Assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Warden ya staff
    },
    assignedDate: Date,
    
    // Resolution
    resolvedDate: Date,
    resolutionNotes: String,
    
    // Feedback
    studentRating: {
        type: Number,
        min: 1,
        max: 5
    },
    studentFeedback: String,
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
});

complaintSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Complaint', complaintSchema);