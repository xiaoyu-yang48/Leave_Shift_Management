const mongoose = require('mongoose');

const shiftSwapSchema = new mongoose.Schema({
    requesterId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    requesterScheduleId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Schedule', 
        required: true 
    },
    targetUserId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    targetScheduleId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Schedule' 
    },
    reason: { 
        type: String, 
        required: true 
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Admin_Approved'],
        default: 'Pending'
    },
    adminNotes: { 
        type: String 
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    responseDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
shiftSwapSchema.index({ requesterId: 1, status: 1 });
shiftSwapSchema.index({ targetUserId: 1, status: 1 });
shiftSwapSchema.index({ status: 1 });

module.exports = mongoose.model('ShiftSwap', shiftSwapSchema);