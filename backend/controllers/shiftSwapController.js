const ShiftSwap = require('../models/ShiftSwap');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get employee's shift swap requests (both sent and received)
const getMyShiftSwapRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get requests sent by the user
        const sentRequests = await ShiftSwap.find({ requesterId: userId })
            .populate('requesterScheduleId', 'date type startTime endTime')
            .populate('targetUserId', 'name email')
            .populate('targetScheduleId', 'date type startTime endTime')
            .sort({ requestDate: -1 })
            .lean();

        // Get requests received by the user
        const receivedRequests = await ShiftSwap.find({ targetUserId: userId })
            .populate('requesterId', 'name email')
            .populate('requesterScheduleId', 'date type startTime endTime')
            .populate('targetScheduleId', 'date type startTime endTime')
            .sort({ requestDate: -1 })
            .lean();

        const formatRequest = (request, type) => ({
            id: request._id,
            type, // 'sent' or 'received'
            reason: request.reason,
            status: request.status,
            adminNotes: request.adminNotes,
            requestDate: request.requestDate,
            responseDate: request.responseDate,
            requester: request.requesterId ? {
                id: request.requesterId._id,
                name: request.requesterId.name,
                email: request.requesterId.email
            } : null,
            target: request.targetUserId ? {
                id: request.targetUserId._id,
                name: request.targetUserId.name,
                email: request.targetUserId.email
            } : null,
            requesterSchedule: request.requesterScheduleId ? {
                id: request.requesterScheduleId._id,
                date: request.requesterScheduleId.date,
                type: request.requesterScheduleId.type,
                startTime: request.requesterScheduleId.startTime,
                endTime: request.requesterScheduleId.endTime
            } : null,
            targetSchedule: request.targetScheduleId ? {
                id: request.targetScheduleId._id,
                date: request.targetScheduleId.date,
                type: request.targetScheduleId.type,
                startTime: request.targetScheduleId.startTime,
                endTime: request.targetScheduleId.endTime
            } : null
        });

        const allRequests = [
            ...sentRequests.map(req => formatRequest(req, 'sent')),
            ...receivedRequests.map(req => formatRequest(req, 'received'))
        ].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

        res.json(allRequests);
    } catch (error) {
        console.error('Error fetching shift swap requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new shift swap request
const createShiftSwapRequest = async (req, res) => {
    try {
        const requesterId = req.user.id;
        const { requesterScheduleId, targetUserId, targetScheduleId, reason } = req.body;

        // Validate required fields
        if (!requesterScheduleId || !reason) {
            return res.status(400).json({ 
                message: 'Requester schedule ID and reason are required' 
            });
        }

        // Validate IDs
        if (!mongoose.isValidObjectId(requesterScheduleId)) {
            return res.status(400).json({ message: 'Invalid requester schedule ID' });
        }

        if (targetUserId && !mongoose.isValidObjectId(targetUserId)) {
            return res.status(400).json({ message: 'Invalid target user ID' });
        }

        if (targetScheduleId && !mongoose.isValidObjectId(targetScheduleId)) {
            return res.status(400).json({ message: 'Invalid target schedule ID' });
        }

        // Verify the requester schedule belongs to the user
        const requesterSchedule = await Schedule.findOne({ 
            _id: requesterScheduleId, 
            userId: requesterId 
        });

        if (!requesterSchedule) {
            return res.status(404).json({ 
                message: 'Schedule not found or does not belong to you' 
            });
        }

        // If specific target is provided, verify the target schedule
        if (targetUserId && targetScheduleId) {
            const targetSchedule = await Schedule.findOne({ 
                _id: targetScheduleId, 
                userId: targetUserId 
            });

            if (!targetSchedule) {
                return res.status(404).json({ 
                    message: 'Target schedule not found' 
                });
            }
        }

        // Check for existing pending requests for the same schedule
        const existingRequest = await ShiftSwap.findOne({
            requesterScheduleId,
            status: 'Pending'
        });

        if (existingRequest) {
            return res.status(400).json({ 
                message: 'A swap request already exists for this shift' 
            });
        }

        const shiftSwap = await ShiftSwap.create({
            requesterId,
            requesterScheduleId,
            targetUserId: targetUserId || null,
            targetScheduleId: targetScheduleId || null,
            reason
        });

        // Populate the response
        await shiftSwap.populate([
            { path: 'requesterScheduleId', select: 'date type startTime endTime' },
            { path: 'targetUserId', select: 'name email' },
            { path: 'targetScheduleId', select: 'date type startTime endTime' }
        ]);

        res.status(201).json({
            id: shiftSwap._id,
            reason: shiftSwap.reason,
            status: shiftSwap.status,
            requestDate: shiftSwap.requestDate,
            requesterSchedule: {
                id: shiftSwap.requesterScheduleId._id,
                date: shiftSwap.requesterScheduleId.date,
                type: shiftSwap.requesterScheduleId.type,
                startTime: shiftSwap.requesterScheduleId.startTime,
                endTime: shiftSwap.requesterScheduleId.endTime
            },
            target: shiftSwap.targetUserId ? {
                id: shiftSwap.targetUserId._id,
                name: shiftSwap.targetUserId.name,
                email: shiftSwap.targetUserId.email
            } : null,
            targetSchedule: shiftSwap.targetScheduleId ? {
                id: shiftSwap.targetScheduleId._id,
                date: shiftSwap.targetScheduleId.date,
                type: shiftSwap.targetScheduleId.type,
                startTime: shiftSwap.targetScheduleId.startTime,
                endTime: shiftSwap.targetScheduleId.endTime
            } : null
        });
    } catch (error) {
        console.error('Error creating shift swap request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Respond to shift swap request (accept/reject)
const respondToShiftSwapRequest = async (req, res) => {
    try {
        const { swapId } = req.params;
        const { action } = req.body; // 'accept' or 'reject'
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(swapId)) {
            return res.status(400).json({ message: 'Invalid swap ID' });
        }

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Action must be accept or reject' });
        }

        const shiftSwap = await ShiftSwap.findOne({ 
            _id: swapId, 
            targetUserId: userId 
        });

        if (!shiftSwap) {
            return res.status(404).json({ 
                message: 'Shift swap request not found or not for you' 
            });
        }

        if (shiftSwap.status !== 'Pending') {
            return res.status(400).json({ 
                message: 'Can only respond to pending requests' 
            });
        }

        shiftSwap.status = action === 'accept' ? 'Accepted' : 'Rejected';
        shiftSwap.responseDate = new Date();
        await shiftSwap.save();

        res.json({ 
            message: `Shift swap request ${action}ed successfully`,
            status: shiftSwap.status
        });
    } catch (error) {
        console.error('Error responding to shift swap request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cancel shift swap request (only if pending)
const cancelShiftSwapRequest = async (req, res) => {
    try {
        const { swapId } = req.params;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(swapId)) {
            return res.status(400).json({ message: 'Invalid swap ID' });
        }

        const shiftSwap = await ShiftSwap.findOne({ 
            _id: swapId, 
            requesterId: userId 
        });

        if (!shiftSwap) {
            return res.status(404).json({ message: 'Shift swap request not found' });
        }

        if (shiftSwap.status !== 'Pending') {
            return res.status(400).json({ 
                message: 'Can only cancel pending requests' 
            });
        }

        shiftSwap.status = 'Cancelled';
        await shiftSwap.save();

        res.json({ message: 'Shift swap request cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling shift swap request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMyShiftSwapRequests,
    createShiftSwapRequest,
    respondToShiftSwapRequest,
    cancelShiftSwapRequest
};