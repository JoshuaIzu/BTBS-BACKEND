const express = require("express");
const router = express.Router();
const SafetyPointController = require("../controllers/safetyPoint.controller");
const SafetyPointValidator = require("../validators/safetyPoint.validation");
const validate = require("../middleware/validation.middleware");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/auth.middleware");

// Public routes
router.get("/", SafetyPointController.getSafetyPoints);
router.get("/category/:category", SafetyPointController.getByCategory);


// Admin routes
router.post("/", protect, authorize("admin"), SafetyPointController.createSafetyPoint, validate, SafetyPointController.createSafetyPoint);

module.exports = router;
