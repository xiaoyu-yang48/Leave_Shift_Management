const mongoose = require('mongoose');
const User = require('../models/User');
const Shift = require('../models/Shift');

const listUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().populate('employee', 'name email').sort({ date: -1 });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createShift = async (req, res) => {
  try {
    const { employeeId, date, shiftType, location, notes } = req.body;
    if (!mongoose.isValidObjectId(employeeId)) return res.status(400).json({ message: 'Invalid employeeId' });
    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const shift = await Shift.create({ employee: employee._id, date: new Date(date), shiftType, location, notes });
    const populated = await Shift.findById(shift._id).populate('employee', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteShift = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid shift id' });
    const shift = await Shift.findById(id);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });
    await shift.deleteOne();
    res.json({ message: 'Shift deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { listUsers, listAllShifts, createShift, deleteShift };