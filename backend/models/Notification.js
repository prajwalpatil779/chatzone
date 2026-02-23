/**
 * Notification Model
 * Stores in-app notifications
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Notification Type
    type: {
      type: String,
      enum: [
        'message',
        'call',
        'friend_request',
        'group_invite',
        'group_admin_change',
        'user_blocked',
        'system',
      ],
      required: true,
    },

    // Content
    title: String,
    message: String,

    // Related Entity
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    relatedChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      default: null,
    },

    // Status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,

    // Action URL
    actionUrl: String,
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
