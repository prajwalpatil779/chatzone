/**
 * Socket.io Service
 * Real-time communication
 */

import io from 'socket.io-client';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

// Initialize socket connection
export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

// Get socket instance
export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

// Connect user
export const connectUser = (userId) => {
  const socketInstance = getSocket();
  socketInstance.emit('user-joined', userId);
};

// Join chat room
export const joinChat = (chatId) => {
  const socketInstance = getSocket();
  socketInstance.emit('join-chat', chatId);
};

// Leave chat room
export const leaveChat = (chatId) => {
  const socketInstance = getSocket();
  socketInstance.emit('leave-chat', chatId);
};

// Send typing indicator
export const sendTypingIndicator = (chatId, userId, userName) => {
  const socketInstance = getSocket();
  socketInstance.emit('typing:start', { chat: chatId, userId, userName });
};

// Stop typing indicator
export const stopTypingIndicator = (chatId, userId, userName) => {
  const socketInstance = getSocket();
  socketInstance.emit('typing:stop', { chat: chatId, userId, userName });
};

// Send message through socket
export const sendMessageViaSocket = (chatId, message) => {
  const socketInstance = getSocket();
  socketInstance.emit('send-message', { chatId, message });
};

// Mark message as delivered
export const markMessageDelivered = (chatId, messageId) => {
  const socketInstance = getSocket();
  socketInstance.emit('message-delivered', { chatId, messageId });
};

// Mark message as seen
export const markMessageSeen = (chatId, messageId, userId) => {
  const socketInstance = getSocket();
  socketInstance.emit('message-seen', { chatId, messageId, userId });
};

// Add reaction to message
export const addMessageReaction = (chatId, messageId, emoji, userId) => {
  const socketInstance = getSocket();
  socketInstance.emit('message-reaction', {
    chatId,
    messageId,
    emoji,
    userId,
  });
};

// Initiate call
export const initiateCall = (
  receiverId,
  callType,
  callerName,
  signalingData
) => {
  const socketInstance = getSocket();
  socketInstance.emit('call-initiated', {
    receiverId,
    callType,
    callerName,
    signalingData,
  });
};

// Accept call
export const acceptCall = (callerId, signalingData, acceptedBy) => {
  const socketInstance = getSocket();
  socketInstance.emit('call-accepted', {
    callerId,
    signalingData,
    acceptedBy,
  });
};

// Reject call
export const rejectCall = (callerId, rejectedBy) => {
  const socketInstance = getSocket();
  socketInstance.emit('call-rejected', { callerId, rejectedBy });
};

// End call
export const endCall = (otherUserId, endedBy) => {
  const socketInstance = getSocket();
  socketInstance.emit('call-ended', { otherUserId, endedBy });
};

// Send WebRTC offer
export const sendWebRTCOffer = (to, offer, from) => {
  const socketInstance = getSocket();
  socketInstance.emit('webrtc-offer', { to, offer, from });
};

// Send WebRTC answer
export const sendWebRTCAnswer = (to, answer, from) => {
  const socketInstance = getSocket();
  socketInstance.emit('webrtc-answer', { to, answer, from });
};

// Send ICE candidate
export const sendICECandidate = (to, candidate, from) => {
  const socketInstance = getSocket();
  socketInstance.emit('ice-candidate', { to, candidate, from });
};

// Listen for events
export const onUserOnline = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('user-online', callback);
};

export const onUserOffline = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('user-offline', callback);
};

export const onUserTyping = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('typing:start', callback);
};

export const onReceiveMessage = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('message:received', callback);
};

export const onMessageStatus = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('message-status', callback);
};

export const onReactionUpdate = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('reaction-update', callback);
};

export const onIncomingCall = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('incoming-call', callback);
};

export const onCallAccepted = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('call-accepted', callback);
};

export const onCallRejected = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('call-rejected', callback);
};

export const onCallEnded = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('call-ended', callback);
};

export const onWebRTCOffer = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('webrtc-offer', callback);
};

export const onWebRTCAnswer = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('webrtc-answer', callback);
};

export const onICECandidate = (callback) => {
  const socketInstance = getSocket();
  socketInstance.on('ice-candidate', callback);
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initializeSocket,
  getSocket,
  connectUser,
  joinChat,
  leaveChat,
  sendTypingIndicator,
  stopTypingIndicator,
  disconnectSocket,
};
