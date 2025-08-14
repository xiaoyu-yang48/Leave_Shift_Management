const express = require('express');
const Schedule = require('../models/Schedule');

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const docs = await Schedule.find(
      { userId },
      { _id: 1, date: 1, type: 1 }
    ).lean();

    const shifts = docs.map(doc => ({ id: String(doc._id), date: doc.date, type: doc.type }));
    res.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;