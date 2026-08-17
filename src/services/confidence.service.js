const Confirmation = require("../models/confirmation.model");


// ==========================================
// CALCULATE MEDIAN
// ==========================================

const calculateMedian = (numbers) => {

    if (!numbers.length) {
        return 0;
    }

    const sorted = [...numbers].sort(
        (a, b) => a - b
    );

    const middle =
        Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {

        return (
            (sorted[middle - 1] +
                sorted[middle]) /
            2
        );
    }

    return sorted[middle];
};


// ==========================================
// CALCULATE CONFIDENCE SCORE
// ==========================================

const calculateConfidenceScore = async (
    routeId,
    referenceTime = new Date()
) => {

    // ======================================
    // 7-DAY WINDOW
    // ======================================

    const sevenDaysAgo = new Date(
        referenceTime.getTime() -
        168 * 60 * 60 * 1000
    );


    // ======================================
    // GET REPORTS IN WINDOW
    // ======================================

    const reports =
        await Confirmation.find({
            routeId,

            confirmedAt: {
                $gte: sevenDaysAgo,
                $lte: referenceTime,
            },
        }).lean();


    // ======================================
    // NO REPORTS
    // ======================================

    if (reports.length === 0) {

        return {
            score: 0,

            level: "Unconfirmed",

            components: {
                reportStrength: 0,
                fareAgreement: 0,
                dataFreshness: 0,
                fareFairness: 0,
                overchargeEvidence: 0,
                easeFindingTransport: 0,
            },

            reportCount: 0,
        };
    }


    // ======================================
    // 1. REPORT STRENGTH — 20%
    //
    // report_count ÷ 20
    // capped at 100%
    // ======================================

    const reportCount =
        reports.length;

    const reportStrength =
        Math.min(
            (reportCount / 20) * 100,
            100
        );


    // ======================================
    // 2. FARE AGREEMENT — 30%
    //
    // Median fare is reference.
    // Count reports within ±10%.
    // ======================================

    const fares =
        reports.map(
            report => report.confirmedFare
        );

    const medianFare =
        calculateMedian(fares);


    const lowerFare =
        medianFare * 0.90;

    const upperFare =
        medianFare * 1.10;


    const agreeingReports =
        reports.filter(
            report =>
                report.confirmedFare >=
                lowerFare &&
                report.confirmedFare <=
                upperFare
        ).length;


    const fareAgreement =
        (agreeingReports /
            reportCount) *
        100;


    // ======================================
    // 3. DATA FRESHNESS — 15%
    //
    // 100 - (hours_old / 168 × 100)
    // floored at 0
    // ======================================

    const mostRecentReport =
        reports.reduce(
            (latest, report) => {

                const reportDate =
                    new Date(
                        report.confirmedAt
                    );

                return reportDate >
                    latest
                    ? reportDate
                    : latest;

            },
            new Date(0)
        );


    const hoursOld =
        Math.max(
            0,
            (
                referenceTime -
                mostRecentReport
            ) /
            (1000 * 60 * 60)
        );


    const dataFreshness =
        Math.max(
            100 -
            (
                (hoursOld / 168) *
                100
            ),
            0
        );


    // ======================================
    // 4. FARE FAIRNESS — 15%
    //
    // (average - 1) / 4 × 100
    // ======================================

    const fairnessReports =
        reports.filter(
            report =>
                typeof report.fareFairness ===
                "number"
        );


    let fareFairness = 0;


    if (fairnessReports.length > 0) {

        const averageFairness =
            fairnessReports.reduce(
                (sum, report) =>
                    sum +
                    report.fareFairness,
                0
            ) /
            fairnessReports.length;


        fareFairness =
            (
                (averageFairness - 1) /
                4
            ) *
            100;
    }


    // ======================================
    // 5. OVERCHARGE EVIDENCE — 10%
    //
    // 100% - percentage of Yes
    // ======================================

    const overchargeReports =
        reports.filter(
            report =>
                report.overcharged === "Yes" ||
                report.overcharged === "No"
        );


    let overchargeEvidence = 0;


    if (overchargeReports.length > 0) {

        const yesReports =
            overchargeReports.filter(
                report =>
                    report.overcharged ===
                    "Yes"
            ).length;


        const overchargePercentage =
            (
                yesReports /
                overchargeReports.length
            ) *
            100;


        overchargeEvidence =
            100 -
            overchargePercentage;
    }


    // ======================================
    // 6. EASE FINDING TRANSPORT — 10%
    //
    // (average - 1) / 4 × 100
    // ======================================

    const easeReports =
        reports.filter(
            report =>
                typeof report.easeFindingTransport ===
                "number"
        );


    let easeFindingTransport = 0;


    if (easeReports.length > 0) {

        const averageEase =
            easeReports.reduce(
                (sum, report) =>
                    sum +
                    report.easeFindingTransport,
                0
            ) /
            easeReports.length;


        easeFindingTransport =
            (
                (averageEase - 1) /
                4
            ) *
            100;
    }


    // ======================================
    // FINAL CONFIDENCE SCORE
    // ======================================

    const score =
        (
            reportStrength * 0.20
        ) +

        (
            fareAgreement * 0.30
        ) +

        (
            dataFreshness * 0.15
        ) +

        (
            fareFairness * 0.15
        ) +

        (
            overchargeEvidence * 0.10
        ) +

        (
            easeFindingTransport * 0.10
        );


    const finalScore =
        Math.round(score);


    // ======================================
    // CONFIDENCE LEVEL
    // ======================================

    let level;

    if (finalScore >= 70) {

        level = "High";

    } else if (finalScore >= 40) {

        level = "Medium";

    } else {

        level = "Unconfirmed";
    }


    // ======================================
    // RETURN EVERYTHING
    // ======================================

    return {

        score: finalScore,

        level,

        components: {

            reportStrength:
                Math.round(
                    reportStrength
                ),

            fareAgreement:
                Math.round(
                    fareAgreement
                ),

            dataFreshness:
                Math.round(
                    dataFreshness
                ),

            fareFairness:
                Math.round(
                    fareFairness
                ),

            overchargeEvidence:
                Math.round(
                    overchargeEvidence
                ),

            easeFindingTransport:
                Math.round(
                    easeFindingTransport
                ),
        },

        reportCount,

        medianFare,

        mostRecentReport,
    };
};


module.exports = {
    calculateConfidenceScore,
};