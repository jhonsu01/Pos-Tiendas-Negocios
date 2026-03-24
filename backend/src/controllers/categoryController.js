const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = (req, res) => {
    try {
        const categories = Category.findActive();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = (req, res) => {
    try {
        const { name, description, defaultTrackStock, defaultVariablePrice } = req.body;

        const categoryExists = Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = Category.create({
            name,
            description,
            defaultTrackStock,
            defaultVariablePrice,
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = (req, res) => {
    try {
        const category = Category.findById(req.params.id);

        if (category) {
            const updatedCategory = Category.update(req.params.id, {
                name: req.body.name,
                description: req.body.description,
                defaultTrackStock: req.body.defaultTrackStock,
                defaultVariablePrice: req.body.defaultVariablePrice,
            });
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = (req, res) => {
    try {
        const category = Category.findById(req.params.id);

        if (category) {
            Category.softDelete(req.params.id);
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
