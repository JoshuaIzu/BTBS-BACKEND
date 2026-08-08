const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
//const { registerValidation, loginValidation, verifyOtpValidation} = require('../validations/auth.validation');
const validate  = require('../middleware/validation.middleware');
const authValidator = require('../validators/auth.validation')



router.post('/register', authValidator.registerValidation, validate, authController.registerUser);
router.post('/login', authValidator.loginValidation, validate, authController.loginUser);
router.post('/verify-otp', authValidator.verifyOtpValidation, validate, authController.verifyOtp);
router.post('/resend-otp', authController.resendOtp)


router.get('/profile', protect, authController.profile);



module.exports = router; 