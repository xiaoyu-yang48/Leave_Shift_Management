const express = require('express');
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, async (req, res) => {
    try {
        const userId = String(req.user?.id);
        const docs = await Schedule.find(
            { userId },
            { _id: 1, date: 1, type: 1 }
        ).lean();
        const schedule = docs.map(doc => ({
            id: String(doc._id),
            date: doc.date,
            type: doc.type
        }));

        return res.json(schedule);

    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get available shifts for swap
router.get('/availableswaps/me/:shiftId', protect, async (req, res) => {
    try {
        const { shiftId } = req.params;
        const userId = req.user.id;
        
        // Get the current user's shift
        const myShift = await Schedule.findById(shiftId);
        if (!myShift || myShift.userId.toString() !== userId) {
            return res.status(404).json({ message: 'Shift not found' });
        }
        
        // Find all other shifts on different dates that are not the current user's
        const availableShifts = await Schedule.find({
            userId: { $ne: userId },
            date: { $ne: myShift.date }
        }).populate('userId', 'name');
        
        const formattedShifts = availableShifts.map(shift => ({
            id: shift._id,
            employeeId: shift.userId._id,
            employeeName: shift.userId.name,
            date: shift.date,
            type: shift.type
        }));
        
        res.json(formattedShifts);
    } catch (error) {
        console.error('Error fetching available swaps:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create shift swap request
router.post('/swap', protect, async (req, res) => {
    try {
        const { userId, myShiftId, targetShiftId } = req.body;
        
        // Verify the shifts exist and belong to the correct users
        const myShift = await Schedule.findById(myShiftId);
        const targetShift = await Schedule.findById(targetShiftId);
        
        if (!myShift || myShift.userId.toString() !== userId) {
            return res.status(404).json({ message: 'Your shift not found' });
        }
        
        if (!targetShift) {
            return res.status(404).json({ message: 'Target shift not found' });
        }
        
        // Create the swap request directly here instead of making another HTTP call
        const Request = require('../models/Request');
        
        // Create sent request for the current user
        const sentRequest = new Request({
            userId: req.user.id,
            type: 'Shift Swap',
            subType: 'Sent',
            details: {
                myShiftId,
                targetShiftId,
                targetUserId: targetShift.userId
            }
        });
        
        // Create received request for the target user
        const receivedRequest = new Request({
            userId: targetShift.userId,
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
        res.json({ message: 'Swap request created successfully' });
    } catch (error) {
        console.error('Error creating swap request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;