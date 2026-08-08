const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const routeController = require('../controllers/route.controller');
const { authorize } = require('../middleware/auth.middleware');
const RouteValidator = require('../validators/route.validation');
const  validate  = require('../middleware/validation.middleware');

// Public routes
router.get("/search", routeController.searchRoutes);
router.get("/:id", routeController.getRoutesById);
router.get("/", routeController.getAllRoutes);

//Protected routes
router.post("/create", protect, authorize("business", "admin"), RouteValidator.createRouteValidation, validate,  routeController.createRoute);
router.put("/:id", protect, authorize("business", "admin"), routeController.updateRoute);
router.delete("/:id", protect, authorize( "admin"), routeController.deleteRoute);


module.exports = router;