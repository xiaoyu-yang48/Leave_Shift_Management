const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
	type: { type: String, required: true, enum: ['Leave', 'Overtime', 'Shift Swap'] },
	subType: { type: String },
	status: { type: String, required: true, enum: ['Pending', 'Approved', 'Rejected', 'Canceled'], default: 'Pending' },
	details: { type: mongoose.Schema.Types.Mixed, default: {} },
}, {
	timestamps: true,
});

module.exports = mongoose.model('Request', requestSchema);