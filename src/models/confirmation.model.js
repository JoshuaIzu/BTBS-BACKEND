const mongoose = require('mongoose');

const confirmationSchema = new mongoose.Schema({
    routeId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    confirmedFare:{
        type: "Number",
        required: true,
    },
    verificationStatus:{
        type: "string",
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending',
    },
    
});

module.exports = mongoose.model('Confirmation', confirmationSchema);