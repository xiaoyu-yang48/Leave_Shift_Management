const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
		type: { type: String, enum: ['Leave', 'Overtime', 'Shift Swap'], required: true },
		subType: { type: String },
		status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Canceled'], default: 'Pending' },
		details: { type: Object, default: {} },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);