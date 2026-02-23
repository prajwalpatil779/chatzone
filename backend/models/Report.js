/**
 * Report Model
 * Stores user reports for admin panel
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    // Reporter
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Report Type
    reportType: {
      type: String,
      enum: ['user', 'message', 'group', 'other'],
      required: true,
    },

    // Reported Entity
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reportedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    reportedChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      default: null,
    },

    // Report Details
    reason: {
      type: String,
      enum: [
        'spam',
        'harassment',
        'offensive_content',
        'scam',
        'inappropriate_media',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolution: String,
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
