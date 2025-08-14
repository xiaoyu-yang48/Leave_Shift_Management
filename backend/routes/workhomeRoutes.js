const express = require('express');
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/schedule/:userId', protect, async (req, res) => {
    try {

        const viewer = String(req.user?.id);
        const userId = String(req.params.userId);

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        if (viewer !== userId) {
            // Only allow users to view their own schedule
            return res.status(403).json({ message: 'Access denied' });
        }
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

module.exports = router;