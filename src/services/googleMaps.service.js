const axios = require("axios");

const GOOGLE_MAPS_API_KEY =
    process.env.GOOGLE_MAPS_API_KEY;


// ==========================================
// GOOGLE PLACES TEXT SEARCH
// ==========================================

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

                    "X-Goog-Api-Key":
                        GOOGLE_MAPS_API_KEY,

                    "X-Goog-FieldMask":
                        "places.id," +
                        "places.displayName," +
                        "places.formattedAddress," +
                        "places.location," +
                        "places.types",
                },
            }
        );

        return response.data.places || [];

    } catch (error) {

        console.error(
            "Google Places API error:",
            error.response?.data ||
            error.message
        );

        throw new Error(
            "Failed to search Google Places"
        );
    }
};


// ==========================================
// CALCULATE DISTANCE
// ==========================================

const calculateDistance = (
    lat1,
    lng1,
    lat2,
    lng2
) => {

    const R = 6371;

    const dLat =
        ((lat2 - lat1) * Math.PI) / 180;

    const dLng =
        ((lng2 - lng1) * Math.PI) / 180;


    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(
            (lat1 * Math.PI) / 180
        ) *

        Math.cos(
            (lat2 * Math.PI) / 180
        ) *

        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;
};


// ==========================================
// GOOGLE NEARBY PLACES
// ==========================================

const searchNearbyPlaces = async (
    lat,
    lng,
    type
) => {

    try {

        // ==================================
        // VALID PLACE TYPES
        // ==================================

        const allowedTypes = [
            "hospital",
            "police",
            "market"
        ];


        if (!allowedTypes.includes(type)) {

            throw new Error(
                "Invalid place type. Use hospital, police, or market."
            );
        }


        // ==================================
        // GOOGLE PLACE TYPE
        // ==================================

        let includedType;


        if (type === "hospital") {

            includedType = "hospital";

        } else if (type === "police") {

            includedType = "police";

        } else if (type === "market") {

            includedType = "market";
        }


        // ==================================
        // GOOGLE NEARBY SEARCH
        // ==================================

        const response = await axios.post(

            "https://places.googleapis.com/v1/places:searchNearby",

            {

                includedTypes: [
                    includedType
                ],

                maxResultCount: 20,

                locationRestriction: {

                    circle: {

                        center: {

                            latitude:
                                Number(lat),

                            longitude:
                                Number(lng)
                        },

                        radius: 5000
                    }
                },

                languageCode: "en"
            },

            {

                headers: {

                    "Content-Type":
                        "application/json",

                    "X-Goog-Api-Key":
                        GOOGLE_MAPS_API_KEY,

                    "X-Goog-FieldMask":
                        "places.id," +
                        "places.displayName," +
                        "places.formattedAddress," +
                        "places.location," +
                        "places.types," +
                        "places.rating," +
                        "places.userRatingCount," +
                        "places.currentOpeningHours"
                }
            }
        );


        // ==================================
        // GET PLACES
        // ==================================

        const places =
            response.data.places || [];


        // ==================================
        // FORMAT + CALCULATE DISTANCE
        // ==================================

        const formattedPlaces =
            places.map((place) => {

                const placeLat =
                    place.location?.latitude;

                const placeLng =
                    place.location?.longitude;


                // Skip places without coordinates
                if (
                    placeLat === undefined ||
                    placeLng === undefined
                ) {
                    return null;
                }


                const distance =
                    calculateDistance(
                        Number(lat),
                        Number(lng),
                        placeLat,
                        placeLng
                    );


                return {

                    placeId:
                        place.id,

                    name:
                        place.displayName?.text ||
                        "",

                    address:
                        place.formattedAddress ||
                        "",

                    location: {

                        lat:
                            placeLat,

                        lng:
                            placeLng
                    },

                    distance:
                        Number(
                            distance.toFixed(2)
                        ),

                    distanceUnit:
                        "km",

                    rating:
                        place.rating || null,

                    userRatingsTotal:
                        place.userRatingCount ||
                        0,

                    openNow:
                        place.currentOpeningHours
                            ?.openNow ?? null,

                    types:
                        place.types || []
                };
            });


        // ==================================
        // REMOVE INVALID PLACES
        // ==================================

        const validPlaces =
            formattedPlaces.filter(
                (place) => place !== null
            );


        // ==================================
        // SORT CLOSEST → FARTHEST
        // ==================================

        validPlaces.sort(
            (a, b) =>
                a.distance - b.distance
        );


        // ==================================
        // RETURN RESULTS
        // ==================================

        return validPlaces;


    } catch (error) {

        console.error(
            "Google Nearby Places API error:",
            error.response?.data ||
            error.message
        );


        throw new Error(
            "Failed to search nearby places"
        );
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    searchGooglePlaces,

    searchNearbyPlaces
};