const express = require('express');
const { getMySchedule, getScheduleById } = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get employee's own schedule
router.get('/me', protect, getMySchedule);

// Get specific schedule by ID
router.get('/:scheduleId', protect, getScheduleById);

module.exports = router;