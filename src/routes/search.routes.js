const express = require("express");

const router = express.Router();

const {
    searchLocations,
} = require("../controllers/search.controller");

router.get("/", searchLocations);

module.exports = router;