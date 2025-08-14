const Overtime = require('../models/Overtime');
const Schedule = require('../models/Schedule');
const mongoose = require('mongoose');

// Get employee's overtime requests
const getMyOvertimeRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const overtimes = await Overtime.find({ userId })
            .populate('scheduleId', 'date type startTime endTime')
            .sort({ requestDate: -1 })
            .select('_id date requestedHours reason status adminNotes approvedHours requestDate scheduleId')
            .lean();

        const formattedOvertimes = overtimes.map(overtime => ({
            id: overtime._id,
            date: overtime.date,
            requestedHours: overtime.requestedHours,
            approvedHours: overtime.approvedHours,
            reason: overtime.reason,
            status: overtime.status,
            adminNotes: overtime.adminNotes,
            requestDate: overtime.requestDate,
            schedule: overtime.scheduleId ? {
                id: overtime.scheduleId._id,
                type: overtime.scheduleId.type,
                startTime: overtime.scheduleId.startTime,
                endTime: overtime.scheduleId.endTime
            } : null
        }));

        res.json(formattedOvertimes);
    } catch (error) {
        console.error('Error fetching overtime requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new overtime request
const createOvertimeRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { scheduleId, requestedHours, reason } = req.body;

        // Validate required fields
        if (!scheduleId || !requestedHours || !reason) {
            return res.status(400).json({ 
                message: 'Schedule ID, requested hours, and reason are required' 
            });
        }

        // Validate scheduleId
        if (!mongoose.isValidObjectId(scheduleId)) {
            return res.status(400).json({ message: 'Invalid schedule ID' });
        }

        // Verify the schedule belongs to the user
        const schedule = await Schedule.findOne({ _id: scheduleId, userId });
        if (!schedule) {
            return res.status(404).json({ 
                message: 'Schedule not found or does not belong to you' 
            });
        }

        // Check if overtime request already exists for this schedule
        const existingOvertime = await Overtime.findOne({
            scheduleId,
            status: { $in: ['Pending', 'Approved'] }
        });

        if (existingOvertime) {
            return res.status(400).json({ 
                message: 'Overtime request already exists for this shift' 
            });
        }

        const overtime = await Overtime.create({
            userId,
            scheduleId,
            date: schedule.date,
            requestedHours: parseFloat(requestedHours),
            reason
        });

        // Populate the schedule info for response
        await overtime.populate('scheduleId', 'date type startTime endTime');

        res.status(201).json({
            id: overtime._id,
            date: overtime.date,
            requestedHours: overtime.requestedHours,
            reason: overtime.reason,
            status: overtime.status,
            requestDate: overtime.requestDate,
            schedule: {
                id: overtime.scheduleId._id,
                type: overtime.scheduleId.type,
                startTime: overtime.scheduleId.startTime,
                endTime: overtime.scheduleId.endTime
            }
        });
    } catch (error) {
        console.error('Error creating overtime request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cancel overtime request (only if pending)
const cancelOvertimeRequest = async (req, res) => {
    try {
        const { overtimeId } = req.params;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(overtimeId)) {
            return res.status(400).json({ message: 'Invalid overtime ID' });
        }

        const overtime = await Overtime.findOne({ _id: overtimeId, userId });

        if (!overtime) {
            return res.status(404).json({ message: 'Overtime request not found' });
        }

        if (overtime.status !== 'Pending') {
            return res.status(400).json({ 
                message: 'Can only cancel pending overtime requests' 
            });
        }

        overtime.status = 'Cancelled';
        await overtime.save();

        res.json({ message: 'Overtime request cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling overtime request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMyOvertimeRequests,
    createOvertimeRequest,
    cancelOvertimeRequest
};