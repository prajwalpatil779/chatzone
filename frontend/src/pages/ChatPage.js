/**
 * Chat Page
 * Main chat interface
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { initializeSocket, getSocket, connectUser, disconnectSocket } from '../services/socketService';
import Navbar from '../components/Navbar';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import UserSearchModal from '../components/UserSearchModal';
import SettingsModal from '../components/SettingsModal';
import './ChatPage.css';

const ChatPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentChat, setCurrentChat, createPrivateChat, fetchChats } = useChat();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize socket on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeSocket();
      const io = getSocket();
      setSocket(io);
      connectUser(user._id);
      fetchChats();

      return () => {
        disconnectSocket();
      };
    }
  }, [isAuthenticated, user, fetchChats]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setCurrentChat(chat);
  };

  const handleSelectUser = async (selectedUser) => {
    try {
      const chat = await createPrivateChat(selectedUser._id);
      handleSelectChat(chat);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-page">
      <Navbar
        onOpenSettings={() => setShowSettings(true)}
        onOpenSearch={() => setShowSearch(true)}
      />

      <div className="chat-main">
        <ChatList
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChat?._id}
        />

        <ChatWindow chat={selectedChat || currentChat} socket={socket} />
      </div>

      {showSearch && (
        <UserSearchModal
          onSelectUser={handleSelectUser}
          onClose={() => setShowSearch(false)}
        />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default ChatPage;
