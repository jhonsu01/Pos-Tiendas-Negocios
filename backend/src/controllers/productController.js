const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public (or Private)
const getProducts = (req, res) => {
    try {
        const products = Product.findAll();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = (req, res) => {
    try {
        const product = Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = (req, res) => {
    try {
        const { name, sku, price, stock, category, trackStock, variablePrice, image, emoji } = req.body;

        const lastProduct = Product.findLastByPosition();
        const newPosition = lastProduct && lastProduct.position !== undefined ? lastProduct.position + 1 : 0;

        const product = Product.create({
            name,
            sku: sku || 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            price: price || 0,
            stock: stock || 0,
            category,
            trackStock: trackStock !== undefined ? trackStock : true,
            variablePrice: variablePrice || false,
            image,
            emoji,
            position: newPosition,
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ message: 'Error: El SKU ya existe en otro producto' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = (req, res) => {
    try {
        const { name, sku, price, stock, category, trackStock, variablePrice, image, emoji } = req.body;

        const product = Product.findById(req.params.id);

        if (product) {
            // Check SKU uniqueness if changing
            if (sku && sku !== product.sku) {
                const skuExists = Product.findOne({ sku });
                if (skuExists) {
                    return res.status(400).json({ message: 'El SKU ya está en uso por otro producto' });
                }
            }

            const updatedProduct = Product.update(req.params.id, {
                name, sku, price, stock, category, trackStock, variablePrice, image, emoji
            });

            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ message: 'Error: El SKU ya existe en otro producto' });
        } else {
            res.status(400).json({ message: error.message || 'Error al actualizar producto' });
        }
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = (req, res) => {
    try {
        const product = Product.findById(req.params.id);

        if (product) {
            Product.deleteById(req.params.id);
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update product positions
// @route   PUT /api/products/reorder
// @access  Private/Admin
const updateProductPositions = (req, res) => {
    try {
        const { positions } = req.body;

        if (!Array.isArray(positions)) {
            return res.status(400).json({ message: 'Positions must be an array' });
        }

        for (const item of positions) {
            Product.updatePosition(item.id, item.position);
        }

        res.json({ message: 'Positions updated successfully' });
    } catch (error) {
        console.error('Error updating positions:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductPositions,
};
