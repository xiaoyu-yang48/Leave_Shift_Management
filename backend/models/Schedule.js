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
        enum: ['Morning', 'Afternoon', 'Evening', 'Night']
    },
    startTime: { 
        type: String, 
        required: true 
    }, // Format: HH:MM
    endTime: { 
        type: String, 
        required: true 
    }, // Format: HH:MM
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
scheduleSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);