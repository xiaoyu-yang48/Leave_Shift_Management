const express = require('express');
const mongoose = require('mongoose');
const Availability = require('../models/Availability');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, async (req, res) => {
    try {
        const userId = String(req.user?.id);
        let { year, month } = req.query;
       
        if (year && month) {
            const now = new Date();
            year = now.getFullYear();
            month = now.getMonth() + 1; // Adjust for zero-based month
        }

        const mm = String(month).padStart(2, '0');
        const prefix = `${year}-${mm}`;
        const docs = await Availability.find(
            { userId, date: { $regex: `^${prefix}` } },
            { _id: 1, date: 1, available: 1 }
        ).lean();

        res.json(docs);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/save', protect, async (req, res) => {
    try {
        const userId = String(req.user?.id);
        const rows = Array.isArray(req.body) ? req.body : [];

        if (!rows.length) {
            return res.status(400).json({ message: 'No availability data provided' });
        }

        const updates = rows.map(row => ({
            userId,
            date: row.date,
            available: row.available
        }));

        await Availability.bulkWrite(
            updates.map(update => ({
                updateOne: {
                    filter: { userId, date: update.date },
                    update: { $set: { available: update.available }, $setOnInsert: { userId, date: update.date } },
                    upsert: true
                }
            }))
        );

        res.json({ message: 'Availability updated successfully' });
    } catch (error) {
        console.error('Error saving availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;