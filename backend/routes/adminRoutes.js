/**
 * Admin Routes
 */

const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware to check admin role
const adminCheck = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

// All routes require authentication
router.use(authMiddleware);

// Get users (admin only)
router.get('/users', adminCheck, adminController.getAllUsersForAdmin);

// Ban/unban users
router.put('/users/:userId/ban', adminCheck, adminController.banUser);
router.put(
  '/users/:userId/unban',
  adminCheck,
  adminController.unbanUser
);

// Reports
router.get('/reports', adminCheck, adminController.getAllReports);
router.put(
  '/reports/:reportId',
  adminCheck,
  adminController.updateReportStatus
);
router.post(
  '/reports',
  adminController.createReport
); // Non-admin can create reports

// Dashboard stats
router.get(
  '/dashboard/stats',
  adminCheck,
  adminController.getDashboardStats
);

module.exports = router;
