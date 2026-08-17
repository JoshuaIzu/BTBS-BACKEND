const Report = require("../models/report.model");
const Route = require("../models/route.model");


// ==========================================
// CREATE REPORT
// ==========================================

const createReport = async (req, res) => {
    try {
        const {
            routeId,
            reportType,
            description,
        } = req.body;

        // Check route
        const route = await Route.findById(routeId);

        if (!route) {
            return res.status(404).json({
                success: false,
                message: "Route not found",
            });
        }

        // Create report
        const report = await Report.create({
            routeId,
            userId: req.user._id,
            reportType,
            description,
            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message:
                "Report submitted successfully",

            report: {
                id: report._id,
                routeId: report.routeId,
                reportType: report.reportType,
                description: report.description,
                status: report.status,
                createdAt: report.createdAt,
            },
        });

    } catch (error) {
        console.error(
            "🔥 CREATE REPORT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Error submitting report",
            error: error.message,
        });
    }
};


// ==========================================
// GET REPORTS FOR A ROUTE
// ==========================================

const getRouteReports = async (req, res) => {
    try {
        const { routeId } = req.params;

        const reports = await Report.find({
            routeId,
        })
            .populate(
                "userId",
                "fullName email"
            )
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            count: reports.length,
            reports,
        });

    } catch (error) {
        console.error(
            "🔥 GET REPORTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Error fetching reports",
            error: error.message,
        });
    }
};


// ==========================================
// UPDATE REPORT STATUS
// ==========================================

const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;

        const {
            status,
        } = req.body;

        const report =
            await Report.findById(reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        report.status = status;

        report.reviewedBy =
            req.user._id;

        report.reviewedAt =
            new Date();

        await report.save();

        return res.status(200).json({
            success: true,
            message:
                "Report status updated",

            report,
        });

    } catch (error) {
        console.error(
            "🔥 UPDATE REPORT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Error updating report",
            error: error.message,
        });
    }
};


module.exports = {
    createReport,
    getRouteReports,
    updateReportStatus,
};