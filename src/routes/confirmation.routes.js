const express = require('express');
const router = express.Router();
const confirmationController = require('../controllers/confirmation.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const ConfirmationValidator = require('../validators/confirmation.validation');


// Public routes

router.get("/routes/:routeId", confirmationController.getRouteConfirmations);


// Logged-in user routes


router.post("/", protect, ConfirmationValidator.createConfirmationValidation, validate, confirmationController.createConfirmation);
router.patch("/:confirmationId", protect, confirmationController.updateConfirmation);
router.delete("/:confirmationId", protect, authorize("admin"), confirmationController.deleteConfirmation);

module.exports = router;


