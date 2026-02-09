const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rollNumber: String,
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
