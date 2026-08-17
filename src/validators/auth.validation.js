const { body } = require("express-validator");

const commuterRegisterValidation = [
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const businessRegisterValidation = [
  body("businessName")
    .notEmpty()
    .withMessage("Business name is required")
    .isLength({ min: 2 })
    .withMessage("Business name must be at least 2 characters"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("category").notEmpty().withMessage("Category is required"),
];
const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

const verifyOtpValidation = [
  body("email").isEmail().withMessage("Valid email is required"),

  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

const forgotPasswordValidation = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),
];

const resetPasswordValidation = [
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format"),
    body("otp")
        .notEmpty()
        .withMessage("OTP is required")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits"),
    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
];

module.exports = {
  commuterRegisterValidation,
  businessRegisterValidation,
  loginValidation,
  verifyOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
