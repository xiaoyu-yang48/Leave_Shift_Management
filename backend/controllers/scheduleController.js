const Schedule = require('../models/Schedule');
const mongoose = require('mongoose');

// Get employee's own schedule
const getMySchedule = async (req, res) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;

        let query = { userId };
        
        // If month and year are provided, filter by them
        if (month && year) {
            const monthStr = String(month).padStart(2, '0');
            const startDate = `${year}-${monthStr}-01`;
            const endDate = `${year}-${monthStr}-31`;
            query.date = { $gte: startDate, $lte: endDate };
        }

        const schedule = await Schedule.find(query)
            .sort({ date: 1 })
            .select('_id date type')
            .lean();

        const formattedSchedule = schedule.map(shift => ({
            id: shift._id,
            date: shift.date,
            type: shift.type
        }));

        res.json(formattedSchedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get specific schedule by ID (for shift swap, overtime requests)
const getScheduleById = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const userId = req.user.id;

        if (!mongoose.isValidObjectId(scheduleId)) {
            return res.status(400).json({ message: 'Invalid schedule ID' });
        }

        const schedule = await Schedule.findOne({ 
            _id: scheduleId, 
            userId 
        }).lean();

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.json({
            id: schedule._id,
            date: schedule.date,
            type: schedule.type
        });
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMySchedule,
    getScheduleById
};