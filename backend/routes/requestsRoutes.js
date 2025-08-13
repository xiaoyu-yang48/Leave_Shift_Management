const express = require('express');
const { protect, requireRole } = require('../middleware/authMiddleware');
const { getMyRequests, cancelRequest, getAllRequests, approveRequest, rejectRequest } = require('../controllers/requestsController');

const router = express.Router();

// user routes
router.get('/', protect, getMyRequests);
router.post('/:id/cancel', protect, cancelRequest);

// admin routes
router.get('/all', protect, requireRole(['admin']), getAllRequests);
router.post('/:id/approve', protect, requireRole(['admin']), approveRequest);
router.post('/:id/reject', protect, requireRole(['admin']), rejectRequest);

module.exports = router;