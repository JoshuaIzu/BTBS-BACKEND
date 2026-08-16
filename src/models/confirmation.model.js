const mongoose = require("mongoose");

const confirmationSchema = new mongoose.Schema(
    {
        routeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Route",
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        confirmedFare: {
            type: Number,
            required: true,
            min: 0,
        },

        confirmedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        fareFairness: {
            type: Number,
            min: 1,
            max: 5,
        },

        everOvercharged: {
            type: Boolean,
            default: false,
        },

        easeFindingTransport: {
            type: Number,
            min: 1,
            max: 5,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        reportSource: {
            type: String,
            enum: ["user", "moderator", "admin"],
            default: "user",
        },

        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Confirmation", confirmationSchema);