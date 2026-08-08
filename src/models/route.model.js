const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    origin: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    vehicleType: {
        type: String,
        required: true,
        lowercase: true,
        enum: ['bus', 'keke', 'taxi', 'train'],
    },
    fareLow: {
        type: Number,
        required: true,
        min: 0,
    },
    fareHigh: {
        type: Number,
        required: true,
        min: 0,
    },
    averageFare: {
        type: Number,
        min: 0,
    },
    confidenceScore: {
        type: Number,
    },
    confidenceLevel: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Low',
    },
    lastConfirmedAt: {
        type: Date,
    }, 
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

});
routeSchema.index({
    destination: 1
});

module.exports = mongoose.model('Route', routeSchema);