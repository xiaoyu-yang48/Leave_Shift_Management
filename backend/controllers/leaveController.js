const Leave = require('../models/Leave');
const mongoose = require('mongoose');

// Get employee's leave requests
const getMyLeaveRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const leaves = await Leave.find({ userId })
            .sort({ requestDate: -1 })
            .select('_id startDate endDate type reason status adminNotes requestDate')
            .lean();

        const formattedLeaves = leaves.map(leave => ({
            id: leave._id,
            startDate: leave.startDate,
            endDate: leave.endDate,
            type: leave.type,
            reason: leave.reason,
            status: leave.status,
            adminNotes: leave.adminNotes,
            requestDate: leave.requestDate
        }));

        res.json(formattedLeaves);
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new leave request
const createLeaveRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, type, reason } = req.body;

        // Validate required fields
        if (!startDate || !endDate || !type || !reason) {
            return res.status(400).json({ 
                message: 'Start date, end date, type, and reason are required' 
            });
        }

        // Validate date format and logic
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        if (end < start) {
            return res.status(400).json({ 
                message: 'End date cannot be before start date' 
            });
        }

        // Check for overlapping leave requests
        const overlappingLeave = await Leave.findOne({
            userId,
            status: { $in: ['Pending', 'Approved'] },
            $or: [
                { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
            ]
        });

        if (overlappingLeave) {
            return res.status(400).json({ 
                message: 'You already have a leave request for this period' 
            });
        }

        const leave = await Leave.create({
            userId,
            startDate,
            endDate,
            type,
            reason
        });

        res.status(201).json({
            id: leave._id,
            startDate: leave.startDate,
            endDate: leave.endDate,
            type: leave.type,
            reason: leave.reason,
            status: leave.status,
            requestDate: leave.requestDate
        });
    } catch (error) {
        console.error('Error creating leave request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cancel leave request (only if pending)
const cancelLeaveRequest = async (req, res) => {
    try {
        const { leaveId } = req.params;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(leaveId)) {
            return res.status(400).json({ message: 'Invalid leave ID' });
        }

        const leave = await Leave.findOne({ _id: leaveId, userId });

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ 
                message: 'Can only cancel pending leave requests' 
            });
        }

        leave.status = 'Cancelled';
        await leave.save();

        res.json({ message: 'Leave request cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling leave request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMyLeaveRequests,
    createLeaveRequest,
    cancelLeaveRequest
};