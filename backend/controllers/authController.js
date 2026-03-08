const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, phone } = req.body;

    // Strict validation to prevent fake/disposable emails
    // A reasonable regex that requires standard valid TLDs and prevents common temporary mail domains
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+(com|net|org|edu|gov|mil|biz|info|mobi|name|aero|jobs|museum|co\.in|in|co\.uk)$/i;
    const isDisposable = /@(mailinator\.com|yopmail\.com|guerrillamail\.com|tempmail\.com|10minutemail\.com|sharklasers\.com)/i;

    if (!emailRegex.test(email) || isDisposable.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid, non-disposable email address.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || undefined,
      role: 'user',
    });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const u = user.toObject();
    delete u.password;
    res.status(201).json({ user: u, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const u = user.toObject();
    delete u.password;
    res.json({ user: u, token });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Return 404 but generic message is arguably safer, though 404 is fine for UX here
      return res.status(404).json({ message: 'There is no user with that email' });
    }

    // Get reset OTP
    const otp = user.getResetPasswordOTP();

    await user.save({ validateBeforeSave: false });

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #1e293b; text-align: center;">Password Reset Verification</h2>
        <p style="color: #475569; font-size: 16px;">You requested a password reset. Please use the following 6-digit verification code to securely reset your password:</p>
        
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #6366f1; letter-spacing: 5px; font-size: 36px; margin: 0;">${otp}</h1>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (err) {
      console.error(err);

      // If email couldn't be sent, wipe out the token from the DB so it isn't hanging there
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent. Make sure SMTP variables are correctly set.' });
    }

  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in.'
    });

  } catch (err) {
    next(err);
  }
};
