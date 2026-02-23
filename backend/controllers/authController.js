/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

const User = require('../models/User');
const { generateToken, formatResponse } = require('../utils/helpers');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const path = require('path');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json(
        formatResponse(false, 'Please provide all required fields')
      );
    }

    if (password !== confirmPassword) {
      return res.status(400).json(
        formatResponse(false, 'Passwords do not match')
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json(
        formatResponse(false, 'User already exists with this email or username')
      );
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json(
      formatResponse(true, 'User registered successfully', {
        user: user.toJSON(),
        token,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(
        formatResponse(false, 'Please provide email and password')
      );
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json(
        formatResponse(false, 'Invalid credentials')
      );
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json(
        formatResponse(false, 'Invalid credentials')
      );
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json(
        formatResponse(false, 'Your account has been banned')
      );
    }

    // Update last seen and online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json(
      formatResponse(true, 'Login successful', {
        user: user.toJSON(),
        token,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Update user status
    await User.findByIdAndUpdate(req.user.userId, {
      isOnline: false,
      lastSeen: new Date(),
    });

    res.status(200).json(
      formatResponse(true, 'Logged out successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('friends')
      .populate('blockedUsers');

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    res.status(200).json(
      formatResponse(true, 'User fetched successfully', user)
    );
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { username, bio, phoneNumber } = req.body;
    const userId = req.user.userId;

    // Build update object
    const updateData = {};
    if (username !== undefined) updateData.username = username.trim();
    if (bio !== undefined) updateData.bio = bio;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

    // Handle profile picture upload
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.path,
        'profile-pictures'
      );

      if (uploadResult.success) {
        updateData.profilePicture = uploadResult.url;
      } else {
        updateData.profilePicture = `${req.protocol}://${req.get('host')}/uploads/${path.basename(
          req.file.path
        )}`;
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(
      formatResponse(true, 'Profile updated successfully', user)
    );
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/auth/settings
// @desc    Update user settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    const { darkMode, notificationsEnabled, soundEnabled } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (darkMode !== undefined) updateData.darkMode = darkMode;
    if (notificationsEnabled !== undefined)
      updateData.notificationsEnabled = notificationsEnabled;
    if (soundEnabled !== undefined) updateData.soundEnabled = soundEnabled;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    res.status(200).json(
      formatResponse(true, 'Settings updated successfully', user)
    );
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/fcm-token
// @desc    Update FCM token for push notifications
// @access  Private
exports.updateFCMToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.userId;

    if (!fcmToken) {
      return res.status(400).json(
        formatResponse(false, 'FCM token is required')
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );

    res.status(200).json(
      formatResponse(true, 'FCM token updated successfully', user)
    );
  } catch (error) {
    next(error);
  }
};
