const { body } = require("express-validator");

const createRouteValidation = [
    // =========================
    // ORIGIN
    // =========================
    body("origin")
        .isObject()
        .withMessage("Origin must be an object"),

    body("origin.placeId")
        .notEmpty()
        .withMessage("Origin place ID is required")
        .isString()
        .withMessage("Origin place ID must be a string"),

    body("origin.name")
        .notEmpty()
        .withMessage("Origin name is required")
        .isString()
        .withMessage("Origin name must be a string"),

    // =========================
    // DESTINATION
    // =========================
    body("destination")
        .isObject()
        .withMessage("Destination must be an object"),

    body("destination.placeId")
        .notEmpty()
        .withMessage("Destination place ID is required")
        .isString()
        .withMessage("Destination place ID must be a string"),

    body("destination.name")
        .notEmpty()
        .withMessage("Destination name is required")
        .isString()
        .withMessage("Destination name must be a string"),

    // =========================
    // VEHICLE TYPE
    // =========================
    body("vehicleType")
        .isIn(["bus", "keke", "taxi"])
        .withMessage("Invalid vehicle type"),

    // =========================
    // BOARDING POINT
    // =========================
    body("boardingPoint")
        .isObject()
        .withMessage("Boarding point must be an object"),

    body("boardingPoint.name")
        .notEmpty()
        .withMessage("Boarding point name is required")
        .isString()
        .withMessage("Boarding point name must be a string"),

    body("boardingPoint.placeId")
        .optional()
        .isString()
        .withMessage("Boarding point place ID must be a string"),

    // =========================
    // TRANSFER POINT
    // =========================
    body("transferPoint")
        .optional()
        .isObject()
        .withMessage("Transfer point must be an object"),

    body("transferPoint.placeId")
        .optional()
        .isString()
        .withMessage("Transfer point place ID must be a string"),

    body("transferPoint.name")
        .optional()
        .isString()
        .withMessage("Transfer point name must be a string"),

    // =========================
    // DROP-OFF POINT
    // =========================
    body("dropOffPoint")
        .isObject()
        .withMessage("Drop-off point must be an object"),

    body("dropOffPoint.name")
        .notEmpty()
        .withMessage("Drop-off point name is required")
        .isString()
        .withMessage("Drop-off point name must be a string"),

    body("dropOffPoint.placeId")
        .optional()
        .isString()
        .withMessage("Drop-off point place ID must be a string"),

    // =========================
    // FARES
    // =========================
    body("fareLow")
        .isNumeric()
        .withMessage("fareLow must be a number")
        .custom((value) => {
            if (Number(value) < 0) {
                throw new Error("fareLow cannot be negative");
            }
            return true;
        }),

    body("fareHigh")
        .isNumeric()
        .withMessage("fareHigh must be a number")
        .custom((value, { req }) => {
            if (Number(value) < 0) {
                throw new Error("fareHigh cannot be negative");
            }

            if (
                req.body.fareLow !== undefined &&
                Number(value) < Number(req.body.fareLow)
            ) {
                throw new Error("fareHigh cannot be lower than fareLow");
            }

            return true;
        }),

    // =========================
    // AVERAGE FARE
    // =========================
    body("averageFare")
        .optional()
        .isNumeric()
        .withMessage("averageFare must be a number")
        .custom((value) => {
            if (Number(value) < 0) {
                throw new Error("averageFare cannot be negative");
            }
            return true;
        }),
];

const updateRouteValidation = [
    body("origin")
        .optional()
        .isObject()
        .withMessage("Origin must be an object"),

    body("origin.placeId")
        .optional()
        .notEmpty()
        .withMessage("Origin place ID is required")
        .isString()
        .withMessage("Origin place ID must be a string"),

    body("origin.name")
        .optional()
        .notEmpty()
        .withMessage("Origin name is required")
        .isString()
        .withMessage("Origin name must be a string"),

    body("destination")
        .optional()
        .isObject()
        .withMessage("Destination must be an object"),

    body("destination.placeId")
        .optional()
        .notEmpty()
        .withMessage("Destination place ID is required")
        .isString()
        .withMessage("Destination place ID must be a string"),

    body("destination.name")
        .optional()
        .notEmpty()
        .withMessage("Destination name is required")
        .isString()
        .withMessage("Destination name must be a string"),

    body("vehicleType")
        .optional()
        .isIn(["bus", "keke", "taxi"])
        .withMessage("Invalid vehicle type"),

    body("boardingPoint")
        .optional()
        .isObject()
        .withMessage("Boarding point must be an object"),

    body("boardingPoint.name")
        .optional()
        .notEmpty()
        .withMessage("Boarding point name is required")
        .isString()
        .withMessage("Boarding point name must be a string"),

    body("fareLow")
        .optional()
        .isNumeric()
        .withMessage("fareLow must be a number")
        .custom((value) => {
            if (Number(value) < 0) {
                throw new Error("fareLow cannot be negative");
            }
            return true;
        }),

    body("fareHigh")
        .optional()
        .isNumeric()
        .withMessage("fareHigh must be a number")
        .custom((value, { req }) => {
            if (Number(value) < 0) {
                throw new Error("fareHigh cannot be negative");
            }
            if (req.body.fareLow !== undefined && Number(value) < Number(req.body.fareLow)) {
                throw new Error("fareHigh cannot be lower than fareLow");
            }
            return true;
        }),

    body("averageFare")
        .optional()
        .isNumeric()
        .withMessage("averageFare must be a number")
        .custom((value) => {
            if (Number(value) < 0) {
                throw new Error("averageFare cannot be negative");
            }
            return true;
        }),
];

module.exports = {
    createRouteValidation,
    updateRouteValidation,
};