const { body } = require('express-validator');

const createRouteValidation = [
    body('origin')
        .notEmpty()
        .withMessage('Origin is required'),

    body('destination')
        .notEmpty()
        .withMessage('Destination is required'),

    body('vehicleType')
        .isIn(['bus', 'keke', 'taxi', 'train'])
        .withMessage('Invalid vehicle type'),

    body('fareLow')
        .isNumeric()
        .withMessage('fareLow must be a number'),

    body('fareHigh')
        .isNumeric()
        .withMessage('fareHigh must be a number')
];

module.exports = {
    createRouteValidation
};