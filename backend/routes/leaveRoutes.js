const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Request = require('../models/Request');

const router = express.Router();

// Returns a simple annual leave balance for the current user
router.get('/balance', protect, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const ANNUAL_TOTAL = 20; // simple default allowance

		const startOfYear = new Date(new Date().getFullYear(), 0, 1);
		const endOfYear = new Date(new Date().getFullYear(), 11, 31);

		const leaveRequests = await Request.find({
			userId,
			type: 'Leave',
			status: { $in: ['Pending', 'Approved'] },
			createdAt: { $gte: startOfYear, $lte: endOfYear },
		}).lean();

		const used = leaveRequests.reduce((sum, r) => {
			const { startDate, endDate } = r.details || {};
			if (!startDate || !endDate) return sum;
			const d1 = new Date(startDate);
			const d2 = new Date(endDate);
			const days = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
			return sum + days;
		}, 0);

		const remaining = Math.max(0, ANNUAL_TOTAL - used);
		res.json({ annualTotal: ANNUAL_TOTAL, used, remaining });
	} catch (error) {
		console.error('Error fetching leave balance:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;