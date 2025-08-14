const express = require('express');
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');

const router = express.Router();

// Get current user's schedule (userId via query)
router.get('/me', async (req, res) => {
  try {
    const userId = String(req.query.userId || '');
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const docs = await Schedule.find({ userId }, { _id: 1, date: 1, type: 1 }).lean();
    const schedule = docs.map(doc => ({ id: String(doc._id), date: doc.date, type: doc.type }));
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Find available swap options for a given shift
router.get('/available-swaps/:shiftId', async (req, res) => {
  try {
    const { shiftId } = req.params;
    if (!mongoose.isValidObjectId(shiftId)) {
      return res.status(400).json({ message: 'Invalid shift ID' });
    }

    const myShift = await Schedule.findById(shiftId).lean();
    if (!myShift) return res.status(404).json({ message: 'Shift not found' });

    // Return other users' shifts as potential swap options (simple heuristic: same month)
    const monthPrefix = myShift.date.slice(0, 7); // YYYY-MM
    const candidates = await Schedule.aggregate([
      { $match: { userId: { $ne: myShift.userId }, date: { $regex: `^${monthPrefix}` } } },
      { $limit: 25 },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, date: 1, type: 1, employeeId: '$user._id', employeeName: '$user.name' } },
    ]);

    const options = candidates.map(c => ({
      id: String(c._id),
      employeeId: c.employeeId ? String(c.employeeId) : undefined,
      employeeName: c.employeeName || 'Employee',
      date: c.date,
      type: c.type,
    }));

    res.json(options);
  } catch (error) {
    console.error('Error fetching swap options:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;