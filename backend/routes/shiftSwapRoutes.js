const express = require('express');
const { 
    getMyShiftSwapRequests, 
    createShiftSwapRequest, 
    respondToShiftSwapRequest,
    cancelShiftSwapRequest 
} = require('../controllers/shiftSwapController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get employee's shift swap requests
router.get('/me', protect, getMyShiftSwapRequests);

// Create new shift swap request
router.post('/', protect, createShiftSwapRequest);

// Respond to shift swap request (accept/reject)
router.put('/:swapId/respond', protect, respondToShiftSwapRequest);

// Cancel shift swap request
router.put('/:swapId/cancel', protect, cancelShiftSwapRequest);

module.exports = router;