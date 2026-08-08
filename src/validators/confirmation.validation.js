const { body } = require('express-validator');

const createConfirmationValidation = [
    body('confirmedFare')
        .isNumeric()
        .withMessage('Confirmed fare must be a number')
        .custom(value => value > 0)
        .withMessage('Confirmed fare must be greater than zero')
];

module.exports = {
    createConfirmationValidation
};