const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private
const createSale = (req, res) => {
    try {
        const { items, totalAmount, paymentMethod, register } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Decrease stock only for products that track stock
        for (const item of items) {
            const product = Product.findById(item.product);
            if (product && product.trackStock) {
                Product.updateStock(item.product, product.stock - item.qty);
            }
        }

        const sale = Sale.create({
            user: req.user._id,
            register,
            items,
            totalAmount,
            paymentMethod,
        });

        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private/Admin
const getSales = (req, res) => {
    try {
        const sales = Sale.findAll();
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sale by ID
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = (req, res) => {
    try {
        const sale = Sale.findById(req.params.id);

        if (sale) {
            res.json(sale);
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private/Admin
const updateSale = (req, res) => {
    try {
        const { items, totalAmount, paymentMethod } = req.body;
        const sale = Sale.findById(req.params.id);

        if (sale) {
            // Restore stock for old items
            for (const item of sale.items) {
                const product = Product.findById(item.product);
                if (product && product.trackStock) {
                    Product.updateStock(item.product, product.stock + item.qty);
                }
            }

            // Decrease stock for new items
            if (items) {
                for (const item of items) {
                    const product = Product.findById(item.product);
                    if (product && product.trackStock) {
                        Product.updateStock(item.product, product.stock - item.qty);
                    }
                }
            }

            const updatedSale = Sale.update(req.params.id, {
                items: items || sale.items,
                totalAmount: totalAmount || sale.totalAmount,
                paymentMethod: paymentMethod || sale.paymentMethod,
            });

            res.json(updatedSale);
        } else {
            res.status(404).json({ message: 'Venta no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private/Admin
const deleteSale = (req, res) => {
    try {
        const sale = Sale.findById(req.params.id);

        if (sale) {
            // Restore stock for all items
            for (const item of sale.items) {
                const product = Product.findById(item.product);
                if (product && product.trackStock) {
                    Product.updateStock(item.product, product.stock + item.qty);
                }
            }

            Sale.deleteById(req.params.id);
            res.json({ message: 'Venta eliminada' });
        } else {
            res.status(404).json({ message: 'Venta no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createSale, getSales, getSaleById, updateSale, deleteSale };
