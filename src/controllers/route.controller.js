const Route = require("../models/route.model");

// ==========================================
// CREATE ROUTE
// ==========================================

const createRoute = async (req, res) => {
    try {
        console.log("🔥 CREATE ROUTE HIT");
        console.log("🔥 REQUEST BODY:", req.body);
        const {
            origin,
            destination,
            vehicleType,
            boardingPoint,
            transferPoint,
            dropOffPoint,
            fareLow,
            fareHigh,
            averageFare,
        } = req.body;

        console.log("🔥 ORIGIN RECEIVED:", origin);
        console.log("🔥 DESTINATION RECEIVED:", destination);

        const calculatedAverageFare =
            averageFare !== undefined
                ? averageFare
                : (Number(fareLow) + Number(fareHigh)) / 2;

        const routeData = {
            origin: {
                placeId: origin.placeId,
                name: origin.name,
            },

            destination: {
                placeId: destination.placeId,
                name: destination.name,
            },

            vehicleType: vehicleType.toLowerCase(),

            boardingPoint: {
                placeId: boardingPoint?.placeId,
                name: boardingPoint.name,
            },

            transferPoint: transferPoint
                ? {
                    placeId: transferPoint.placeId,
                    name: transferPoint.name,
                }
                : undefined,

            dropOffPoint: {
                placeId: dropOffPoint?.placeId,
                name: dropOffPoint.name,
            },

            fareLow: Number(fareLow),
            fareHigh: Number(fareHigh),
            averageFare: calculatedAverageFare,

            totalConfirmations: 0,
            confidenceScore: 0,
            confidenceLevel: "Unconfirmed",

            createdBy: req.user._id,
        };

        console.log("🔥 FINAL ROUTE DATA:");
        console.log(JSON.stringify(routeData, null, 2));

        const newRoute = await Route.create(routeData);

        console.log("🔥 ROUTE CREATED:", newRoute);

        return res.status(201).json({
            success: true,
            message: "Route created successfully",
            route: newRoute,
        });
    } catch (error) {
        console.error("🔥 CREATE ROUTE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Error creating route",
            error: error.message,
        });
    }
};
// ==========================================
// SEARCH ROUTES
// ==========================================

const searchRoutes = async (req, res) => {
    try {
        const {
            originPlaceId,
            destinationPlaceId,
            vehicleType,
        } = req.query;

        console.log("🔎 ROUTE SEARCH");
        console.log("Origin:", originPlaceId);
        console.log("Destination:", destinationPlaceId);
        console.log("Vehicle:", vehicleType);

        // =========================
        // VALIDATION
        // =========================

        if (!originPlaceId) {
            return res.status(400).json({
                success: false,
                message: "Origin is required",
            });
        }

        if (!destinationPlaceId) {
            return res.status(400).json({
                success: false,
                message: "Destination is required",
            });
        }

        // =========================
        // BUILD FILTER
        // =========================

        const filter = {
            "origin.placeId": originPlaceId,
            "destination.placeId": destinationPlaceId,
        };

        // Vehicle type is optional
        if (vehicleType) {
            filter.vehicleType = vehicleType.toLowerCase();
        }

        // =========================
        // SEARCH DATABASE
        // =========================

        const routes = await Route.find(filter)
            .sort({
                confidenceScore: -1,
                lastConfirmedAt: -1,
            })
            .lean();

        // =========================
        // NO ROUTES FOUND
        // =========================

        if (routes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No routes found for this journey",
                routes: [],
            });
        }

        // =========================
        // RESPONSE
        // =========================

        return res.status(200).json({
            success: true,
            count: routes.length,
            routes: routes.map((route) => ({
                id: route._id,

                origin: route.origin,

                destination: route.destination,

                vehicleType: route.vehicleType,

                boardingPoint: route.boardingPoint,

                transferPoint: route.transferPoint || null,

                dropOffPoint: route.dropOffPoint,

                fare: {
                    low: route.fareLow,
                    high: route.fareHigh,
                    average: route.averageFare,
                },

                confidence: {
                    score: route.confidenceScore,
                    level: route.confidenceLevel,
                },

                totalConfirmations: route.totalConfirmations,

                lastConfirmedAt: route.lastConfirmedAt,

                createdAt: route.createdAt,

                updatedAt: route.updatedAt,
            })),
        });
    } catch (error) {
        console.error("🔥 SEARCH ROUTES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Error searching routes",
            error: error.message,
        });
    }
};

// ==========================================
// GET ROUTE BY ID
// ==========================================

const getRoutesById = async (req, res) => {
    try {
        const route = await Route.findById(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Route found",
            route,
        });
    } catch (error) {
        console.error("Get route error:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching route",
            error: error.message,
        });
    }
};

// ==========================================
// GET ALL ROUTES
// ==========================================

const getAllRoutes = async (req, res) => {
    try {
        const routes = await Route.find();

        return res.status(200).json({
            success: true,
            count: routes.length,
            routes,
        });
    } catch (error) {
        console.error("Get all routes error:", error);

        return res.status(500).json({
            success: false,
            message: "Error fetching routes",
            error: error.message,
        });
    }
};

// ==========================================
// UPDATE ROUTE
// ==========================================

const updateRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Route updated successfully",
            route,
        });
    } catch (error) {
        console.error("Update route error:", error);

        return res.status(500).json({
            success: false,
            message: "Error updating route",
            error: error.message,
        });
    }
};

// ==========================================
// DELETE ROUTE
// ==========================================

const deleteRoute = async (req, res) => {
    try {
        const route = await Route.findByIdAndDelete(req.params.id);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Route deleted successfully",
        });
    } catch (error) {
        console.error("Delete route error:", error);

        return res.status(500).json({
            success: false,
            message: "Error deleting route",
            error: error.message,
        });
    }
};

module.exports = {
    createRoute,
    searchRoutes,
    getRoutesById,
    getAllRoutes,
    updateRoute,
    deleteRoute,
};