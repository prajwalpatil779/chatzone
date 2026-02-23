/**
 * User Routes
 */

const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Search users
router.get('/search', userController.searchUsers);

// Get all users
router.get('/', userController.getAllUsers);

// Get user profile
router.get('/:userId', userController.getUserProfile);

// Get user status
router.get('/:userId/status', userController.getUserStatus);

// Block/unblock user
router.post('/:userId/block', userController.blockUser);
router.post('/:userId/unblock', userController.unblockUser);

// Notifications
router.get(
  '/:userId/notifications',
  userController.getUserNotifications
);
router.put(
  '/notifications/:notificationId/read',
  userController.markNotificationAsRead
);

module.exports = router;
