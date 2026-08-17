const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
//const { registerValidation, loginValidation, verifyOtpValidation} = require('../validations/auth.validation');
const validate = require("../middleware/validation.middleware");
const authValidator = require("../validators/auth.validation");

router.post("/forgot-password", validate, authValidator.forgotPasswordValidation, authController.forgotPassword);
router.post("/reset-password", validate, authValidator.resetPasswordValidation, authController.resetPassword);
router.post("/verify-reset-otp", authController.verifyResetOtp);

module.exports = router;
