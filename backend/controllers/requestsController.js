const ShiftSwapRequest = require('../models/ShiftSwapRequest');
const Shift = require('../models/Shift');

const getMyRequests = async (req, res) => {
  try {
    const requests = await ShiftSwapRequest.find({ requester: req.user._id })
      .populate('requesterShift')
      .populate({ path: 'targetShift', populate: { path: 'employee', select: 'name' } })
      .sort({ createdAt: -1 });

    const mapped = requests.map(r => ({
      id: r._id,
      type: 'Shift Swap',
      status: r.status,
      date: r.createdAt,
      details: {
        requesterShift: r.requesterShift,
        targetShift: r.targetShift,
      },
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const request = await ShiftSwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (!request.requester.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Only pending requests can be canceled' });

    request.status = 'Canceled';
    await request.save();
    res.json({ message: 'Request canceled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await ShiftSwapRequest.find()
      .populate('requester', 'name email')
      .populate('target', 'name email')
      .populate('requesterShift')
      .populate('targetShift')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const request = await ShiftSwapRequest.findById(req.params.id).populate('requesterShift').populate('targetShift');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Only pending requests can be approved' });

    const requesterEmployee = request.requesterShift.employee;
    const targetEmployee = request.targetShift.employee;

    request.requesterShift.employee = targetEmployee;
    request.targetShift.employee = requesterEmployee;

    await request.requesterShift.save();
    await request.targetShift.save();

    request.status = 'Approved';
    await request.save();

    res.json({ message: 'Request approved and shifts swapped' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await ShiftSwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Only pending requests can be rejected' });

    request.status = 'Rejected';
    await request.save();
    res.json({ message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyRequests, cancelRequest, getAllRequests, approveRequest, rejectRequest };