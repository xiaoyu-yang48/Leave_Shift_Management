const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    }, // Format: YYYY-MM-DD
    type: { 
        type: String, 
        required: true,
        enum: ['Morning', 'Afternoon']
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
scheduleSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);