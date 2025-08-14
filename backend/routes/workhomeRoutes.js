const express = require('express');
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const { protect } = require('../middleware/authMiddleware');
const Request = require('../models/Request');
const User = require('../models/User');

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

// Get available target shifts to swap with for a specific shift
router.get('/availableswaps/me/:shiftId', protect, async (req, res) => {
    try {
        const userId = String(req.user.id);
        const { shiftId } = req.params;

        const myShift = await Schedule.findOne({ _id: shiftId, userId }).lean();
        if (!myShift) return res.json([]);

        const availableShifts = await Schedule.find({
            userId: { $ne: req.user._id },
            date: myShift.date,
            type: myShift.type
        })
            .populate('userId', 'name')
            .lean();

        const formattedShifts = availableShifts.map(shift => ({
            id: String(shift._id),
            employeeId: String(shift.userId?._id || ''),
            employeeName: shift.userId?.name || 'Unknown',
            date: shift.date,
            type: shift.type
        }));

        return res.json(formattedShifts);
    } catch (error) {
        console.error('Error fetching available swaps:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a shift swap request
router.post('/swap', protect, async (req, res) => {
    try {
        const userId = String(req.user?.id);
        const { myShiftId, targetShiftId } = req.body || {};
        if (!myShiftId || !targetShiftId) {
            return res.status(400).json({ message: 'Missing myShiftId or targetShiftId' });
        }

        const mySchedule = await Schedule.findOne({ _id: myShiftId, userId }).lean();
        const targetSchedule = await Schedule.findOne({ _id: targetShiftId }).lean();
        if (!mySchedule || !targetSchedule) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        const targetUser = await User.findById(targetSchedule.userId).lean();

        const created = await Request.create({
            userId,
            type: 'Shift Swap',
            status: 'Pending',
            details: {
                requesterSchedule: { id: String(mySchedule._id), date: mySchedule.date, type: mySchedule.type },
                targetSchedule: { id: String(targetSchedule._id), date: targetSchedule.date, type: targetSchedule.type },
                targetUser: targetUser ? { id: String(targetUser._id), name: targetUser.name } : null,
            },
        });

        res.status(201).json({ id: String(created._id) });
    } catch (error) {
        console.error('Error creating swap request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;