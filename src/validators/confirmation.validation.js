const { body } = require("express-validator");

const createConfirmationValidation = [
    body("routeId")
        .notEmpty()
        .withMessage("Route ID is required"),

    body("confirmedFare")
        .isNumeric()
        .withMessage("Confirmed fare must be a number")
        .custom((value) => Number(value) >= 0)
        .withMessage("Confirmed fare cannot be negative"),

    body("fareFairness")
        .isInt({ min: 1, max: 5 })
        .withMessage("Fare fairness must be between 1 and 5"),

    body("everOvercharged")
        .isBoolean()
        .withMessage("Ever overcharged must be true or false"),

    body("easeFindingTransport")
        .isInt({ min: 1, max: 5 })
        .withMessage(
            "Ease finding transport must be between 1 and 5"
        ),

    body("notes")
        .optional()
        .isString()
        .withMessage("Notes must be text"),
];

module.exports = {
    createConfirmationValidation,
};