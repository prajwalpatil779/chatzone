/**
 * Chat Routes
 */

const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// All routes require authentication
router.use(authMiddleware);

// Create/get chats
router.post('/private', chatController.createPrivateChat);
router.post('/group', chatController.createGroupChat);
router.get('/', chatController.getUserChats);
router.get('/:chatId', chatController.getChat);

// Update group chat
router.put(
  '/:chatId',
  upload.single('groupIcon'),
  chatController.updateGroupChat
);

// Manage group members
router.post('/:chatId/add-member', chatController.addGroupMember);
router.delete(
  '/:chatId/remove-member/:memberId',
  chatController.removeGroupMember
);

// Archive/unarchive
router.post('/:chatId/archive', chatController.archiveChat);
router.post('/:chatId/unarchive', chatController.unarchiveChat);

// Delete chat
router.delete('/:chatId', chatController.deleteChat);

module.exports = router;
