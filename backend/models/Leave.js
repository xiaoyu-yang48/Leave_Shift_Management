const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    startDate: { 
        type: String, 
        required: true 
    }, // Format: YYYY-MM-DD
    endDate: { 
        type: String, 
        required: true 
    }, // Format: YYYY-MM-DD
    type: {
        type: String,
        required: true,
        enum: ['Sick', 'Vacation', 'Personal', 'Emergency', 'Family']
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
    requestDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
leaveSchema.index({ userId: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Leave', leaveSchema);