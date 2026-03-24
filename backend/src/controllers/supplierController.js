const Supplier = require('../models/Supplier');
const SupplierPayment = require('../models/SupplierPayment');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = (req, res) => {
    try {
        const suppliers = Supplier.findAll();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = (req, res) => {
    try {
        const { name, contact, phone, email, address, notes } = req.body;
        const supplier = Supplier.create({ name, contact, phone, email, address, notes });
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
const updateSupplier = (req, res) => {
    try {
        const { name, contact, phone, email, address, notes, isActive } = req.body;
        const supplier = Supplier.findById(req.params.id);

        if (supplier) {
            const updatedSupplier = Supplier.update(req.params.id, {
                name, contact, phone, email, address, notes, isActive
            });
            res.json(updatedSupplier);
        } else {
            res.status(404).json({ message: 'Proveedor no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = (req, res) => {
    try {
        const supplier = Supplier.findById(req.params.id);

        if (supplier) {
            Supplier.deleteById(req.params.id);
            res.json({ message: 'Proveedor eliminado' });
        } else {
            res.status(404).json({ message: 'Proveedor no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Make payment to supplier
// @route   POST /api/suppliers/:id/payment
// @access  Private/Admin
const makePayment = (req, res) => {
    try {
        const { register, amount, description } = req.body;
        const supplier = Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        const payment = SupplierPayment.create({
            supplier: req.params.id,
            register,
            user: req.user._id,
            amount,
            description,
        });

        res.status(201).json(payment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get payments for a supplier
// @route   GET /api/suppliers/:id/payments
// @access  Private
const getSupplierPayments = (req, res) => {
    try {
        const payments = SupplierPayment.findBySupplier(req.params.id);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all payments
// @route   GET /api/suppliers/payments/all
// @access  Private/Admin
const getAllPayments = (req, res) => {
    try {
        const payments = SupplierPayment.findAll(100);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update payment
// @route   PUT /api/suppliers/payments/:id
// @access  Private/Admin
const updatePayment = (req, res) => {
    try {
        const { amount, description, register } = req.body;
        const payment = SupplierPayment.findById(req.params.id);

        if (payment) {
            const updatedPayment = SupplierPayment.update(req.params.id, {
                amount, description, register
            });
            res.json(updatedPayment);
        } else {
            res.status(404).json({ message: 'Pago no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete payment
// @route   DELETE /api/suppliers/payments/:id
// @access  Private/Admin
const deletePayment = (req, res) => {
    try {
        const payment = SupplierPayment.findById(req.params.id);

        if (payment) {
            SupplierPayment.deleteById(req.params.id);
            res.json({ message: 'Pago eliminado' });
        } else {
            res.status(404).json({ message: 'Pago no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    makePayment,
    getSupplierPayments,
    getAllPayments,
    updatePayment,
    deletePayment,
};
