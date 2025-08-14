const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    type: { type: String, required: true, enum: ['Morning', 'Afternoon'] },
}, {
    timestamps: true });

scheduleSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);