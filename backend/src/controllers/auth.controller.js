const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Helper to generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

// @desc    Register a new user (Admin only in production)
// @route   POST /api/auth/register
// @access  Public (seed) / Admin
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    const newToken = generateToken(user._id);
    res.status(200).json({ success: true, token: newToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
  });
};

module.exports = { register, login, refresh, getMe };
