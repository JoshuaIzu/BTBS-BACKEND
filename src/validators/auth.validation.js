const { body } = require('express-validator');

const registerValidation = [
    body('fullName')
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 3 })
        .withMessage('Full name must be at least 3 characters'),

    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    body('role')
        .isIn(['commuter', 'business', 'admin'])
        .withMessage('Invalid role')
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Valid email is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const verifyOtpValidation = [
    body('email')
        .isEmail()
        .withMessage('Valid email is required'),

    body('otp')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits')
];

module.exports = {
    registerValidation,
    loginValidation,
    verifyOtpValidation
};