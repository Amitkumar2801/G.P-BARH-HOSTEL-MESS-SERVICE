const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  amount: Number,
  method: String,
  status: String
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
