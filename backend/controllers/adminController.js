/**
 * Admin Controller
 * Handles admin panel operations (ban users, view reports, etc.)
 */

const User = require('../models/User');
const Report = require('../models/Report');
const {
  formatResponse,
  getPaginationParams,
  isValidObjectId,
} = require('../utils/helpers');

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  try {
    // This will be checked in route middleware
    if (req.user.role !== 'admin') {
      return res.status(403).json(
        formatResponse(false, 'Admin access required')
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/users
// @desc    Get all users for admin panel
// @access  Private/Admin
exports.getAllUsersForAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const query = search
      ? {
          $or: [
            { username: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(pageLimit);

    const total = await User.countDocuments(query);

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

// @route   PUT /api/admin/users/:userId/ban
// @desc    Ban a user
// @access  Private/Admin
exports.banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid user ID')
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    user.isBanned = true;
    await user.save();

    res.status(200).json(
      formatResponse(true, 'User banned successfully', user)
    );
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/users/:userId/unban
// @desc    Unban a user
// @access  Private/Admin
exports.unbanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json(
        formatResponse(false, 'Invalid user ID')
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    user.isBanned = false;
    await user.save();

    res.status(200).json(
      formatResponse(true, 'User unbanned successfully', user)
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/reports
// @desc    Get all reports
// @access  Private/Admin
exports.getAllReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const query = status ? { status } : {};

    const reports = await Report.find(query)
      .populate('reportedBy', 'username email')
      .populate('reportedUser', 'username email')
      .populate('resolvedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const total = await Report.countDocuments(query);

    res.status(200).json(
      formatResponse(true, 'Reports fetched', {
        reports,
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

// @route   PUT /api/admin/reports/:reportId
// @desc    Update report status
// @access  Private/Admin
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { status, resolution } = req.body;
    const adminId = req.user.userId;

    if (
      !['pending', 'reviewed', 'resolved', 'dismissed'].includes(
        status
      )
    ) {
      return res.status(400).json(
        formatResponse(false, 'Invalid status value')
      );
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        resolution,
        resolvedBy: status === 'resolved' ? adminId : null,
      },
      { new: true }
    )
      .populate('reportedBy', 'username email')
      .populate('reportedUser', 'username email');

    if (!report) {
      return res.status(404).json(
        formatResponse(false, 'Report not found')
      );
    }

    res.status(200).json(
      formatResponse(true, 'Report updated successfully', report)
    );
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/admin/reports
// @desc    Create report (user can also create)
// @access  Private
exports.createReport = async (req, res, next) => {
  try {
    const { reportType, reportedUserId, reportedMessageId, reason, description } =
      req.body;
    const userId = req.user.userId;

    if (!reportType || !reason) {
      return res.status(400).json(
        formatResponse(
          false,
          'Report type and reason are required'
        )
      );
    }

    const reportData = {
      reportedBy: userId,
      reportType,
      reason,
      description,
      status: 'pending',
    };

    if (reportedUserId) reportData.reportedUser = reportedUserId;
    if (reportedMessageId) reportData.reportedMessage = reportedMessageId;

    const report = new Report(reportData);
    await report.save();

    res.status(201).json(
      formatResponse(true, 'Report created successfully', report)
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/dashboard-stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activUsers = await User.countDocuments({ isOnline: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const pendingReports = await Report.countDocuments({
      status: 'pending',
    });

    const stats = {
      totalUsers,
      activUsers,
      bannedUsers,
      pendingReports,
    };

    res.status(200).json(
      formatResponse(true, 'Dashboard stats fetched', stats)
    );
  } catch (error) {
    next(error);
  }
};
