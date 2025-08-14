const express = require('express');
const { getMyRequests, cancelRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all employee's requests (leave, overtime, shift swap)
router.get('/me', protect, getMyRequests);

// Cancel any request by type and ID
router.put('/:requestType/:requestId/cancel', protect, cancelRequest);

module.exports = router;