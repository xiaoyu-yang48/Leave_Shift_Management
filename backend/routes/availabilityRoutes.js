const express = require('express');
const { 
    getMyAvailability, 
    updateAvailability, 
    getAvailabilityByDate,
    deleteAvailability 
} = require('../controllers/availabilityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get employee's availability
router.get('/me', protect, getMyAvailability);

// Get availability for specific date
router.get('/date/:date', protect, getAvailabilityByDate);

// Update availability
router.post('/update', protect, updateAvailability);

// Delete availability (reset to default)
router.delete('/date/:date', protect, deleteAvailability);

module.exports = router;