/**
 * Chat Context
 * Global state for chat data
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { token } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch all chats
  const fetchChats = useCallback(async (page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/chats?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setChats(data.data.chats);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, token]);

  // Fetch messages
  const fetchMessages = useCallback(async (chatId, page = 1, limit = 30) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/messages/${chatId}?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessages(data.data.messages);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, token]);

  // Create private chat
  const createPrivateChat = useCallback(async (recipientId) => {
    try {
      const response = await fetch(`${API_URL}/chats/private`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentChat(data.data);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [API_URL, token]);

  // Create group chat
  const createGroupChat = useCallback(async (groupName, participants) => {
    try {
      const response = await fetch(`${API_URL}/chats/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupName, participants }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentChat(data.data);
        setChats([...chats, data.data]);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [API_URL, token, chats]);

  const value = {
    chats,
    currentChat,
    messages,
    isLoading,
    error,
    setCurrentChat,
    setMessages,
    fetchChats,
    fetchMessages,
    createPrivateChat,
    createGroupChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
