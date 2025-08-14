const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all requests for the current user
router.get('/me', auth, async (req, res) => {
    try {
        const requests = await Request.find({ userId: req.user.id })
            .populate('details.myShiftId')
            .populate('details.targetShiftId')
            .populate('details.targetUserId', 'name')
            .populate('details.requesterSchedule')
            .populate('details.requester', 'name')
            .sort({ createdAt: -1 });
        
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create leave request
router.post('/leave', auth, async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        
        const request = new Request({
            userId: req.user.id,
            type: 'Leave',
            details: {
                startDate,
                endDate,
                reason
            }
        });
        
        await request.save();
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create overtime request
router.post('/overtime', auth, async (req, res) => {
    try {
        const { date, hours, reason } = req.body;
        
        const request = new Request({
            userId: req.user.id,
            type: 'Overtime',
            details: {
                date,
                hours,
                reason
            }
        });
        
        await request.save();
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create shift swap request
router.post('/shift_swap', auth, async (req, res) => {
    try {
        const { myShiftId, targetShiftId } = req.body;
        
        // Get target shift details
        const targetShift = await Schedule.findById(targetShiftId).populate('userId', 'name');
        
        // Create sent request for the current user
        const sentRequest = new Request({
            userId: req.user.id,
            type: 'Shift Swap',
            subType: 'Sent',
            details: {
                myShiftId,
                targetShiftId,
                targetUserId: targetShift.userId._id
            }
        });
        
        // Create received request for the target user
        const receivedRequest = new Request({
            userId: targetShift.userId._id,
            type: 'Shift Swap',
            subType: 'Received',
            details: {
                myShiftId,
                targetShiftId,
                requesterSchedule: myShiftId,
                requester: req.user.id
            }
        });
        
        await Promise.all([sentRequest.save(), receivedRequest.save()]);
        res.json({ sentRequest, receivedRequest });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel request
router.put('/:type/:id/cancel', auth, async (req, res) => {
    try {
        const { type, id } = req.params;
        const request = await Request.findById(id);
        
        if (!request || request.userId.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Request not found' });
        }
        
        if (request.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only cancel pending requests' });
        }
        
        request.status = 'Canceled';
        await request.save();
        
        // If it's a shift swap, also cancel the corresponding request
        if (type === 'shift_swap' && request.subType === 'Sent') {
            const correspondingRequest = await Request.findOne({
                type: 'Shift Swap',
                subType: 'Received',
                'details.requester': req.user.id,
                'details.myShiftId': request.details.myShiftId,
                'details.targetShiftId': request.details.targetShiftId
            });
            
            if (correspondingRequest) {
                correspondingRequest.status = 'Canceled';
                await correspondingRequest.save();
            }
        }
        
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;