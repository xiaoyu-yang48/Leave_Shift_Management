const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Request = require('../models/Request');
const { route } = require('./authRoutes');

const router = express.Router();

// launch overtime request
router.post('/overtime', protect, async (req, res) => {
    try {
        const userId = String(req.user?.id);
        const { shiftId, date, hours } = req.body || {};
        if (!shiftId || !date || !hours) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const request = await Request.create({
            userId,
            type: 'overtime',
            status: 'pending',
            details: { shiftId, date, hours },
        });
        return res.status(201).json({message: 'Overtime request created', requestId: String(request._id) });
    } catch (error) {
        console.error('Error creating overtime request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// get user's requests
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

// cancel pending request
router.put('/:type/:id/cancel', protect, async (req, res) => {
    try {
        const userId = String(req.user?.id);
        const { type, id } = req.params;
        const request = await Request.findOne({ _id: id, userId, type }).lean();
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        if (request.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending requests can be canceled' });
        }
        return res.json({ message: 'Request canceled successfully' });
    } catch (error) {
        console.error('Error canceling request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;