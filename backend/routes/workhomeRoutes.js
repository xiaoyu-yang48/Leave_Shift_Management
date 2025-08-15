const express = require('express');
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Request = require('../models/Request');

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

// shift swap route
router.get('/availableswaps/me/:shiftId', protect, async (req, res) => {

    try {
        const userId = String(req.user?.id);
        const {shiftId} = req.params;

        const myShift = await Schedule.findOne({ _id: shiftId, userId }).lean();
        if (!myShift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        const availableShifts = await Schedule.find({
            userId: { $ne: req.user._id },
            date: myShift.date,
            type: myShift.type
        }).populate('userId', 'name').lean();

        const formattedShifts = availableShifts.map(shift => ({
            id: String(shift._id),
            employeeId: String(shift.userId?._id||''),
            employeeName: shift.userId?.name||'unknown',
            date: shift.date,
            type: shift.type
        }));

        return res.json(formattedShifts);
    } catch (error) {
        console.error('Error fetching available shifts:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/swap', protect, async (req, res) => {
    try {
        const userId = String(req.user?.id);
        const { myShiftId, targetShiftId } = req.body|| {};
        if (!myShiftId || !targetShiftId) {
            return res.status(400).json({ message: 'Invalid request data' });
        }

        const myShift = await Schedule.findOne({ _id: myShiftId, userId }).lean();
        const targetShift = await Schedule.findOne({ _id: targetShiftId }).lean();
        if (!myShift || !targetShift) {
            return res.status(404).json({ message: 'Shift not found' });
        }
        const targetEmployee = await User.findById(targetShift.userId).lean();

        const swapRequest = await Request.create({
            userId: userId,
            type: 'Shift Swap',
            status: 'Pending',
            details: {
                requesterSchedule: { id: String(myShift._id), date: myShift.date, type: myShift.type },
                targetUser: targetEmployee ? { id: String(targetEmployee._id), name: targetEmployee.name } : null,
            },
        });

        return res.status(201).json({ message: 'Swap request created successfully', requestId: swapRequest._id });
    } catch (error) {
        console.error('Error creating swap request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;