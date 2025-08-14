const mongoose = require('mongoose');

const overtimeSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    scheduleId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Schedule', 
        required: true 
    },
    date: { 
        type: String, 
        required: true 
    }, // Format: YYYY-MM-DD
    requestedHours: { 
        type: Number, 
        required: true,
        min: 0.5,
        max: 12
    },
    reason: { 
        type: String, 
        required: true 
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    adminNotes: { 
        type: String 
    },
    approvedHours: { 
        type: Number 
    },
    requestDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
overtimeSchema.index({ userId: 1, status: 1 });
overtimeSchema.index({ date: 1 });

module.exports = mongoose.model('Overtime', overtimeSchema);