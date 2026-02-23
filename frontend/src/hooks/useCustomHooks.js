/**
 * Custom Hooks
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService, messageService, userService } from '../services/apiService';

// Hook for handling API calls
export const useApi = (initialData = null) => {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (fn) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result?.data || result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, setData, execute };
};

// Hook for chat operations
export const useChat = () => {
  const { token } = useAuth();
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await chatService.getUserChats(token);
      setChats(result.data.chats);
      return result.data.chats;
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const createChat = useCallback(
    async (recipientId) => {
      try {
        const result = await chatService.createPrivateChat(
          token,
          recipientId
        );
        setChats([result.data, ...chats]);
        return result.data;
      } catch (err) {
        console.error('Error creating chat:', err);
      }
    },
    [token, chats]
  );

  return { chats, isLoading, fetchChats, createChat, setChats };
};

// Hook for messages
export const useMessages = (chatId) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;

    setIsLoading(true);
    try {
      const result = await messageService.getMessages(token, chatId);
      setMessages(result.data.messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, token]);

  const sendMessage = useCallback(
    async (formData) => {
      try {
        const result = await messageService.sendMessage(
          token,
          chatId,
          formData
        );
        // Make sure we have a message object
        const newMessage = result.data || result;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        return newMessage;
      } catch (err) {
        console.error('Error sending message:', err);
        throw err;
      }
    },
    [chatId, token]
  );

  const editMessage = useCallback(
    async (messageId, text) => {
      try {
        const result = await messageService.editMessage(
          token,
          messageId,
          text
        );
        const updated = messages.map((m) =>
          m._id === messageId ? result.data : m
        );
        setMessages(updated);
        return result.data;
      } catch (err) {
        console.error('Error editing message:', err);
        throw err;
      }
    },
    [token, messages]
  );

  return {
    messages,
    isLoading,
    fetchMessages,
    sendMessage,
    editMessage,
    setMessages,
  };
};

// Hook for user search
export const useUserSearch = () => {
  const { token } = useAuth();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(
    async (query) => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const result = await userService.searchUsers(token, query);
        setResults(result.data.users);
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  return { results, isLoading, search };
};

// Hook for notifications (polling)
export const useNotifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await userService.getNotifications(token);
        setNotifications(result.data.notifications);
        setUnreadCount(result.data.unreadCount);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [token]);

  return { notifications, unreadCount };
};

export default { useApi, useChat, useMessages, useUserSearch, useNotifications };
