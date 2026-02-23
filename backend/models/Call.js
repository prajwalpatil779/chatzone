/**
 * Call Model
 * Stores call history and information
 */

const mongoose = require('mongoose');

const callSchema = new mongoose.Schema(
  {
    // Caller and Receiver
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Call Type
    callType: {
      type: String,
      enum: ['audio', 'video'],
      required: true,
    },

    // Call Status
    status: {
      type: String,
      enum: ['ongoing', 'completed', 'declined', 'missed'],
      default: 'ongoing',
    },

    // Call Duration
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    duration: Number, // in seconds

    // Optional group chat reference
    groupChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Call', callSchema);
