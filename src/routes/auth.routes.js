const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
//const { registerValidation, loginValidation, verifyOtpValidation} = require('../validations/auth.validation');
const validate = require("../middleware/validation.middleware");
const authValidator = require("../validators/auth.validation");

router.post(
  "/register-commuter",
  authValidator.commuterRegisterValidation,
  validate,
  authController.registerCommuter,
);
router.post(
  "/register-business",
  authValidator.businessRegisterValidation,
  validate,
  authController.registerBusiness,
);
router.post(
  "/login",
  authValidator.loginValidation,
  validate,
  authController.loginUser,
);
router.post(
  "/verify-otp",
  authValidator.verifyOtpValidation,
  validate,
  authController.verifyOtp,
);

router.post(
  "/forgot-password",
  validate,
  authValidator.forgotPasswordValidation,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validate,
  authValidator.resetPasswordValidation,
  authController.resetPassword
);
router.post("/resend-otp", authController.resendOtp);

router.post(
  "/verify-reset-otp",
  authController.verifyResetOtp
);

router.get("/profile", protect, authController.profile);

module.exports = router;
