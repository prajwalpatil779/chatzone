/**
 * Message Routes
 */

const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration for file uploads
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
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for files
});

// All routes require authentication
router.use(authMiddleware);

// Send message
router.post('/', upload.single('media'), messageController.sendMessage);

// Get messages
router.get('/:chatId', messageController.getMessages);

// Edit message
router.put('/:messageId', messageController.editMessage);

// Delete messages
router.delete('/:messageId', messageController.deleteMessageForMe);
router.delete('/:messageId/everyone', messageController.deleteMessageForEveryone);

// Reactions
router.put('/:messageId/reaction', messageController.addReaction);

// Mark as seen
router.put('/:messageId/seen', messageController.markMessageAsSeen);

// Search messages
router.get('/search', messageController.searchMessages);

module.exports = router;
