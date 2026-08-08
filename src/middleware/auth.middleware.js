const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {

    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {

        token = req.headers.authorization.split(" ")[1];

    }

    if (!token) {

        return res.status(401).json({
            success: false,
            message: "Not authorized, no token"
        });

    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User
            .findById(decoded.id)
            .select("-password");


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "User not found"
            });

        }

        req.user = user;

        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {

            return res.status(401).json({
                success: false,
                message: "Session expired, please log in again"
            });

        }

        return res.status(401).json({
            success: false,
            message: "Not authorized, token failed"
        });

    }

};
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to access this route' });
        }
        next();
    };
};

module.exports = { protect, authorize };