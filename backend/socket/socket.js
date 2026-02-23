/**
 * Socket.io Configuration
 * Handles real-time features like typing indicator, online status, etc.
 */

const User = require('../models/User');
const Message = require('../models/Message');

// Store connected users
const connectedUsers = new Map();

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // User joins
    socket.on('user-joined', async (userId) => {
      try {
        connectedUsers.set(userId, socket.id);

        // Update user status
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        // Broadcast user online
        io.emit('user-online', {
          userId,
          socketId: socket.id,
          timestamp: new Date(),
        });

        console.log(`User ${userId} joined`);
      } catch (error) {
        console.error('Error in user-joined:', error);
      }
    });

    // Join chat room
    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat room: ${chatId}`);
    });

    // Leave chat room
    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat room: ${chatId}`);
    });

    // Typing indicator
    socket.on('typing:start', (data) => {
      const { chat, userId, userName } = data;
      socket.to(chat).emit('typing:start', {
        userId,
        userName,
        chat,
      });
    });

    // Stop typing
    socket.on('typing:stop', (data) => {
      const { chat, userId, userName } = data;
      socket.to(chat).emit('typing:stop', {
        userId,
        userName,
        chat,
      });
    });

    // Send message in real-time
    socket.on('send-message', (data) => {
      const { chatId, message } = data;
      socket.to(chatId).emit('message:received', {
        ...message,
        timestamp: new Date(),
      });
    });

    // Message received (acknowledge)
    socket.on('message:received', (data) => {
      const { chatId, message } = data;
      socket.to(chatId).emit('message:received', {
        ...message,
      });
    });

    // Message updated/edited
    socket.on('message:updated', (data) => {
      const { chatId, message } = data;
      socket.to(chatId).emit('message:updated', {
        ...message,
      });
    });

    // Message delivered
    socket.on('message-delivered', (data) => {
      const { chatId, messageId } = data;
      socket.to(chatId).emit('message-status', {
        messageId,
        status: 'delivered',
      });
    });

    // Message seen
    socket.on('message-seen', (data) => {
      const { chatId, messageId, userId } = data;
      socket.to(chatId).emit('message-status', {
        messageId,
        status: 'seen',
        seenBy: userId,
      });
    });

    // User reaction to message
    socket.on('message-reaction', (data) => {
      const { chatId, messageId, emoji, userId } = data;
      socket.to(chatId).emit('reaction-update', {
        messageId,
        emoji,
        userId,
      });
    });

    // Initiate call
    socket.on('call-initiated', (data) => {
      const { callerId, receiverId, callType, signalingData } = data;
      const receiverSocketId = connectedUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('incoming-call', {
          callerId,
          callerName: data.callerName,
          callType,
          signalingData,
          socketId: socket.id,
        });
      }
    });

    // Call accepted
    socket.on('call-accepted', (data) => {
      const { callerId, signalingData } = data;
      const callerSocketId = connectedUsers.get(callerId);

      if (callerSocketId) {
        io.to(callerSocketId).emit('call-accepted', {
          signalingData,
          acceptedBy: data.acceptedBy,
        });
      }
    });

    // Call rejected
    socket.on('call-rejected', (data) => {
      const { callerId } = data;
      const callerSocketId = connectedUsers.get(callerId);

      if (callerSocketId) {
        io.to(callerSocketId).emit('call-rejected', {
          rejectedBy: data.rejectedBy,
        });
      }
    });

    // Call ended
    socket.on('call-ended', (data) => {
      const { otherUserId } = data;
      const otherUserSocketId = connectedUsers.get(otherUserId);

      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit('call-ended', {
          endedBy: data.endedBy,
        });
      }
    });

    // WebRTC offer
    socket.on('webrtc-offer', (data) => {
      const { to, offer } = data;
      const recipientSocketId = connectedUsers.get(to);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('webrtc-offer', {
          offer,
          from: data.from,
        });
      }
    });

    // WebRTC answer
    socket.on('webrtc-answer', (data) => {
      const { to, answer } = data;
      const recipientSocketId = connectedUsers.get(to);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('webrtc-answer', {
          answer,
          from: data.from,
        });
      }
    });

    // ICE candidate
    socket.on('ice-candidate', (data) => {
      const { to, candidate } = data;
      const recipientSocketId = connectedUsers.get(to);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('ice-candidate', {
          candidate,
          from: data.from,
        });
      }
    });

    // User disconnect
    socket.on('disconnect', async () => {
      try {
        // Find and update user
        let userId = null;
        for (let [id, socketId] of connectedUsers) {
          if (socketId === socket.id) {
            userId = id;
            break;
          }
        }

        if (userId) {
          connectedUsers.delete(userId);

          // Update user status
          await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
          });

          // Broadcast user offline
          io.emit('user-offline', {
            userId,
            timestamp: new Date(),
          });

          console.log(`User ${userId} disconnected`);
        }
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = { initializeSocket, connectedUsers };
