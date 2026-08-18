const express = require("express");

const router = express.Router();

const {
    protect,
} = require("../middleware/auth.middleware");

const {
    createTrip,
    getTrip,
    startTrip,
    endTrip,
    shareTrip,
    getPublicTrip,
    updateTripLocation,
} = require("../controllers/trip.controller");


// Create trip
router.post(
    "/",
    protect,
    createTrip
);


// Get trip
router.get(
    "/:tripId",
    protect,
    getTrip
);


// Start trip
router.patch(
    "/:tripId/start",
    protect,
    startTrip
);


// End trip
router.patch(
    "/:tripId/end",
    protect,
    endTrip
);

router.get(
    "/:tripId/share",
    protect,
    shareTrip
);

router.patch(
    "/:tripId/location",
    protect,
    updateTripLocation
);

router.get(
    "/public/:shareToken",
    getPublicTrip
);

module.exports = router;