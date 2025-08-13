const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { listUsers, listAllShifts, createShift, deleteShift } = require('../controllers/adminController');

const router = express.Router();

router.use(protect, requireRole(['admin']));

router.get('/users', listUsers);
router.get('/shifts', listAllShifts);
router.post('/shifts', createShift);
router.delete('/shifts/:id', deleteShift);

module.exports = router;