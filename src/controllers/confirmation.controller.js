const Confirmation = require('../models/confirmation.model');
const Route = require('../models/route.model');

const createConfirmation = async (req, res) => {
    try {
        const { routeId } = req.params;
        const { confirmedFare } = req.body;

        if (!confirmedFare || confirmedFare <= 0) {
            return res.status(400).json({ message: 'Invalid confirmed fare' });
        }

        // Check if the route exists
        const route = await Route.findById(routeId);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        const existingConfirmation = await Confirmation.findOne({ routeId, userId: req.user._id });
        if (existingConfirmation) {
            return res.status(400).json({ message: 'You have already confirmed the fare for this route' });
        }
        const confirmation = await Confirmation.create({
            routeId: route._id,
            userId: req.user._id,
            confirmedFare,
        });
        res.status(201).json({ message: 'Fare Confirmation submitted', confirmation });
    } catch (error) {
        res.status(500).json({ message: 'Error creating confirmation', error });
    }
};

const getRouteConfirmations = async (req, res) => {
    console.log("===GET ROUTE CONFIRMATIONS===");
    console.log( req.params);
    try {
        const confirmations = await Confirmation.find({ routeId: req.params.routeId }).populate('userId', 'fullName email');
        if (confirmations.length === 0) {
            return res.status(200).json({success: true, count: 0, message: 'No confirmations found for the specified route' });
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
        if ( confirmation.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
        if ( confirmation.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
