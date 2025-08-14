const express = require('express');
const Availability = require('../models/Availability');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get availability for the current user filtered by year and month (defaults to current month)
router.get('/me', protect, async (req, res) => {
  try {
    const userId = String(req.user.id);
    let { year, month } = req.query; // month: 1-12

    // Default to current month if not provided
    if (!year || !month) {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1; // 1-12
    }

    const mm = String(month).padStart(2, '0');
    const prefix = `${year}-${mm}-`;

    const docs = await Availability.find(
      { userId, date: { $regex: `^${prefix}` } },
      { _id: 0, userId: 0, createdAt: 0, updatedAt: 0, __v: 0 }
    ).lean();

    res.json(docs);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save availability for current user (expects array of { date, available })
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
      available: !!row.available,
    }));

    await Promise.all(
      updates.map(u =>
        Availability.updateOne(
          { userId, date: u.date },
          { $set: u },
          { upsert: true }
        )
      )
    );

    res.json({ message: 'Availability saved' });
  } catch (error) {
    console.error('Error saving availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;