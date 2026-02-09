const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  from: Date,
  to: Date,
  status: { type: String, default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
