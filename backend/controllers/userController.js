/**
 * User Controller
 * Handles user-related operations (search, block, settings, etc.)
 */

const User = require('../models/User');
const { formatResponse, getPaginationParams } = require('../utils/helpers');

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
exports.searchUsers = async (req, res, next) => {
  try {
    const { query = '', page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    if (!query || query.length < 2) {
      return res.status(400).json(
        formatResponse(false, 'Search query must be at least 2 characters')
      );
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
      _id: { $ne: userId },
      isBanned: false,
    })
      .select('-password')
      .skip(skip)
      .limit(pageLimit);

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
      _id: { $ne: userId },
      isBanned: false,
    });

    res.status(200).json(
      formatResponse(true, 'Users found', {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: pageLimit,
          pages: Math.ceil(total / pageLimit),
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/:userId
// @desc    Get user profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('friends', '-password')
      .populate('blockedUsers', '-password');

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    res.status(200).json(
      formatResponse(true, 'User profile fetched', user)
    );
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/users/:userId/block
// @desc    Block user
// @access  Private
exports.blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    if (userId === currentUserId) {
      return res.status(400).json(
        formatResponse(false, 'You cannot block yourself')
      );
    }

    const user = await User.findById(currentUserId);
    const userToBlock = await User.findById(userId);

    if (!userToBlock) {
      return res.status(404).json(
        formatResponse(false, 'User to block not found')
      );
    }

    if (!user.blockedUsers.includes(userId)) {
      user.blockedUsers.push(userId);
      await user.save();
    }

    res.status(200).json(
      formatResponse(true, 'User blocked successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/users/:userId/unblock
// @desc    Unblock user
// @access  Private
exports.unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const user = await User.findById(currentUserId);

    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== userId
    );
    await user.save();

    res.status(200).json(
      formatResponse(true, 'User unblocked successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users
// @desc    Get all users (with pagination)
// @access  Private
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);
    const currentUserId = req.user.userId;

    const users = await User.find({
      _id: { $ne: currentUserId },
      isBanned: false,
    })
      .select('-password')
      .skip(skip)
      .limit(pageLimit);

    const total = await User.countDocuments({
      _id: { $ne: currentUserId },
      isBanned: false,
    });

    res.status(200).json(
      formatResponse(true, 'Users fetched', {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: pageLimit,
          pages: Math.ceil(total / pageLimit),
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/:userId/status
// @desc    Get user online status
// @access  Private
exports.getUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      'isOnline lastSeen'
    );

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    res.status(200).json(
      formatResponse(true, 'User status fetched', {
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      })
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/users/notifications
// @desc    Get user notifications
// @access  Private
exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const Notification = require('../models/Notification');

    const notifications = await Notification.find({ recipient: userId })
      .populate('relatedUser', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const total = await Notification.countDocuments({
      recipient: userId,
    });

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    res.status(200).json(
      formatResponse(true, 'Notifications fetched', {
        notifications,
        unreadCount,
        pagination: {
          total,
          page: parseInt(page),
          limit: pageLimit,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/users/notifications/:notificationId/read
// @desc    Mark notification as read
// @access  Private
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const Notification = require('../models/Notification');

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json(
        formatResponse(false, 'Notification not found')
      );
    }

    if (notification.recipient.toString() !== userId) {
      return res.status(403).json(
        formatResponse(false, 'You can only mark your own notifications')
      );
    }

    res.status(200).json(
      formatResponse(true, 'Notification marked as read', notification)
    );
  } catch (error) {
    next(error);
  }
};
