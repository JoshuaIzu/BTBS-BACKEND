const express = require("express");

const router = express.Router();

const reportController =
    require("../controllers/report.controller");

const {
    protect,
    authorize,
} = require("../middleware/auth.middleware");

const validate =
    require("../middleware/validation.middleware");

const {
    createReportValidation,
} = require("../validators/report.validation");


// ==========================================
// COMMUTER
// ==========================================

router.post(
    "/",
    protect,
    createReportValidation,
    validate,
    reportController.createReport
);


// ==========================================
// ADMIN
// ==========================================

router.get(
    "/route/:routeId",
    protect,
    authorize("admin"),
    reportController.getRouteReports
);


router.patch(
    "/:reportId",
    protect,
    authorize("admin"),
    reportController.updateReportStatus
);


module.exports = router;