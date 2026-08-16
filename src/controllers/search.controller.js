const {
    searchGooglePlaces,
} = require("../services/googleMaps.service");

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

module.exports = {
    searchLocations,
};