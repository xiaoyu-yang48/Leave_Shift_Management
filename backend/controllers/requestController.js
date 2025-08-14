const Leave = require('../models/Leave');
const Overtime = require('../models/Overtime');
const ShiftSwap = require('../models/ShiftSwap');
const mongoose = require('mongoose');

// Get all requests for the current user (leave, overtime, shift swap)
const getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get leave requests
        const leaveRequests = await Leave.find({ userId })
            .select('_id startDate endDate type reason status adminNotes requestDate')
            .lean();

        // Get overtime requests
        const overtimeRequests = await Overtime.find({ userId })
            .populate('scheduleId', 'date type')
            .select('_id date requestedHours approvedHours reason status adminNotes requestDate scheduleId')
            .lean();

        // Get shift swap requests (both sent and received)
        const sentShiftSwaps = await ShiftSwap.find({ requesterId: userId })
            .populate('requesterScheduleId', 'date type')
            .populate('targetUserId', 'name email')
            .populate('targetScheduleId', 'date type')
            .select('_id reason status adminNotes requestDate responseDate requesterScheduleId targetUserId targetScheduleId')
            .lean();

        const receivedShiftSwaps = await ShiftSwap.find({ targetUserId: userId })
            .populate('requesterId', 'name email')
            .populate('requesterScheduleId', 'date type')
            .populate('targetScheduleId', 'date type')
            .select('_id reason status adminNotes requestDate responseDate requesterId requesterScheduleId targetScheduleId')
            .lean();

        // Format all requests with a common structure
        const allRequests = [];

        // Add leave requests
        leaveRequests.forEach(leave => {
            allRequests.push({
                id: leave._id,
                type: 'Leave',
                subType: leave.type,
                status: leave.status,
                requestDate: leave.requestDate,
                details: {
                    startDate: leave.startDate,
                    endDate: leave.endDate,
                    reason: leave.reason,
                    adminNotes: leave.adminNotes
                }
            });
        });

        // Add overtime requests
        overtimeRequests.forEach(overtime => {
            allRequests.push({
                id: overtime._id,
                type: 'Overtime',
                subType: 'Request',
                status: overtime.status,
                requestDate: overtime.requestDate,
                details: {
                    date: overtime.date,
                    requestedHours: overtime.requestedHours,
                    approvedHours: overtime.approvedHours,
                    reason: overtime.reason,
                    adminNotes: overtime.adminNotes,
                    schedule: overtime.scheduleId ? {
                        type: overtime.scheduleId.type
                    } : null
                }
            });
        });

        // Add sent shift swap requests
        sentShiftSwaps.forEach(swap => {
            allRequests.push({
                id: swap._id,
                type: 'Shift Swap',
                subType: 'Sent',
                status: swap.status,
                requestDate: swap.requestDate,
                details: {
                    reason: swap.reason,
                    adminNotes: swap.adminNotes,
                    responseDate: swap.responseDate,
                    requesterSchedule: swap.requesterScheduleId ? {
                        date: swap.requesterScheduleId.date,
                        type: swap.requesterScheduleId.type
                    } : null,
                    targetUser: swap.targetUserId ? {
                        name: swap.targetUserId.name,
                        email: swap.targetUserId.email
                    } : null,
                    targetSchedule: swap.targetScheduleId ? {
                        date: swap.targetScheduleId.date,
                        type: swap.targetScheduleId.type
                    } : null
                }
            });
        });

        // Add received shift swap requests
        receivedShiftSwaps.forEach(swap => {
            allRequests.push({
                id: swap._id,
                type: 'Shift Swap',
                subType: 'Received',
                status: swap.status,
                requestDate: swap.requestDate,
                details: {
                    reason: swap.reason,
                    adminNotes: swap.adminNotes,
                    responseDate: swap.responseDate,
                    requester: swap.requesterId ? {
                        name: swap.requesterId.name,
                        email: swap.requesterId.email
                    } : null,
                    requesterSchedule: swap.requesterScheduleId ? {
                        date: swap.requesterScheduleId.date,
                        type: swap.requesterScheduleId.type
                    } : null,
                    targetSchedule: swap.targetScheduleId ? {
                        date: swap.targetScheduleId.date,
                        type: swap.targetScheduleId.type
                    } : null
                }
            });
        });

        // Sort by request date (newest first)
        allRequests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

        res.json(allRequests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cancel any request by ID and type
const cancelRequest = async (req, res) => {
    try {
        const { requestType, requestId } = req.params;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(requestId)) {
            return res.status(400).json({ message: 'Invalid request ID' });
        }

        let request;
        let Model;

        switch (requestType.toLowerCase()) {
            case 'leave':
                Model = Leave;
                break;
            case 'overtime':
                Model = Overtime;
                break;
            case 'shiftswap':
                Model = ShiftSwap;
                break;
            default:
                return res.status(400).json({ message: 'Invalid request type' });
        }

        // Find the request and verify ownership
        if (requestType.toLowerCase() === 'shiftswap') {
            request = await Model.findOne({ 
                _id: requestId, 
                $or: [{ requesterId: userId }, { targetUserId: userId }]
            });
        } else {
            request = await Model.findOne({ _id: requestId, userId });
        }

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ 
                message: 'Can only cancel pending requests' 
            });
        }

        request.status = 'Cancelled';
        await request.save();

        res.json({ message: 'Request cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMyRequests,
    cancelRequest
};