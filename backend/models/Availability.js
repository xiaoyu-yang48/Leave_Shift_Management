const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    }, // Format: YYYY-MM-DD
    available: { 
        type: Boolean, 
        required: true,
        default: true
    },
    timeSlots: [{
        startTime: { type: String }, // Format: HH:MM
        endTime: { type: String },   // Format: HH:MM
        available: { type: Boolean, default: true }
    }],
    notes: { 
        type: String 
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
availabilitySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);