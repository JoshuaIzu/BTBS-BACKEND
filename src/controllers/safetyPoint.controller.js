const express = require("express");
const router = express.Router();
const SafetyPoint = require("../models/safetyPoint.model");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/auth.middleware");




const createSafetyPoint = async (req, res) => {
    try {
        const safetyPoint = await SafetyPoint.create(req.body);
        res.status(201).json({ message: "Safety Point created successfully", safetyPoint });
    } catch (error) {
        res.status(500).json({ message: "Error creating Safety Point", error });
    }
};

const getSafetyPoints = async (req, res) => {
    try {
        const safetyPoints = await SafetyPoint.find();
        res.status(200).json({ success: true, count: safetyPoints.length, safetyPoints });
    } catch (error) {
        res.status(500).json({ message: "Error fetching Safety Points", error });
    }
};

const getByCategory = async (req, res) => {
    try {
        const points = await SafetyPoint.find({ category: req.params.category });
        if (points.length === 0) {
            return res.status(404).json({ message: "No safety points found for the specified category" });
        }
        res.status(200).json({ success: true, count: points.length, points });
    } catch (error) {
        res.status(500).json({ message: "Error fetching Safety Points by category", error });
    }
};

module.exports = {
    createSafetyPoint,
    getSafetyPoints,
    getByCategory
};