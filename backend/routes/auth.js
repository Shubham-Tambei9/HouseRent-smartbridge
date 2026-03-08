const express = require('express');
const { body } = require('express-validator');
const { register, login, me, forgotPassword, resetPassword } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);

router.get('/me', auth, me);

module.exports = router;
