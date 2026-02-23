/**
 * MessageList Component - Modern WhatsApp/Instagram style
 * Display messages in real-time with animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../hooks/useCustomHooks';
import { messageService } from '../services/apiService';
import { formatClockTime, formatMessageDate } from '../utils/helpers';
import './MessageList.css';

const MessageList = ({ chatId, socket, typingUsers = [] }) => {
  const { user, token } = useAuth();
  const { messages, fetchMessages, setMessages } = useMessages(chatId);
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [groupedMessages, setGroupedMessages] = useState({});
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const prevMessageCountRef = useRef(0);
  const prevLastMessageIdRef = useRef('');

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleContainerScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom < 120;
    setIsNearBottom(nearBottom);
    setAutoScrollEnabled(nearBottom);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleContainerScroll);
    return () => {
      container.removeEventListener('scroll', handleContainerScroll);
    };
  }, []);

  useEffect(() => {
    setAutoScrollEnabled(true);
    setIsNearBottom(true);
    prevMessageCountRef.current = 0;
    prevLastMessageIdRef.current = '';
    setTimeout(() => scrollToBottom('auto'), 0);
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      // Listen for real-time messages
      if (socket) {
        socket.on('message:received', (newMessage) => {
          const incomingChatId =
            typeof newMessage.chat === 'object'
              ? newMessage.chat?._id
              : newMessage.chat;

          // Compare chat IDs as strings
          if (incomingChatId?.toString() === chatId?.toString()) {
            setMessages((prev) => {
              // Avoid duplicates
              const exists = prev.some((m) => m._id === newMessage._id);
              return exists ? prev : [...prev, newMessage];
            });

            // Receiver acknowledges delivery so sender gets "delivered" status
            if (newMessage.sender?._id !== user?._id) {
              socket.emit('message-delivered', {
                chatId,
                messageId: newMessage._id,
              });
            }
          }
        });

        socket.on('message:updated', (updatedMessage) => {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === updatedMessage._id ? updatedMessage : m
            )
          );
        });

        socket.on('message-status', ({ messageId, status }) => {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId ? { ...m, status } : m
            )
          );
        });
      }

      return () => {
        if (socket) {
          socket.off('message:received');
          socket.off('message:updated');
          socket.off('message-status');
        }
      };
    }
  }, [chatId, fetchMessages, socket, setMessages, user]);

  // Mark incoming unseen messages as seen when this chat is open
  useEffect(() => {
    if (!chatId || !socket || !token || !user?._id || messages.length === 0) {
      return;
    }

    const markSeen = async () => {
      const unseenIncoming = messages.filter(
        (m) => m.sender?._id !== user._id && m.status !== 'seen'
      );

      for (const message of unseenIncoming) {
        try {
          await messageService.markMessageAsSeen(token, message._id);
          setMessages((prev) =>
            prev.map((m) =>
              m._id === message._id ? { ...m, status: 'seen' } : m
            )
          );
        } catch (error) {
          console.error('Error marking message as seen:', error);
        }
      }
    };

    markSeen();
  }, [messages, chatId, socket, token, user, setMessages]);

  // WhatsApp-like behavior:
  // auto-scroll only on real new appended messages (not on status edits/updates)
  // and only if user is near bottom (or sender is current user).
  useEffect(() => {
    if (messages.length === 0) return;

    const currentCount = messages.length;
    const lastMessage = messages[messages.length - 1];
    const currentLastMessageId = lastMessage?._id || '';
    const isOwnLatestMessage = lastMessage?.sender?._id === user?._id;
    const isAppendedNewMessage =
      currentCount > prevMessageCountRef.current ||
      currentLastMessageId !== prevLastMessageIdRef.current;

    if (isAppendedNewMessage && (autoScrollEnabled || isOwnLatestMessage)) {
      scrollToBottom('smooth');
    }

    prevMessageCountRef.current = currentCount;
    prevLastMessageIdRef.current = currentLastMessageId;
  }, [messages, autoScrollEnabled, user]);

  // Group messages by date
  useEffect(() => {
    const groups = {};
    messages.forEach((msg) => {
      const date = formatMessageDate(msg.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    setGroupedMessages(groups);
  }, [messages]);

  const renderMessage = (message, isOwn) => {
    return (
      <div key={message._id} className={`message-bubble ${isOwn ? 'sent' : 'received'} ${message.type}`}>
        {!isOwn && (
          <div className="message-avatar">
            <img
              src={message.sender.profilePicture || '/default-avatar.svg'}
              alt={message.sender.username}
              title={message.sender.username}
            />
          </div>
        )}

        <div className="message-container">
          <div className="message-content">
            {message.type === 'text' && (
              <p className="message-text">{message.text}</p>
            )}

            {message.type === 'image' && message.media ? (
              <div>
                <img
                  src={message.media.url}
                  alt="message"
                  className="message-image"
                  loading="lazy"
                  onClick={() => setPreviewImageUrl(message.media.url)}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ) : message.type === 'image' ? (
              <p className="message-text">⚠️ Image not available</p>
            ) : null}
          </div>

          <div className="message-footer">
            <span className="message-time">
              {formatClockTime(message.createdAt)}
            </span>

            {message.edited && (
              <span className="message-edited">(edited)</span>
            )}

            {isOwn && message.status && (
              <span className={`message-status ${message.status}`}>
                {message.status === 'sent' && '✓'}
                {message.status === 'delivered' && '✓✓'}
                {message.status === 'seen' && '✓✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="message-list-container" ref={scrollContainerRef}>
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No messages yet</h3>
          <p>Start the conversation by sending a message!</p>
        </div>
      ) : (
        <div className="messages-wrapper">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="date-divider">
                <span>{date}</span>
              </div>
              {msgs.map((message) =>
                renderMessage(message, message.sender._id === user?._id)
              )}
            </div>
          ))}

          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <span>{typingUsers.join(', ')} is typing...</span>
            </div>
          )}
        </div>
      )}

      {!isNearBottom && (
        <button
          className="scroll-bottom-btn"
          onClick={() => {
            setAutoScrollEnabled(true);
            setIsNearBottom(true);
            scrollToBottom('smooth');
          }}
          title="Jump to latest messages"
        >
          Jump to latest
        </button>
      )}

      {previewImageUrl && (
        <div
          className="image-preview-overlay"
          onClick={() => setPreviewImageUrl('')}
        >
          <img
            src={previewImageUrl}
            alt="preview"
            className="image-preview-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
