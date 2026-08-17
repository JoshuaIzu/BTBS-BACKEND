const { searchGooglePlaces, searchNearbyPlaces, } = require("../services/googleMaps.service");

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

        const results = places.map((place) => ({
            placeId: place.id,

            name: place.displayName?.text || "",

            address: place.formattedAddress || "",

            location: {
                latitude: place.location?.latitude ?? null,
                longitude: place.location?.longitude ?? null,
            },

            types: place.types || [],
        }));

        return res.status(200).json({
            success: true,
            count: results.length,
            results,
        });
    } catch (error) {
        console.error("Location search error:", error);

        return res.status(500).json({
            success: false,
            message: "Error searching locations",
            error: error.message,
        });
    }
};

const searchNearby = async (req, res) => {
    try {

        const {
            lat,
            lng,
            type
        } = req.query;


        // =========================
        // VALIDATE LATITUDE
        // =========================

        if (!lat) {
            return res.status(400).json({
                success: false,
                message: "Latitude is required"
            });
        }


        // =========================
        // VALIDATE LONGITUDE
        // =========================

        if (!lng) {
            return res.status(400).json({
                success: false,
                message: "Longitude is required"
            });
        }


        // =========================
        // VALIDATE TYPE
        // =========================

        if (!type) {
            return res.status(400).json({
                success: false,
                message: "Place type is required"
            });
        }


        const latitude = Number(lat);
        const longitude = Number(lng);


        if (
            Number.isNaN(latitude) ||
            Number.isNaN(longitude)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Latitude and longitude must be numbers"
            });
        }


        if (
            latitude < -90 ||
            latitude > 90
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid latitude"
            });
        }


        if (
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid longitude"
            });
        }


        // =========================
        // SEARCH GOOGLE PLACES
        // =========================

        const places =
            await searchNearbyPlaces(
                latitude,
                longitude,
                type
            );


        return res.status(200).json({

            success: true,

            type,

            count: places.length,

            places

        });

    } catch (error) {

        console.error(
            "Nearby search error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Error searching nearby places",

            error: error.message

        });
    }
};

module.exports = {
    searchLocations,
    searchNearby,
};