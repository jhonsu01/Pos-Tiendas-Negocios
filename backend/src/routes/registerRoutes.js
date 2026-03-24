const express = require('express');
const router = express.Router();
const {
    getRegisters,
    createRegister,
    updateRegister,
    deleteRegister,
    getRegisterSummary,
    closeCashRegister,
    getRegisterClosures,
    getAllClosures,
    updateClosure,
    deleteClosure,
    getAccumulatedByRegister,
} = require('../controllers/registerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getRegisters).post(protect, admin, createRegister);
router.route('/accumulated').get(protect, getAccumulatedByRegister);
router.route('/:id').put(protect, admin, updateRegister).delete(protect, admin, deleteRegister);
router.route('/:id/summary').get(protect, getRegisterSummary);
router.route('/:id/close').post(protect, closeCashRegister);
router.route('/closures/all').get(protect, getAllClosures);
router.route('/:id/closures').get(protect, getRegisterClosures);
router.route('/closures/:id').put(protect, admin, updateClosure).delete(protect, admin, deleteClosure);

module.exports = router;
