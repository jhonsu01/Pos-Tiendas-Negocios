const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUsers, updateUser, deleteUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.route('/').post(registerUser).get(protect, admin, getUsers);
router.route('/:id').put(protect, admin, updateUser).delete(protect, admin, deleteUser);

module.exports = router;
