const { body } = require("express-validator");

const createSafetyPointValidation = [
    body("name")
        .notEmpty()
        .withMessage("Name is required")
        .isString()
        .withMessage("Name must be a string"),

    body("category")
        .notEmpty()
        .withMessage("Category is required")
        .isString()
        .withMessage("Category must be a string")
        .isIn(["police station", "hospital", "fire station", "other"])
        .withMessage("Invalid category"),

    body("location")
        .notEmpty()
        .withMessage("Location is required")
        .isObject()
        .withMessage("Location must be an object"),

    body("location.latitude")
        .notEmpty()
        .withMessage("Latitude is required")
        .isFloat()
        .withMessage("Latitude must be a number"),

    body("location.longitude")
        .notEmpty()
        .withMessage("Longitude is required")
        .isFloat()
        .withMessage("Longitude must be a number"),

    body("address")
        .optional()
        .isString()
        .withMessage("Address must be a string"),

    body("contact")
        .optional()
        .isString()
        .withMessage("Contact must be a string"),
];

module.exports = {
    createSafetyPointValidation,
};