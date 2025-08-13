const Shift = require('../models/Shift');
const ShiftSwapRequest = require('../models/ShiftSwapRequest');
const mongoose = require('mongoose');

const getMyShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ employee: req.user._id }).sort({ date: 1 });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });
    if (!shift.employee.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableShiftsForSwap = async (req, res) => {
  try {
    const now = new Date();
    const inThirtyDays = new Date();
    inThirtyDays.setDate(inThirtyDays.getDate() + 30);
    const shifts = await Shift.find({
      employee: { $ne: req.user._id },
      date: { $gte: now, $lte: inThirtyDays },
    })
      .populate('employee', 'name email role')
      .sort({ date: 1 });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestShiftSwap = async (req, res) => {
  try {
    const { shiftId, targetShiftId } = req.body;
    if (!mongoose.isValidObjectId(shiftId) || !mongoose.isValidObjectId(targetShiftId)) {
      return res.status(400).json({ message: 'Invalid shift ids' });
    }

    const myShift = await Shift.findById(shiftId);
    const targetShift = await Shift.findById(targetShiftId);

    if (!myShift || !targetShift) return res.status(404).json({ message: 'Shift not found' });
    if (!myShift.employee.equals(req.user._id)) return res.status(403).json({ message: 'You can only swap your own shift' });
    if (targetShift.employee.equals(req.user._id)) return res.status(400).json({ message: 'Target shift cannot be yours' });

    const request = await ShiftSwapRequest.create({
      requester: req.user._id,
      target: targetShift.employee,
      requesterShift: myShift._id,
      targetShift: targetShift._id,
      status: 'Pending',
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyShifts, getAvailableShiftsForSwap, requestShiftSwap, getShiftById };