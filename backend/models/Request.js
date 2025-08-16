const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'
    },
    type: {
        type: String, required: true, enum: ['Leave', 'Overtime', 'Shift Swap'], required: true 
    },
    subType: {
        type: String
    },
    status: {
        type: String, default: 'Pending', enum: ['Pending', 'Received', 'Accepted', 'Rejected']
    },
    detais: {
        type: Object, required: true, default: {} },
    },
    { timestamps: true }
);
    

module.exports = mongoose.model('Request', requestSchema);