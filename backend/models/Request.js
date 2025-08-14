const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['leave', 'overtime', 'swap'], required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Canceled'], default: 'Pending' },
    details: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);