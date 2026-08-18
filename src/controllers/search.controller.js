const { searchGooglePlaces, searchNearbyPlaces } = require("../services/googleMaps.service");

const searchLocations = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters",
            });
        }

        const places = await searchGooglePlaces(q.trim());

        return res.status(200).json({
            success: true,
            count: places.length,
            places,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Error searching locations",
        });
    }
};

const searchNearby = async (req, res) => {
    try {
        const { lat, lng, type, radius } = req.query;

        // Validate required parameters
        if (!lat) {
            return res.status(400).json({
                success: false,
                message: "Latitude is required"
            });
        }

        if (!lng) {
            return res.status(400).json({
                success: false,
                message: "Longitude is required"
            });
        }

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Place type is required"
            });
        }

        const latitude = Number(lat);
        const longitude = Number(lng);
        const requestedRadius = Number(radius);
        const searchRadius = Number.isFinite(requestedRadius) ? requestedRadius : 5000;

        // Validate coordinates
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            return res.status(400).json({
                success: false,
                message: "Latitude and longitude must be numbers"
            });
        }

        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude"
            });
        }

        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({
                success: false,
                message: "Invalid longitude"
            });
        }

        // Validate radius
        if (searchRadius < 1 || searchRadius > 50000) {
            return res.status(400).json({
                success: false,
                message: "Radius must be between 1 and 50000 metres"
            });
        }

        // Search nearby places
        const places = await searchNearbyPlaces(
            latitude,
            longitude,
            type,
            searchRadius
        );

        return res.status(200).json({
            success: true,
            type,
            count: places.length,
            places
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Error searching nearby places"
        });
    }
};

module.exports = {
    searchLocations,
    searchNearby,
};