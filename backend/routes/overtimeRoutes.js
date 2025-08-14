const express = require('express');
const { 
    getMyOvertimeRequests, 
    createOvertimeRequest, 
    cancelOvertimeRequest 
} = require('../controllers/overtimeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get employee's overtime requests
router.get('/me', protect, getMyOvertimeRequests);

// Create new overtime request
router.post('/', protect, createOvertimeRequest);

// Cancel overtime request
router.put('/:overtimeId/cancel', protect, cancelOvertimeRequest);

module.exports = router;