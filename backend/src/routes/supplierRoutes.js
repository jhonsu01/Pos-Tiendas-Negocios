const express = require('express');
const router = express.Router();
const {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    makePayment,
    getSupplierPayments,
    getAllPayments,
    updatePayment,
    deletePayment,
} = require('../controllers/supplierController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getSuppliers).post(protect, admin, createSupplier);
router.route('/payments/all').get(protect, admin, getAllPayments);
router.route('/payments/:id').put(protect, admin, updatePayment).delete(protect, admin, deletePayment);
router.route('/:id').put(protect, admin, updateSupplier).delete(protect, admin, deleteSupplier);
router.route('/:id/payment').post(protect, admin, makePayment);
router.route('/:id/payments').get(protect, getSupplierPayments);

module.exports = router;
