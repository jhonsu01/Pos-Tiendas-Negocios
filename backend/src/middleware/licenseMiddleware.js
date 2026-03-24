const User = require('../models/User');

const checkLicense = (req, res, next) => {
    try {
        const user = User.findById(req.user._id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (user.licenseExpiresAt && new Date() > new Date(user.licenseExpiresAt)) {
            return res.status(403).json({ message: 'LICENSE_EXPIRED' });
        }

        next();
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

module.exports = { checkLicense };
