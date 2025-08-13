const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMyShifts, getAvailableShiftsForSwap, requestShiftSwap, getShiftById } = require('../controllers/shiftsController');

const router = express.Router();

router.get('/my', protect, getMyShifts);
router.get('/available', protect, getAvailableShiftsForSwap);
router.get('/:id', protect, getShiftById);
router.post('/swap', protect, requestShiftSwap);

module.exports = router;