const Availability = require('../models/Availability');
const mongoose = require('mongoose');

// Get employee's availability for a specific month/year
const getMyAvailability = async (req, res) => {
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

        const availability = await Availability.find(query)
            .sort({ date: 1 })
            .select('_id date available timeSlots notes')
            .lean();

        const formattedAvailability = availability.map(item => ({
            id: item._id,
            date: item.date,
            available: item.available,
            timeSlots: item.timeSlots || [],
            notes: item.notes
        }));

        res.json(formattedAvailability);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update or create availability for specific dates
const updateAvailability = async (req, res) => {
    try {
        const userId = req.user.id;
        const { availabilityData } = req.body; // Array of availability objects

        if (!Array.isArray(availabilityData)) {
            return res.status(400).json({ 
                message: 'Availability data must be an array' 
            });
        }

        const results = [];
        const errors = [];

        for (const item of availabilityData) {
            try {
                const { date, available, timeSlots, notes } = item;

                if (!date) {
                    errors.push({ date, error: 'Date is required' });
                    continue;
                }

                // Validate date format
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                    errors.push({ date, error: 'Invalid date format (YYYY-MM-DD)' });
                    continue;
                }

                // Update or create availability record
                const updatedAvailability = await Availability.findOneAndUpdate(
                    { userId, date },
                    {
                        userId,
                        date,
                        available: available !== undefined ? available : true,
                        timeSlots: timeSlots || [],
                        notes: notes || ''
                    },
                    {
                        new: true,
                        upsert: true,
                        runValidators: true
                    }
                );

                results.push({
                    id: updatedAvailability._id,
                    date: updatedAvailability.date,
                    available: updatedAvailability.available,
                    timeSlots: updatedAvailability.timeSlots,
                    notes: updatedAvailability.notes
                });
            } catch (error) {
                errors.push({ date: item.date, error: error.message });
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Some availability updates failed',
                results,
                errors
            });
        }

        res.json({
            message: 'Availability updated successfully',
            results
        });
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get availability for a specific date
const getAvailabilityByDate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Invalid date format (YYYY-MM-DD)' });
        }

        const availability = await Availability.findOne({ userId, date }).lean();

        if (!availability) {
            // Return default availability if not found
            return res.json({
                date,
                available: true,
                timeSlots: [],
                notes: ''
            });
        }

        res.json({
            id: availability._id,
            date: availability.date,
            available: availability.available,
            timeSlots: availability.timeSlots,
            notes: availability.notes
        });
    } catch (error) {
        console.error('Error fetching availability by date:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete availability record (reset to default)
const deleteAvailability = async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Invalid date format (YYYY-MM-DD)' });
        }

        await Availability.findOneAndDelete({ userId, date });

        res.json({ message: 'Availability reset to default successfully' });
    } catch (error) {
        console.error('Error deleting availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMyAvailability,
    updateAvailability,
    getAvailabilityByDate,
    deleteAvailability
};