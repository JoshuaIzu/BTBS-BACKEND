const Route = require('../models/route.model');


const createRoute = async (req, res) => {
    try {
        const { origin, destination, vehicleType, fareLow, fareHigh } = req.body;
        const newRoute = await Route.create({ ...req.body, createdBy: req.user._id });
        res.status(201).json({ message: 'Route created successfully', route: newRoute });
    } catch (error) {
        res.status(500).json({ message: 'Error creating route', error});
    }
};

const searchRoutes = async (req, res) => {
    try {
        const { destination } = req.query;
        if (!destination) {
            return res.status(400).json({ message: 'Destination is required' });
        }
        const routes = await Route.find({
            destination: {
                $regex: destination,
                $options: 'i'
            }
        });
        if (routes.length === 0) {
            return res.status(200).json({success: true, count: 0, message: 'No routes found for the specified destination' });
        }
        res.status(200).json({ success: true, count: routes.length, routes });
    } catch (error) {
        res.status(500).json({ message: 'Error searching routes', error });
    }
};


const getRoutesById = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.status(200).json({ message: 'Route found', route });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching route', error });
    }
};

const getAllRoutes = async (req, res) => {
    try {
        const routes = await Route.find();
        res.status(200).json({ success: true, count: routes.length, routes });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching routes', error });
    }
};

const updateRoute = async (req, res) => {
    try { 
        const route = await Route.findByIdAndUpdate(req.params.id , req.body, { new: true, runValidators: true });
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.status(200).json({ message: 'Route updated successfully', route });
    } catch (error) {
        res.status(500).json({ message: 'Error updating route', error });
    }
};

const deleteRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndDelete(req.params.id);
        if (!route) {
            return res.status(404).json({ message: 'Route not found' });
        }
        res.status(200).json({ message: 'Route deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting route', error });
    }
};

module.exports = {
    createRoute,
    searchRoutes,
    getRoutesById,
    getAllRoutes,
    updateRoute,
    deleteRoute
};

