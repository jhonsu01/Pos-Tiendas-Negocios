const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            const user = User.findByIdWithoutPassword(decoded.id);

            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check License Expiration
            if (user.licenseExpiresAt && new Date() > new Date(user.licenseExpiresAt)) {
                return res.status(403).json({ message: 'LICENSE_EXPIRED' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            if (error.message === 'LICENSE_EXPIRED') {
                res.status(403).json({ message: 'LICENSE_EXPIRED' });
            } else {
                res.status(401).json({ message: 'Not authorized, token failed' });
            }
            return;
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
