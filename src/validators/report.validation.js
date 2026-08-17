const { body } = require("express-validator");

const createReportValidation = [
    body("routeId")
        .notEmpty()
        .withMessage("Route ID is required"),

    body("reportType")
        .isIn([
            "incorrect_route",
            "outdated_fare",
            "inaccurate_information",
        ])
        .withMessage("Invalid report type"),

    body("description")
        .optional()
        .isString()
        .withMessage("Description must be text")
        .isLength({ max: 500 })
        .withMessage(
            "Description cannot exceed 500 characters"
        ),
];

module.exports = {
    createReportValidation,
};