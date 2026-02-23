/**
 * Chat Controller
 * Handles chat operations (create, fetch, update)
 */

const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');
const { formatResponse, getPaginationParams } = require('../utils/helpers');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// @route   POST /api/chats/private
// @desc    Create or get private chat
// @access  Private
exports.createPrivateChat = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.userId;

    if (!recipientId) {
      return res.status(400).json(
        formatResponse(false, 'Recipient ID is required')
      );
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json(
        formatResponse(false, 'Recipient not found')
      );
    }

    // Check if user blocked recipient or vice versa
    if (recipient.blockedUsers.includes(userId)) {
      return res.status(403).json(
        formatResponse(false, 'You have been blocked by this user')
      );
    }

    // Find or create chat
    let chat = await Chat.findOne({
      chatType: 'private',
      participants: { $all: [userId, recipientId] },
    }).populate('participants', '-password');

    if (!chat) {
      chat = new Chat({
        chatType: 'private',
        participants: [userId, recipientId],
      });
      await chat.save();
      await chat.populate('participants', '-password');
    }

    res.status(200).json(
      formatResponse(true, 'Private chat created/retrieved successfully', chat)
    );
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/chats/group
// @desc    Create group chat
// @access  Private
exports.createGroupChat = async (req, res, next) => {
  try {
    const { groupName, participants } = req.body;
    const userId = req.user.userId;

    if (!groupName || !participants || participants.length === 0) {
      return res.status(400).json(
        formatResponse(
          false,
          'Group name and at least one participant is required'
        )
      );
    }

    // Add creator to participants if not already there
    const allParticipants = [
      ...new Set([userId, ...participants]),
    ];

    // Validate all participants exist
    const users = await User.find({ _id: { $in: allParticipants } });
    if (users.length !== allParticipants.length) {
      return res.status(400).json(
        formatResponse(false, 'Some participants not found')
      );
    }

    const chat = new Chat({
      chatType: 'group',
      groupName,
      participants: allParticipants,
      groupAdmin: userId,
    });

    await chat.save();
    await chat.populate('participants', '-password');

    res.status(201).json(
      formatResponse(true, 'Group created successfully', chat)
    );
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/chats
// @desc    Get all chats for user
// @access  Private
exports.getUserChats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: pageLimit } = getPaginationParams(page, limit);

    const chats = await Chat.find({
      participants: userId,
      archivedBy: { $ne: userId },
    })
      .populate('participants', '-password')
      .populate('lastMessage')
      .populate('groupAdmin', '-password')
      .sort({ lastMessageTime: -1 })
      .skip(skip)
      .limit(pageLimit);

    const total = await Chat.countDocuments({
      participants: userId,
      archivedBy: { $ne: userId },
    });

    res.status(200).json(
      formatResponse(true, 'Chats fetched successfully', {
        chats,
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

// @route   GET /api/chats/:chatId
// @desc    Get specific chat
// @access  Private
exports.getChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId)
      .populate('participants', '-password')
      .populate('lastMessage')
      .populate('groupAdmin', '-password');

    if (!chat) {
      return res.status(404).json(
        formatResponse(false, 'Chat not found')
      );
    }

    // Verify user is participant
    if (!chat.participants.some((p) => p._id.toString() === userId)) {
      return res.status(403).json(
        formatResponse(false, 'You are not a member of this chat')
      );
    }

    res.status(200).json(
      formatResponse(true, 'Chat fetched successfully', chat)
    );
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/chats/:chatId
// @desc    Update group chat
// @access  Private
exports.updateGroupChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { groupName, groupDescription } = req.body;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json(
        formatResponse(false, 'Chat not found')
      );
    }

    // Check if user is admin
    if (chat.groupAdmin.toString() !== userId) {
      return res.status(403).json(
        formatResponse(false, 'Only group admin can update group info')
      );
    }

    const updateData = {};
    if (groupName) updateData.groupName = groupName;
    if (groupDescription) updateData.groupDescription = groupDescription;

    // Handle group icon upload
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.path,
        'group-icons'
      );
      if (uploadResult.success) {
        updateData.groupIcon = uploadResult.url;
      }
    }

    const updatedChat = await Chat.findByIdAndUpdate(chatId, updateData, {
      new: true,
    }).populate('participants', '-password');

    res.status(200).json(
      formatResponse(true, 'Group updated successfully', updatedChat)
    );
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/chats/:chatId/add-member
// @desc    Add member to group
// @access  Private
exports.addGroupMember = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { userId: newMemberId } = req.body;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json(
        formatResponse(false, 'Chat not found')
      );
    }

    if (chat.chatType !== 'group') {
      return res.status(400).json(
        formatResponse(false, 'This is not a group chat')
      );
    }

    if (chat.groupAdmin.toString() !== userId) {
      return res.status(403).json(
        formatResponse(false, 'Only group admin can add members')
      );
    }

    // Check if user already in group
    if (chat.participants.includes(newMemberId)) {
      return res.status(400).json(
        formatResponse(false, 'User already in group')
      );
    }

    chat.participants.push(newMemberId);
    await chat.save();
    await chat.populate('participants', '-password');

    res.status(200).json(
      formatResponse(true, 'Member added successfully', chat)
    );
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/chats/:chatId/remove-member/:memberId
// @desc    Remove member from group
// @access  Private
exports.removeGroupMember = async (req, res, next) => {
  try {
    const { chatId, memberId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json(
        formatResponse(false, 'Chat not found')
      );
    }

    if (chat.chatType !== 'group') {
      return res.status(400).json(
        formatResponse(false, 'This is not a group chat')
      );
    }

    // Check permissions
    if (
      chat.groupAdmin.toString() !== userId &&
      memberId !== userId
    ) {
      return res.status(403).json(
        formatResponse(
          false,
          'You do not have permission to remove members'
        )
      );
    }

    chat.participants = chat.participants.filter(
      (p) => p.toString() !== memberId
    );
    await chat.save();
    await chat.populate('participants', '-password');

    res.status(200).json(
      formatResponse(true, 'Member removed successfully', chat)
    );
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/chats/:chatId/archive
// @desc    Archive chat
// @access  Private
exports.archiveChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json(
        formatResponse(false, 'Chat not found')
      );
    }

    if (!chat.archivedBy.includes(userId)) {
      chat.archivedBy.push(userId);
      await chat.save();
    }

    res.status(200).json(
      formatResponse(true, 'Chat archived successfully', chat)
    );
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/chats/:chatId/unarchive
// @desc    Unarchive chat
// @access  Private
exports.unarchiveChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json(
        formatResponse(false, 'Chat not found')
      );
    }

    chat.archivedBy = chat.archivedBy.filter(
      (id) => id.toString() !== userId
    );
    await chat.save();

    res.status(200).json(
      formatResponse(true, 'Chat unarchived successfully', chat)
    );
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/chats/:chatId
// @desc    Delete chat
// @access  Private
exports.deleteChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json(
        formatResponse(false, 'Chat not found')
      );
    }

    // Only group admin can delete group chat
    if (
      chat.chatType === 'group' &&
      chat.groupAdmin.toString() !== userId
    ) {
      return res.status(403).json(
        formatResponse(false, 'Only group admin can delete group')
      );
    }

    // Delete the chat and all its messages
    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json(
      formatResponse(true, 'Chat deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
