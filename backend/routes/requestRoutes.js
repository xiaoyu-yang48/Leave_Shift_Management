const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Request = require('../models/Request');

const router = express.Router();

// Get current user's requests
router.get('/me', protect, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const docs = await Request.find({ userId }).sort({ createdAt: -1 }).lean();
		const requests = docs.map(doc => ({
			id: String(doc._id),
			type: doc.type,
			subType: doc.subType,
			status: doc.status,
			details: doc.details || {},
			createdAt: doc.createdAt,
		}));
		return res.json(requests);
	} catch (error) {
		console.error('Error fetching requests:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// Submit an overtime request (simple stub)
router.post('/overtime', protect, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const { shiftId, date, hours } = req.body || {};
		if (!date || !hours) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		const request = await Request.create({
			userId,
			type: 'Overtime',
			status: 'Pending',
			details: { shiftId: shiftId ? String(shiftId) : undefined, date, hours },
		});

		return res.status(201).json({ message: 'Overtime request submitted', id: String(request._id) });
	} catch (error) {
		console.error('Error submitting overtime request:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// Cancel a request (only if pending)
router.put('/:type/:id/cancel', protect, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const { id } = req.params;
		const request = await Request.findOne({ _id: id, userId });
		if (!request) {
			return res.status(404).json({ message: 'Request not found' });
		}
		if (request.status !== 'Pending') {
			return res.status(400).json({ message: 'Only pending requests can be canceled' });
		}
		request.status = 'Canceled';
		await request.save();
		return res.json({ message: 'Request canceled' });
	} catch (error) {
		console.error('Error canceling request:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// Edit a request (only if pending)
router.put('/:id', protect, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const { id } = req.params;
		const { details } = req.body || {};

		const request = await Request.findOne({ _id: id, userId });
		if (!request) {
			return res.status(404).json({ message: 'Request not found' });
		}
		if (request.status !== 'Pending') {
			return res.status(400).json({ message: 'Only pending requests can be edited' });
		}
		if (!details || typeof details !== 'object') {
			return res.status(400).json({ message: 'No details to update' });
		}

		request.details = { ...(request.details || {}), ...details };
		await request.save();
		return res.json({ message: 'Request updated' });
	} catch (error) {
		console.error('Error updating request:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;