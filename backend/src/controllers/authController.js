const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = (req, res) => {
    try {
        const { username, password } = req.body;
        const user = User.findOne({ username });

        if (user && user.matchPassword(password)) {
            if (user.licenseExpiresAt && new Date() > new Date(user.licenseExpiresAt)) {
                return res.status(403).json({
                    message: 'LICENSE_EXPIRED',
                    username: user.username,
                    licenseExpiresAt: user.licenseExpiresAt
                });
            }

            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                licenseExpiresAt: user.licenseExpiresAt,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = (req, res) => {
    try {
        const { name, username, password, role } = req.body;

        const userExists = User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = User.create({
            name,
            username,
            password,
            role: role || 'cashier',
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = (req, res) => {
    try {
        const users = User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = (req, res) => {
    try {
        const user = User.findById(req.params.id);

        if (user) {
            const updatedUser = User.update(req.params.id, {
                name: req.body.name,
                username: req.body.username,
                role: req.body.role,
                password: req.body.password || undefined,
            });

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = (req, res) => {
    try {
        const user = User.findById(req.params.id);

        if (user) {
            User.deleteById(req.params.id);
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { authUser, registerUser, getUsers, updateUser, deleteUser };
