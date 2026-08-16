const Confirmation = require('../models/confirmation.model');
const Route = require('../models/route.model')
const { calculateConfidence } = require("../services/confidence.service");

const createConfirmation = async (req, res) => {
    try {
        const {
            routeId,
            confirmedFare,
            fareFairness,
            everOvercharged,
            easeFindingTransport,
            notes,
        } = req.body;

        // =========================
        // VALIDATION
        // =========================

        if (!routeId) {
            return res.status(400).json({
                success: false,
                message: "Route ID is required",
            });
        }

        if (
            confirmedFare === undefined ||
            confirmedFare === null
        ) {
            return res.status(400).json({
                success: false,
                message: "Confirmed fare is required",
            });
        }

        if (Number(confirmedFare) < 0) {
            return res.status(400).json({
                success: false,
                message: "Confirmed fare cannot be negative",
            });
        }

        if (
            fareFairness === undefined ||
            fareFairness < 1 ||
            fareFairness > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Fare fairness must be between 1 and 5",
            });
        }

        if (typeof everOvercharged !== "boolean") {
            return res.status(400).json({
                success: false,
                message:
                    "Ever overcharged must be true or false",
            });
        }

        if (
            easeFindingTransport === undefined ||
            easeFindingTransport < 1 ||
            easeFindingTransport > 5
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Ease finding transport must be between 1 and 5",
            });
        }

        // =========================
        // FIND ROUTE
        // =========================

        const route = await Route.findById(routeId);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found",
            });
        }

        // =========================
        // COOLDOWN
        // =========================

        const cooldownMinutes = 30;

        const cooldownTime = new Date(
            Date.now() -
            cooldownMinutes * 60 * 1000
        );

        const recentConfirmation =
            await Confirmation.findOne({
                routeId,
                userId: req.user._id,
                confirmedAt: {
                    $gte: cooldownTime,
                },
            });

        if (recentConfirmation) {
            return res.status(429).json({
                success: false,
                message:
                    `You can only confirm this route once every ${cooldownMinutes} minutes`,
            });
        }

        // =========================
        // CREATE CONFIRMATION
        // =========================

        const confirmation =
            await Confirmation.create({
                routeId,
                userId: req.user._id,
                confirmedFare: Number(confirmedFare),
                confirmedAt: new Date(),

                fareFairness: Number(
                    fareFairness
                ),

                everOvercharged,

                easeFindingTransport: Number(
                    easeFindingTransport
                ),

                isVerified: false,
                reportSource: "user",
                notes,
            });

        // =========================
        // GET CONFIRMATIONS
        // =========================

        const confirmations =
            await Confirmation.find({
                routeId,
            });

        // =========================
        // UPDATE FARE DATA
        // =========================

        const fares = confirmations.map(
            (item) => item.confirmedFare
        );

        const fareLow = Math.min(...fares);

        const fareHigh = Math.max(...fares);

        const totalFare = fares.reduce(
            (sum, fare) => sum + fare,
            0
        );

        const averageFare =
            totalFare / fares.length;

        route.fareLow = fareLow;

        route.fareHigh = fareHigh;

        route.averageFare =
            Math.round(averageFare);

        route.totalConfirmations =
            confirmations.length;

        route.lastConfirmedAt =
            new Date();

        const confidence =
            await calculateConfidence(routeId);

        route.confidenceScore = 0;

        route.confidenceLevel =
            "Unconfirmed";

        await route.save();

        // =========================
        // RESPONSE
        // =========================

        return res.status(201).json({
            success: true,

            message:
                "Fare confirmation submitted successfully",

            confirmation: {
                id: confirmation._id,
                routeId: confirmation.routeId,
                userId: confirmation.userId,
                confirmedFare:
                    confirmation.confirmedFare,
                fareFairness:
                    confirmation.fareFairness,
                everOvercharged:
                    confirmation.everOvercharged,
                easeFindingTransport:
                    confirmation.easeFindingTransport,
                confirmedAt:
                    confirmation.confirmedAt,
                isVerified:
                    confirmation.isVerified,
            },

            route: {
                id: route._id,

                fare: {
                    low: route.fareLow,
                    high: route.fareHigh,
                    average:
                        route.averageFare,
                },

                confidence: {
                    score: route.confidenceScore,
                    level: route.confidenceLevel,

                    components: confidence.components,

                    independentReports:
                        confidence.independentReports,

                    totalReports:
                        confidence.totalReports,

                    medianFare:
                        confidence.medianFare,
                },

                totalConfirmations:
                    route.totalConfirmations,

                lastConfirmedAt:
                    route.lastConfirmedAt,
            },
        });
    } catch (error) {
        console.error(
            "🔥 CREATE CONFIRMATION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Error submitting fare confirmation",
            error: error.message,
        });
    }
};




const getRouteConfirmations = async (req, res) => {
    console.log("===GET ROUTE CONFIRMATIONS===");
    console.log(req.params);
    try {
        const confirmations = await Confirmation.find({ routeId: req.params.routeId }).populate('userId', 'fullName email');
        if (confirmations.length === 0) {
            return res.status(200).json({ success: true, count: 0, message: 'No confirmations found for the specified route' });
        }
        res.status(200).json({ success: true, count: confirmations.length, confirmations });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching confirmations', error });
    }
};

const updateConfirmation = async (req, res) => {
    console.log("=== UPDATE CONFIRMATION ===");
    console.log(req.params);
    console.log(req.originalUrl);
    try {
        const { confirmedFare, verificationStatus } = req.body;

        console.log('Params:', req.params);

        const confirmation = await Confirmation.findById(req.params.confirmationId);
        console.log('Found:', confirmation);
        if (!confirmation) {
            return res.status(404).json({ message: 'Confirmation not found' });
        }
        if (confirmation.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to update this confirmation' });
        }
        confirmation.confirmedFare = req.body.confirmedFare || confirmation.confirmedFare;
        await confirmation.save();
        res.status(200).json({ message: 'Confirmation updated', confirmation });
    } catch (error) {
        res.status(500).json({ message: 'Error updating confirmation', error });
    }
};


const deleteConfirmation = async (req, res) => {
    try {
        const { confirmationId } = req.params;

        const confirmation = await Confirmation.findById(req.params.confirmationId);
        if (!confirmation) {
            return res.status(404).json({ message: 'Confirmation not found' });
        }
        if (confirmation.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this confirmation' });
        }
        await confirmation.deleteOne();

        res.status(200).json({ message: 'Confirmation deleted', confirmation });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting confirmation', error });
    }
};

module.exports = {
    createConfirmation,
    getRouteConfirmations,
    updateConfirmation,
    deleteConfirmation
};
