const express = require("express");
const router = express.Router();
const SafetyPointController = require("../controllers/safetyPoint.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/auth.middleware");

// Public routes
router.get("/", SafetyPointController.getSafetyPoints);
router.get("/category/:category", SafetyPointController.getByCategory);


// Admin routes
router.post("/", protect, authorize("admin"), SafetyPointController.createSafetyPoint);

module.exports = router;
