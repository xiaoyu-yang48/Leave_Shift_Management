const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        date: { type: String, required: true }, // YYYY-MM-DD
        type: { type: String, required: true }, // e.g., Morning, Afternoon, Night
    },
    { timestamps: true }
);

scheduleSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);