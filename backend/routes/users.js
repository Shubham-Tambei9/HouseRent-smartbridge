const express = require('express');
const { getProfile, updateProfile, getAllUsers } = require('../controllers/userController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.patch('/profile', auth, updateProfile);
router.get('/', auth, adminOnly, getAllUsers);

module.exports = router;
