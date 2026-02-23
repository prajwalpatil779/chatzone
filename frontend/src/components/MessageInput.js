/**
 * MessageInput Component - Modern WhatsApp style
 * Input bar with file upload, emoji, and send
 */

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../hooks/useCustomHooks';
import { createFormData } from '../utils/helpers';
import './MessageInput.css';

const MessageInput = ({ chatId, socket }) => {
  const { user } = useAuth();
  const { sendMessage, isLoading } = useMessages(chatId);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const emojis = ['😀', '😂', '😍', '🤔', '😎', '👍', '❤️', '🔥', '✨', '👌'];

  const handleTyping = (e) => {
    const text = e.target.value;
    setMessage(text);

    if (socket && !isTyping && text.length > 0) {
      setIsTyping(true);
      socket.emit('typing:start', { 
        chat: chatId,
        userId: user?._id,
        userName: user?.username,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('typing:stop', { 
          chat: chatId,
          userId: user?._id,
          userName: user?.username,
        });
      }
      setIsTyping(false);
    }, 1000);
  };

  const addEmoji = (emoji) => {
    setMessage(message + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview({
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url: event.target.result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const hasText = message.trim().length > 0;
    const hasFile = fileInputRef.current?.files?.[0];

    if (!hasText && !hasFile) {
      return;
    }

    const selectedFile = fileInputRef.current?.files?.[0];
    const messageType = selectedFile
      ? selectedFile.type.startsWith('image/')
        ? 'image'
        : 'file'
      : 'text';

    const formData = createFormData(selectedFile, {
      chatId,
      text: message,
      type: messageType,
    });

    try {
      await sendMessage(formData);
      setMessage('');
      removePreview();
      if (socket) {
        socket.emit('typing:stop', { chat: chatId });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="message-input-wrapper">
      {preview && (
        <div className="preview-container">
          {preview.type === 'image' ? (
            <img src={preview.url} alt="preview" className="preview-image" />
          ) : (
            <div className="preview-file">
              <div className="file-icon">📄</div>
              <span>{preview.name}</span>
            </div>
          )}
          <button
            type="button"
            className="remove-preview"
            onClick={removePreview}
          >
            ✕
          </button>
        </div>
      )}

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <button
          type="button"
          className="input-icon-btn emoji-btn"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Add emoji"
        >
          😊
        </button>

        {showEmojiPicker && (
          <div className="emoji-picker">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="input-icon-btn"
                onClick={() => addEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="input-icon-btn attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
        >
          📎
        </button>

        <input
          type="file"
          ref={fileInputRef}
          hidden
          onChange={handleFileSelect}
          accept="image/*,video/*,.pdf"
        />

        <div className="input-field-wrapper">
          <input
            type="text"
            className="input-field"
            placeholder="Aa"
            value={message}
            onChange={handleTyping}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className={`send-btn ${isLoading ? 'loading' : ''}`}
          disabled={isLoading || (!message.trim() && !fileInputRef.current?.files?.[0])}
          title="Send message"
        >
          {isLoading ? (
            <span className="spinner"></span>
          ) : (
            '➤'
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
