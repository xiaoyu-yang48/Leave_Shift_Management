const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    type: { type: String, required: true, enum: ['Leave', 'Overtime', 'Shift Swap'] },
    subType: { type: String, enum: ['Sent', 'Received'] }, // For shift swap requests
    status: { type: String, required: true, enum: ['Pending', 'Approved', 'Rejected', 'Canceled'], default: 'Pending' },
    details: {
        // For Leave requests
        startDate: String,
        endDate: String,
        reason: String,
        
        // For Overtime requests
        date: String,
        hours: Number,
        reason: String,
        
        // For Shift Swap requests
        myShiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
        targetShiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
        targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        requesterSchedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
        requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Request', requestSchema);