const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    date: { type: String, required: true },
    available: { type: Boolean, required: true , default: true },
}, {
    timestamps: true
});

availabilitySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);