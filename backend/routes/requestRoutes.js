const express = require('express');
const mongoose = require('mongoose');
const Request = require('../models/Request');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// List my requests
router.get('/me', protect, async (req, res) => {
  try {
    const userId = String(req.user.id);
    const docs = await Request.find({ userId }).sort({ createdAt: -1 }).lean();
    const result = docs.map(d => ({ id: String(d._id), type: mapType(d.type), status: d.status, date: d.createdAt }));
    res.json(result);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

function mapType(type) {
  switch (type) {
    case 'leave': return 'Leave';
    case 'overtime': return 'Overtime';
    case 'swap': return 'Shift Swap';
    default: return type;
  }
}

// Cancel own pending request
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid request ID' });

    const request = await Request.findOne({ _id: id, userId: req.user.id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Only pending requests can be canceled' });

    request.status = 'Canceled';
    await request.save();
    res.json({ message: 'Request canceled' });
  } catch (error) {
    console.error('Error canceling request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit leave request
router.post('/leave', protect, async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate) return res.status(400).json({ message: 'Missing start or end date' });

    const doc = await Request.create({
      userId: req.user.id,
      type: 'leave',
      details: { startDate, endDate, reason },
    });
    res.status(201).json({ id: String(doc._id) });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit overtime request
router.post('/overtime', protect, async (req, res) => {
  try {
    const { shiftId, hours, reason } = req.body;
    if (!shiftId || !hours) return res.status(400).json({ message: 'Missing shiftId or hours' });

    const doc = await Request.create({
      userId: req.user.id,
      type: 'overtime',
      details: { shiftId, hours, reason },
    });
    res.status(201).json({ id: String(doc._id) });
  } catch (error) {
    console.error('Error creating overtime request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit shift swap request
router.post('/swap', protect, async (req, res) => {
  try {
    const { shiftId, targetShiftId } = req.body;
    if (!shiftId || !targetShiftId) return res.status(400).json({ message: 'Missing shiftId or targetShiftId' });

    const doc = await Request.create({
      userId: req.user.id,
      type: 'swap',
      details: { shiftId, targetShiftId },
    });
    res.status(201).json({ id: String(doc._id) });
  } catch (error) {
    console.error('Error creating swap request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;