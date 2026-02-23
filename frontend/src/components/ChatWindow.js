/**
 * ChatWindow Component - Modern WhatsApp style
 * Main chat display area with real-time features
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const ChatWindow = ({ chat, socket }) => {
  const { user } = useAuth();
  const [recipientOnline, setRecipientOnline] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!chat || !socket) return;

    // Join chat room
    socket.emit('join-chat', chat._id);

    // Listen for typing events
    socket.on('typing:start', (data) => {
      if (data.chat === chat._id && data.userId !== user?._id) {
        setTypingUsers((prev) => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });
      }
    });

    socket.on('typing:stop', (data) => {
      if (data.chat === chat._id) {
        setTypingUsers((prev) =>
          prev.filter((name) => name !== data.userName)
        );
      }
    });

    // Listen for online/offline status
    socket.on('user-online', (data) => {
      if (
        chat.chatType === 'private' &&
        chat.participants.some((p) => p._id === data.userId)
      ) {
        setRecipientOnline(true);
      }
    });

    socket.on('user-offline', (data) => {
      if (
        chat.chatType === 'private' &&
        chat.participants.some((p) => p._id === data.userId)
      ) {
        setRecipientOnline(false);
      }
    });

    return () => {
      socket.emit('leave-chat', chat._id);
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('user-online');
      socket.off('user-offline');
    };
  }, [chat, socket, user]);

  if (!chat) {
    return (
      <div className="chat-window empty">
        <div className="empty-message">
          <div className="empty-icon">💬</div>
          <h2>Select a chat to start messaging</h2>
          <p>Choose from your conversations or start a new one</p>
        </div>
      </div>
    );
  }

  const getChatName = () => {
    if (chat.chatType === 'private') {
      const otherParticipant = chat.participants.find(
        (p) => p._id !== user?._id
      );
      return otherParticipant?.username;
    }
    return chat.groupName;
  };

  const getChatAvatar = () => {
    if (chat.chatType === 'private') {
      const otherParticipant = chat.participants.find(
        (p) => p._id !== user?._id
      );
      return otherParticipant?.profilePicture;
    }
    return chat.groupIcon;
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-avatar">
          <img
            src={getChatAvatar() || '/default-avatar.svg'}
            alt={getChatName()}
          />
        </div>

        <div className="chat-header-info">
          <h2>{getChatName()}</h2>
          {chat.chatType === 'private' && (
            <p className={`status ${recipientOnline ? 'online' : 'offline'}`}>
              {recipientOnline ? '🟢 Online' : '⚪ Offline'}
            </p>
          )}
          {typingUsers.length > 0 && (
            <p className="typing-status">
              {typingUsers.join(', ')} typing...
            </p>
          )}
        </div>

        <div className="chat-header-actions">
          <button className="header-icon-btn" title="Voice call">
            📞
          </button>
          <button className="header-icon-btn" title="Video call">
            🎥
          </button>
          <button className="header-icon-btn" title="More options">
            ⋮
          </button>
        </div>
      </div>

      <MessageList
        chatId={chat._id}
        socket={socket}
        typingUsers={typingUsers}
      />

      <MessageInput chatId={chat._id} socket={socket} />
    </div>
  );
};

export default ChatWindow;
