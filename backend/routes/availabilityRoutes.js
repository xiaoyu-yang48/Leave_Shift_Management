const express = require('express');
const Availability = require('../models/Availability');

const router = express.Router();

// Get availability for the current user filtered by year and month (defaults to current month)
router.get('/me', async (req, res) => {
  try {
    const userId = String(req.query.userId || '');
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    let { year, month } = req.query;

    // Default to current month if not provided
    if (!year || !month) {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1; // 1-12
    }

    const mm = String(month).padStart(2, '0');
    const prefix = `${year}-${mm}`;

    const docs = await Availability.find(
      { userId, date: { $regex: `^${prefix}-` } },
      { _id: 0, date: 1, available: 1 }
    ).lean();

    res.json(docs);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save availability for current user (expects array of { date, available })
router.post('/save', async (req, res) => {
  try {
    const userId = String(req.query.userId || '');
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const rows = Array.isArray(req.body) ? req.body : [];

    if (!rows.length) {
      return res.status(400).json({ message: 'No availability data provided' });
    }

    const updates = rows.map(row => ({
      userId,
      date: row.date,
      available: !!row.available,
    }));

    await Availability.bulkWrite(
      updates.map(update => ({
        updateOne: {
          filter: { userId, date: update.date },
          update: { $set: { available: update.available }, $setOnInsert: { userId, date: update.date } },
          upsert: true,
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