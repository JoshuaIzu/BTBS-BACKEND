const express = require("express");

const router = express.Router();

const {
    searchLocations,
    searchNearby,
} = require("../controllers/search.controller");

router.get("/", searchLocations);
router.get("/locations/nearby", searchNearby);

module.exports = router;