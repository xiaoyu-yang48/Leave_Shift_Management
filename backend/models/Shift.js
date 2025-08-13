const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    shiftType: { type: String, enum: ['Morning', 'Afternoon', 'Night'], required: true },
    location: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shift', shiftSchema);