const express = require('express');
const Availability = require('../models/Availability');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get availability for the current user filtered by year and month
router.get('/me', protect, async (req, res) => {
  try {
    const userId = String(req.user.id);
    const { year, month } = req.query; // month: 1-12

    let regex = undefined;
    if (year && month) {
      const mm = String(month).padStart(2, '0');
      regex = new RegExp(`^${year}-${mm}-`);
    }

    const query = { userId };
    if (regex) query.date = { $regex: regex };

    const docs = await Availability.find(query, { _id: 0, userId: 0, createdAt: 0, updatedAt: 0, __v: 0 }).lean();
    res.json(docs);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save availability for current user (expects array of { date, available })
router.post('/save', protect, async (req, res) => {
  try {
    const userId = String(req.user.id);
    const rows = Array.isArray(req.body) ? req.body : [];

    if (!rows.length) {
      return res.status(400).json({ message: 'No availability data provided' });
    }

    // Perform upserts
    const ops = rows.map(row => ({
      updateOne: {
        filter: { userId, date: row.date },
        update: { $set: { userId, date: row.date, available: !!row.available } },
        upsert: true,
      },
    }));

    await Availability.bulkWrite(ops);
    res.json({ message: 'Availability saved' });
  } catch (error) {
    console.error('Error saving availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;