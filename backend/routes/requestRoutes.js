const express = require('express');
const Request = require('../models/Request');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all requests for the logged-in user
router.get('/me', protect, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const requests = await Request.find({ userId }).sort({ createdAt: -1 }).lean();
		const response = requests.map(r => ({
			id: String(r._id),
			type: r.type,
			subType: r.subType,
			status: r.status,
			details: r.details || {},
			createdAt: r.createdAt,
		}));
		res.json(response);
	} catch (error) {
		console.error('Error fetching requests:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// Cancel a request (type path segment accepted but not used beyond routing)
router.put('/:requestType/:id/cancel', protect, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const { id } = req.params;
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

// Create a leave request
router.post('/leave', protect, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const { leaveType, startDate, endDate, reason } = req.body || {};
		if (!leaveType || !startDate || !endDate) {
			return res.status(400).json({ message: 'Missing leaveType, startDate, or endDate' });
		}
		const created = await Request.create({
			userId,
			type: 'Leave',
			status: 'Pending',
			details: { leaveType, startDate, endDate, reason },
		});
		res.status(201).json({ id: String(created._id) });
	} catch (error) {
		console.error('Error creating leave request:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// Create an overtime request
router.post('/overtime', protect, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const { date, hours, shiftId } = req.body || {};
		if (!date || !hours) {
			return res.status(400).json({ message: 'Missing date or hours' });
		}
		const created = await Request.create({
			userId,
			type: 'Overtime',
			status: 'Pending',
			details: { date, hours, shiftId },
		});
		res.status(201).json({ id: String(created._id) });
	} catch (error) {
		console.error('Error creating overtime request:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;