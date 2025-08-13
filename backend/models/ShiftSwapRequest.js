const mongoose = require('mongoose');

const shiftSwapRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requesterShift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    targetShift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Canceled'], default: 'Pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShiftSwapRequest', shiftSwapRequestSchema);