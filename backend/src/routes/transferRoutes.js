const express = require('express');
const router = express.Router();
const { createTransfer, getTransfers, settleTransfer, deleteTransfer } = require('../controllers/transferController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createTransfer)
    .get(protect, getTransfers);

router.route('/:id/pay').put(protect, settleTransfer);
router.route('/:id').delete(protect, deleteTransfer);

module.exports = router;
