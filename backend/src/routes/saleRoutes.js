const express = require('express');
const router = express.Router();
const { createSale, getSales, getSaleById, updateSale, deleteSale } = require('../controllers/saleController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createSale).get(protect, admin, getSales);
router.route('/:id').get(protect, getSaleById).put(protect, admin, updateSale).delete(protect, admin, deleteSale);

module.exports = router;
