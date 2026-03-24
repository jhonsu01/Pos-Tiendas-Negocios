const Transfer = require('../models/Transfer');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Create new transfer (debt)
// @route   POST /api/transfers
// @access  Private
const createTransfer = (req, res) => {
    try {
        const { customerName, items, totalAmount } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items' });
        }

        // Decrease stock immediately
        for (const item of items) {
            const product = Product.findById(item.product);
            if (product && product.trackStock) {
                Product.updateStock(item.product, product.stock - item.qty);
            }
        }

        const transfer = Transfer.create({
            user: req.user._id,
            customerName,
            items,
            totalAmount,
        });

        res.status(201).json(transfer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all pending transfers
// @route   GET /api/transfers
// @access  Private
const getTransfers = (req, res) => {
    try {
        const transfers = Transfer.findPending();
        res.json(transfers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Settle transfer (Pay debt)
// @route   PUT /api/transfers/:id/pay
// @access  Private
const settleTransfer = (req, res) => {
    try {
        const { registerId } = req.body;
        const transfer = Transfer.findById(req.params.id);

        if (!transfer) {
            return res.status(404).json({ message: 'Transfer not found' });
        }

        if (transfer.status === 'paid') {
            return res.status(400).json({ message: 'Transfer already paid' });
        }

        const Register = require('../models/Register');
        const registers = Register.findActive();

        // Map categories to register IDs
        const categoryMap = {};
        let defaultRegisterId = registerId;

        if (!defaultRegisterId && registers.length > 0) {
            defaultRegisterId = registers[0]._id;
        }

        registers.forEach(reg => {
            if (reg.categories && reg.categories.length > 0) {
                reg.categories.forEach(cat => {
                    categoryMap[cat] = reg._id;
                });
            }
        });

        // Group items by target register
        const salesByRegister = {};

        for (const item of transfer.items) {
            let targetRegId = defaultRegisterId;
            let itemCategory = item.category;

            // If category is missing (old transfer), fetch from Product
            if (!itemCategory && item.product) {
                const product = Product.findById(item.product);
                if (product) {
                    itemCategory = product.category;
                }
            }

            if (itemCategory && categoryMap[itemCategory]) {
                targetRegId = categoryMap[itemCategory];
            }

            if (!salesByRegister[targetRegId]) {
                salesByRegister[targetRegId] = {
                    items: [],
                    totalAmount: 0
                };
            }

            const itemWithCategory = { ...item };
            if (!itemWithCategory.category) itemWithCategory.category = itemCategory;

            salesByRegister[targetRegId].items.push(itemWithCategory);
            salesByRegister[targetRegId].totalAmount += (item.price * item.qty);
        }

        // Create a Sale for each register group
        const createdSales = [];
        for (const [regId, data] of Object.entries(salesByRegister)) {
            const sale = Sale.create({
                user: req.user._id,
                items: data.items,
                totalAmount: data.totalAmount,
                paymentMethod: 'Cash',
                register: regId,
                isTransferPayment: true,
            });
            createdSales.push(sale);
        }

        // Update Transfer status
        const updatedTransfer = Transfer.markPaid(req.params.id);

        res.json({
            transfer: updatedTransfer,
            salesCreated: createdSales.length,
            message: `Deuda pagada. Se generaron ${createdSales.length} ventas distribuidas en las cajas correspondientes.`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete transfer (Cancel debt)
// @route   DELETE /api/transfers/:id
// @access  Private
const deleteTransfer = (req, res) => {
    try {
        const transfer = Transfer.findById(req.params.id);

        if (!transfer) {
            return res.status(404).json({ message: 'Transfer not found' });
        }

        // Restore stock since debt is cancelled/deleted
        if (transfer.status === 'pending') {
            for (const item of transfer.items) {
                const product = Product.findById(item.product);
                if (product && product.trackStock) {
                    Product.updateStock(item.product, product.stock + item.qty);
                }
            }
        }

        Transfer.deleteById(req.params.id);
        res.json({ message: 'Transfer removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTransfer, getTransfers, settleTransfer, deleteTransfer };
