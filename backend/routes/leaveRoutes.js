const express = require('express');
const { 
    getMyLeaveRequests, 
    createLeaveRequest, 
    cancelLeaveRequest 
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get employee's leave requests
router.get('/me', protect, getMyLeaveRequests);

// Create new leave request
router.post('/', protect, createLeaveRequest);

// Cancel leave request
router.put('/:leaveId/cancel', protect, cancelLeaveRequest);

module.exports = router;