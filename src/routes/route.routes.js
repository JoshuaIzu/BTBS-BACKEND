const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth.middleware");

const routeController = require("../controllers/route.controller");

const RouteValidator = require("../validators/route.validation");
const validate = require("../middleware/validation.middleware");

// ==========================================
// PUBLIC ROUTES
// ==========================================

router.get("/search", routeController.searchRoutes);

router.get("/:id", routeController.getRoutesById);

router.get("/", routeController.getAllRoutes);

// ==========================================
// PROTECTED ROUTES
// ==========================================

router.post(
    "/create",
    (req, res, next) => {
        console.log("🔥🔥🔥 /api/routes/create ROUTE HIT 🔥🔥🔥");
        next();
    },
    protect,
    authorize("business", "admin"),
    RouteValidator.createRouteValidation,
    validate,
    routeController.createRoute
);

router.put(
    "/:id",
    protect,
    authorize("business", "admin"),
    routeController.updateRoute
);

router.delete(
    "/:id",
    protect,
    authorize("admin"),
    routeController.deleteRoute
);

module.exports = router;