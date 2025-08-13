const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD (UTC)
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

availabilitySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);