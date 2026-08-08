const mongoose = require('mongoose');

const safetyPointSchema = new mongoose.Schema({ 
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        lowercase: true,
        enum: ['police station', 'hospital', 'fire station', 'other'],
        
    },
    location: {
        Latitude:Number,
        Longitude:Number,
    },

    address: {
        type: String,
    },
    verificationNote: {
        type: String,
        default: 'Verified by BTBS Team',
    },
});

module.exports = mongoose.model('SafetyPoint', safetyPointSchema);