const express = require('express');
const router = express.Router();
const confirmationController = require('../controllers/confirmation.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const ConfirmationValidator = require('../validators/confirmation.validation');
const { validateObjectId } = require("../middleware/objectId.middleware");

// Public routes

router.get("/routes/:routeId", validateObjectId('routeId'), confirmationController.getRouteConfirmations);


// Logged-in user routes


router.post("/:routeId", protect, validateObjectId('routeId'), ConfirmationValidator.createConfirmationValidation, validate, confirmationController.createConfirmation);
router.patch("/:confirmationId", protect, validateObjectId('confirmationId'), confirmationController.updateConfirmation);
router.delete("/:confirmationId", protect, authorize("admin"), validateObjectId('confirmationId'), confirmationController.deleteConfirmation);

module.exports = router;


