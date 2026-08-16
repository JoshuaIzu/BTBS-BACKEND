const Confirmation = require("../models/confirmation.model");

/**
 * Calculate the median of an array of numbers
 */
const calculateMedian = (numbers) => {
    if (!numbers.length) return 0;

    const sorted = [...numbers].sort((a, b) => a - b);

    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
};


/**
 * Calculate confidence score for a route
 */
const calculateConfidence = async (routeId) => {
    try {
        const now = new Date();


        // 1. GET CONFIRMATIONS FROM LAST 48 HOURS


        const fortyEightHoursAgo = new Date(
            now.getTime() - 48 * 60 * 60 * 1000
        );

        let confirmations = await Confirmation.find({
            routeId,
            confirmedAt: {
                $gte: fortyEightHoursAgo,
            },
        }).lean();


        // ==========================================
        // 2. FALLBACK TO LAST 7 DAYS
        // ==========================================

        if (confirmations.length < 10) {
            const sevenDaysAgo = new Date(
                now.getTime() - 7 * 24 * 60 * 60 * 1000
            );

            confirmations = await Confirmation.find({
                routeId,
                confirmedAt: {
                    $gte: sevenDaysAgo,
                },
            }).lean();
        }


        // ==========================================
        // 3. NO DATA
        // ==========================================

        if (confirmations.length === 0) {
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
            };
        }


        // ==========================================
        // 4. REPORT STRENGTH
        // ==========================================

        const uniqueUsers = new Set(
            confirmations.map(
                (confirmation) =>
                    confirmation.userId.toString()
            )
        );

        const independentReports =
            uniqueUsers.size;

        const reportStrength = Math.min(
            (independentReports / 20) * 100,
            100
        );


        // ==========================================
        // 5. FARE AGREEMENT
        // ==========================================

        const fares = confirmations.map(
            (confirmation) =>
                confirmation.confirmedFare
        );

        const medianFare = calculateMedian(fares);

        const lowerLimit = medianFare * 0.90;
        const upperLimit = medianFare * 1.10;

        const agreeingReports = confirmations.filter(
            (confirmation) =>
                confirmation.confirmedFare >= lowerLimit &&
                confirmation.confirmedFare <= upperLimit
        ).length;

        const fareAgreement =
            (agreeingReports / confirmations.length) *
            100;


        // ==========================================
        // 6. DATA FRESHNESS
        // ==========================================

        const newestConfirmation = confirmations.reduce(
            (latest, confirmation) => {
                const confirmationDate =
                    new Date(confirmation.confirmedAt);

                return confirmationDate > latest
                    ? confirmationDate
                    : latest;
            },
            new Date(0)
        );

        const ageHours =
            (now - newestConfirmation) /
            (1000 * 60 * 60);

        const dataFreshness = Math.max(
            0,
            Math.min(
                100,
                ((168 - ageHours) / 168) * 100
            )
        );


        // ==========================================
        // 7. FARE FAIRNESS
        // ==========================================

        const fairnessTotal =
            confirmations.reduce(
                (sum, confirmation) =>
                    sum +
                    (confirmation.fareFairness || 0),
                0
            );

        const fareFairness =
            (
                fairnessTotal /
                confirmations.length /
                5
            ) * 100;


        // ==========================================
        // 8. OVERCHARGE EVIDENCE
        // ==========================================

        const overchargedReports =
            confirmations.filter(
                (confirmation) =>
                    confirmation.everOvercharged === true
            ).length;

        const overchargePercentage =
            (
                overchargedReports /
                confirmations.length
            ) * 100;

        const overchargeEvidence =
            100 - overchargePercentage;


        // ==========================================
        // 9. EASE FINDING TRANSPORT
        // ==========================================

        const easeTotal =
            confirmations.reduce(
                (sum, confirmation) =>
                    sum +
                    (confirmation.easeFindingTransport || 0),
                0
            );

        const easeFindingTransport =
            (
                easeTotal /
                confirmations.length /
                5
            ) * 100;


        // ==========================================
        // 10. FINAL CONFIDENCE SCORE
        // ==========================================

        const score =
            reportStrength * 0.20 +
            fareAgreement * 0.30 +
            dataFreshness * 0.15 +
            fareFairness * 0.15 +
            overchargeEvidence * 0.10 +
            easeFindingTransport * 0.10;


        const roundedScore =
            Math.round(score * 100) / 100;


        // ==========================================
        // 11. CONFIDENCE LEVEL
        // ==========================================

        let level;

        if (roundedScore >= 80) {
            level = "High";
        } else if (roundedScore >= 60) {
            level = "Medium";
        } else {
            level = "Unconfirmed";
        }


        // ==========================================
        // 12. RETURN RESULTS
        // ==========================================

        return {
            score: roundedScore,
            level,

            components: {
                reportStrength:
                    Math.round(
                        reportStrength * 100
                    ) / 100,

                fareAgreement:
                    Math.round(
                        fareAgreement * 100
                    ) / 100,

                dataFreshness:
                    Math.round(
                        dataFreshness * 100
                    ) / 100,

                fareFairness:
                    Math.round(
                        fareFairness * 100
                    ) / 100,

                overchargeEvidence:
                    Math.round(
                        overchargeEvidence * 100
                    ) / 100,

                easeFindingTransport:
                    Math.round(
                        easeFindingTransport * 100
                    ) / 100,
            },

            independentReports,
            totalReports: confirmations.length,
            medianFare,
        };

    } catch (error) {
        console.error(
            "🔥 CONFIDENCE CALCULATION ERROR:",
            error
        );

        throw error;
    }
};


module.exports = {
    calculateConfidence,
};