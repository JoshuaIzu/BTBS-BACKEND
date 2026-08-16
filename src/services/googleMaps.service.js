const axios = require("axios");

const searchGooglePlaces = async (query) => {
    try {
        const response = await axios.post(
            "https://places.googleapis.com/v1/places:searchText",
            {
                textQuery: `${query}, Lagos, Nigeria`,
                languageCode: "en",
                regionCode: "NG",
                pageSize: 10,

                locationBias: {
                    rectangle: {
                        low: {
                            latitude: 6.35,
                            longitude: 3.20,
                        },
                        high: {
                            latitude: 6.75,
                            longitude: 3.70,
                        },
                    },
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,

                    "X-Goog-FieldMask":
                        "places.id,places.displayName,places.formattedAddress,places.location,places.types",
                },
            }
        );

        return response.data.places || [];
    } catch (error) {
        console.error(
            "Google Places API error:",
            error.response?.data || error.message
        );

        throw new Error("Failed to search Google Places");
    }
};

module.exports = {
    searchGooglePlaces,
};