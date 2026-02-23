/**
 * Message Controller
 * Handles message operations (send, edit, delete, search)
 */

const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Notification = require('../models/Notification');
const path = require('path');
const {
  formatResponse,
  getPaginationParams,
  isValidObjectId,
} = require('../utils/helpers');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { sendPushNotification } = require('../utils/fcmNotification');

// @route   POST /api/messages
// @desc    Send message
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId, text, type = 'text', replyTo = null } = req.body;
    const userId = req.user.userId;

    // Debug: Check what we received
    console.log('📨 sendMessage received:', {
      chatId,
      textLength: text?.length,
      type,
      hasFile: !!req.file,
      fileName: req.file?.originalname,
    });

    // Validate chat exists and user is participant
    const chat = await Chat.findById(chatId).populate('participants');
    if (!chat) {
      return res.status(404).json(
        formatResponse(false, 'Chat not found')
      );
    }

    if (
      !chat.participants.some(
        (p) => p._id.toString() === userId
      )
    ) {
      return res.status(403).json(
        formatResponse(false, 'You are not a member of this chat')
      );
    }

    // Determine message type - prefer file type, fallback to provided type
    let messageType = type;
    if (req.file && req.file.mimetype.startsWith('image/')) {
      messageType = 'image';
    }

    const messageData = {
      sender: userId,
      chat: chatId,
      type: messageType,
      text: text || '',
    };

    console.log('📝 Message type set to:', messageType);

    // Handle media upload
    if (req.file) {
      console.log('Processing file upload:', {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      const uploadResult = await uploadToCloudinary(
        req.file.path,
        'messages'
      );

      console.log('Cloudinary upload result:', uploadResult);

      if (uploadResult.success) {
        messageData.media = {
          url: uploadResult.url,
          type: uploadResult.type,
          name: req.file.originalname,
          size: req.file.size,
        };
      } else {
        console.error('Cloudinary upload failed:', uploadResult.error);
        messageData.media = {
          url: `${req.protocol}://${req.get('host')}/uploads/${path.basename(
            req.file.path
          )}`,
          type: req.file.mimetype,
          name: req.file.originalname,
          size: req.file.size,
        };
      }
    }

    // Handle reply
    if (replyTo && isValidObjectId(replyTo)) {
      messageData.replyTo = replyTo;
    }

    const message = new Message(messageData);
    await message.save();
    await message.populate('sender', 'username profilePicture');

    console.log('✅ Message saved:', {
      _id: message._id.toString(),
      type: message.type,
      hasText: !!message.text,
      hasMedia: !!message.media,
      mediaUrl: message.media?.url?.substring(0, 60),
    });

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.lastMessageTime = new Date();
    await chat.save();

    // Send notifications to other participants
    const otherParticipants = chat.participants.filter(
      (p) => p._id.toString() !== userId && !chat.mutedBy.includes(p._id)
    );

    for (const participant of otherParticipants) {
      // Create in-app notification
      await Notification.create({
        recipient: participant._id,
        type: 'message',
        title: `${message.sender.username} sent you a message`,
        message: text || 'sent a media file',
        relatedChat: chatId,
        relatedUser: userId,
      });

      // Send push notification if FCM token exists
      if (participant.fcmToken) {
        await sendPushNotification(
          participant.fcmToken,
          `${message.sender.username}`,
          text || 'sent a media file',
          {
            chatId: chatId.toString(),
            messageId: message._id.toString(),
          }
        );
      }
    }

    // Emit message via socket to all users in chat room (including sender)
    const io = global.io;
    if (io) {
      const socketPayload = {
        _id: message._id,
        sender: message.sender,
        chat: chatId.toString(),
        text: message.text,
        type: message.type,
        media: message.media,
        status: message.status,
        createdAt: message.createdAt,
        edited: message.edited,
      };

      console.log('📡 Broadcasting via socket:', {
        type: socketPayload.type,
        hasMedia: !!socketPayload.media,
        toRoom: chatId.toString(),
      });

      io.to(chatId.toString()).emit('message:received', socketPayload);
    }

    res.status(201).json(
      formatResponse(true, 'Message sent successfully', message)
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/messages/:chatId
// @desc    Get chat messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 30 } = req.query;
    const userId = req.user.userId;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    // Verify user is part of chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json(
        formatResponse(false, 'Chat not found')
      );
    }

    if (
      !chat.participants.some((p) => p.toString() === userId)
    ) {
      return res.status(403).json(
        formatResponse(false, 'You are not a member of this chat')
      );
    }

    const messages = await Message.find({
      chat: chatId,
      deletedForEveryone: false,
      deletedFor: { $ne: userId },
    })
      .populate('sender', 'username profilePicture isOnline lastSeen')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const total = await Message.countDocuments({
      chat: chatId,
      deletedForEveryone: false,
      deletedFor: { $ne: userId },
    });

    res.status(200).json(
      formatResponse(true, 'Messages fetched successfully', {
        messages: messages.reverse(),
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

// @route   PUT /api/messages/:messageId
// @desc    Edit message
// @access  Private
exports.editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId;

    if (!text) {
      return res.status(400).json(
        formatResponse(false, 'Please provide edited text')
      );
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json(
        formatResponse(false, 'Message not found')
      );
    }

    // Only sender can edit
    if (message.sender.toString() !== userId) {
      return res.status(403).json(
        formatResponse(false, 'You can only edit your own messages')
      );
    }

    // Can only edit message within 24 hours
    const messageAge = Date.now() - message.createdAt.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (messageAge > maxAge) {
      return res.status(400).json(
        formatResponse(false, 'Can only edit messages within 24 hours')
      );
    }

    message.text = text;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();
    await message.populate('sender', 'username profilePicture');

    res.status(200).json(
      formatResponse(true, 'Message edited successfully', message)
    );
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/messages/:messageId
// @desc    Delete message (for me)
// @access  Private
exports.deleteMessageForMe = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json(
        formatResponse(false, 'Message not found')
      );
    }

    // Add user to deletedFor array
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.status(200).json(
      formatResponse(true, 'Message deleted for you')
    );
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/messages/:messageId/everyone
// @desc    Delete message for everyone
// @access  Private
exports.deleteMessageForEveryone = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json(
        formatResponse(false, 'Message not found')
      );
    }

    // Only sender can delete for everyone
    if (message.sender.toString() !== userId) {
      return res.status(403).json(
        formatResponse(
          false,
          'Only sender can delete message for everyone'
        )
      );
    }

    // Within 2 hours limit for delete for everyone
    const messageAge = Date.now() - message.createdAt.getTime();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours

    if (messageAge > maxAge) {
      return res.status(400).json(
        formatResponse(false, 'Can only delete messages within 2 hours')
      );
    }

    message.text = 'This message was deleted';
    message.media = null;
    message.deletedForEveryone = true;
    await message.save();

    res.status(200).json(
      formatResponse(true, 'Message deleted for everyone')
    );
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/messages/:messageId/reaction
// @desc    Add or remove reaction to message
// @access  Private
exports.addReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    if (!emoji) {
      return res.status(400).json(
        formatResponse(false, 'Emoji is required')
      );
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json(
        formatResponse(false, 'Message not found')
      );
    }

    // Check if user already reacted
    const existingReaction = message.reactions.findIndex(
      (r) => r.user.toString() === userId && r.emoji === emoji
    );

    if (existingReaction > -1) {
      // Remove reaction
      message.reactions.splice(existingReaction, 1);
    } else {
      // Add reaction
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();
    await message.populate('sender', 'username profilePicture');

    res.status(200).json(
      formatResponse(true, 'Reaction updated successfully', message)
    );
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/messages/:messageId/seen
// @desc    Mark message as seen
// @access  Private
exports.markMessageAsSeen = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json(
        formatResponse(false, 'Message not found')
      );
    }

    // Check if already seen by user
    const alreadySeen = message.seenBy.some(
      (s) => s.user.toString() === userId
    );

    if (!alreadySeen) {
      message.seenBy.push({ user: userId, seenAt: new Date() });
      message.status = 'seen';
      await message.save();

      const io = global.io;
      if (io) {
        io.to(message.chat.toString()).emit('message-status', {
          messageId: message._id.toString(),
          status: 'seen',
          seenBy: userId,
        });
      }
    }

    res.status(200).json(
      formatResponse(true, 'Message marked as seen', message)
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/messages/search
// @desc    Search messages in a chat
// @access  Private
exports.searchMessages = async (req, res, next) => {
  try {
    const { chatId, query, page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    if (!query) {
      return res.status(400).json(
        formatResponse(false, 'Search query is required')
      );
    }

    // Verify user is part of chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json(
        formatResponse(false, 'Chat not found')
      );
    }

    if (
      !chat.participants.some((p) => p.toString() === userId)
    ) {
      return res.status(403).json(
        formatResponse(false, 'You are not a member of this chat')
      );
    }

    const messages = await Message.find({
      chat: chatId,
      text: { $regex: query, $options: 'i' },
      deletedForEveryone: false,
      deletedFor: { $ne: userId },
    })
      .populate('sender', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const total = await Message.countDocuments({
      chat: chatId,
      text: { $regex: query, $options: 'i' },
      deletedForEveryone: false,
      deletedFor: { $ne: userId },
    });

    res.status(200).json(
      formatResponse(true, 'Messages search completed', {
        messages,
        pagination: { total, page: parseInt(page), limit: pageLimit },
      })
    );
  } catch (error) {
    next(error);
  }
};
