/**
 * Chat Model
 * Stores chat information (both private and group chats)
 */

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    // Chat type: private or group
    chatType: {
      type: String,
      enum: ['private', 'group'],
      default: 'private',
    },

    // Participants
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    // Group specific fields
    groupName: {
      type: String,
      default: null,
    },
    groupIcon: {
      type: String,
      default: null,
    },
    groupDescription: {
      type: String,
      default: null,
      maxlength: 200,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Last message info for chat list display
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },

    // Pinned messages
    pinnedMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],

    // Muted notifications per user
    mutedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Archived status
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create compound unique index for private chats
chatSchema.index({
  participants: 1,
  chatType: 1,
});

module.exports = mongoose.model('Chat', chatSchema);
