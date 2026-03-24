const Settings = require('../models/Settings');

// @desc    Get settings
// @route   GET /api/settings
// @access  Private
const getSettings = (req, res) => {
    try {
        let settings = Settings.findOne();
        if (!settings) {
            settings = Settings.create({
                storeName: 'POS Moderno',
                storeLogo: '',
                logoSize: 80,
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access   Private/Admin
const updateSettings = (req, res) => {
    try {
        const { storeName, storeLogo, logoSize } = req.body;

        const settings = Settings.upsert({
            storeName,
            storeLogo,
            logoSize,
        });

        res.json(settings);
    } catch (error) {
        console.error('Error in updateSettings:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings,
};
