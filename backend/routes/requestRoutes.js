const express = require('express');
const mongoose = require('mongoose');
const Request = require('../models/Request');

const router = express.Router();

// List my requests (userId via query)
router.get('/me', async (req, res) => {
  try {
    const userId = String(req.query.userId || '');
    if (!userId) return res.status(400).json({ message: 'userId is required' });

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

// Cancel own pending request (userId via query)
router.post('/:id/cancel', async (req, res) => {
  try {
    const userId = String(req.query.userId || '');
    const { id } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid request ID' });

    const request = await Request.findOne({ _id: id, userId });
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

// Submit leave request (userId in body)
router.post('/leave', async (req, res) => {
  try {
    const { userId, startDate, endDate, reason } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (!startDate || !endDate) return res.status(400).json({ message: 'Missing start or end date' });

    const doc = await Request.create({
      userId,
      type: 'leave',
      details: { startDate, endDate, reason },
    });
    res.status(201).json({ id: String(doc._id) });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit overtime request (userId in body)
router.post('/overtime', async (req, res) => {
  try {
    const { userId, shiftId, hours, reason } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (!shiftId || !hours) return res.status(400).json({ message: 'Missing shiftId or hours' });

    const doc = await Request.create({
      userId,
      type: 'overtime',
      details: { shiftId, hours, reason },
    });
    res.status(201).json({ id: String(doc._id) });
  } catch (error) {
    console.error('Error creating overtime request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit shift swap request (userId in body)
router.post('/swap', async (req, res) => {
  try {
    const { userId, shiftId, targetShiftId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (!shiftId || !targetShiftId) return res.status(400).json({ message: 'Missing shiftId or targetShiftId' });

    const doc = await Request.create({
      userId,
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