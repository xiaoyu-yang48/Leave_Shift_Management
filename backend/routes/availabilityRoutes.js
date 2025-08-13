const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMyAvailability, upsertMyAvailability } = require('../controllers/availabilityController');

const router = express.Router();

router.get('/my', protect, getMyAvailability);
router.put('/my', protect, upsertMyAvailability);

module.exports = router;