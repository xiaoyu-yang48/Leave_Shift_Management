const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Request = require('../models/Request');

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

module.exports = router;