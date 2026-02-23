/**
 * Message Model
 * Stores all chat messages with comprehensive features
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Message Content
    text: {
      type: String,
      default: '',
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'voice', 'emoji'],
      default: 'text',
    },

    // File/Media Information
    media: {
      url: String,
      type: { type: String }, // 'image', 'video', 'audio', 'document'
      name: String,
      size: Number,
    },

    // Message Sender and Chat
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },

    // Message Status
    status: {
      type: String,
      enum: ['sent', 'delivered', 'seen'],
      default: 'sent',
    },
    seenBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        seenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Message Interaction
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        emoji: String,
        _id: false,
      },
    ],

    // Reply to another message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },

    // Message Editing
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,

    // Message Deletion (soft delete)
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },

    // Forward info
    isForwarded: {
      type: Boolean,
      default: false,
    },
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

module.exports = mongoose.model('Message', messageSchema);
