const express = require("express");

const {
    searchLocations,
    searchNearby,
} = require("../controllers/googlePlaces.controller");

const router = express.Router();

router.get("/search", searchLocations);
router.get("/nearby", searchNearby);

module.exports = router;