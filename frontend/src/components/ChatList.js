/**
 * ChatList Component
 * Display list of chats
 */

import React, { useState, useEffect } from 'react';
import {useChat} from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { getInitials, getRandomColor, truncateText, formatTime } from '../utils/helpers';
import './ChatList.css';

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const { user } = useAuth();
  const { chats, fetchChats, isLoading } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredChats(chats);
      return;
    }

    const filtered = chats.filter((chat) => {
      if (chat.chatType === 'private') {
        // Find the other participant
        const otherParticipant = chat.participants.find(
          (p) => p._id !== user?._id
        );
        return otherParticipant?.username
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      } else {
        return chat.groupName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
    });

    setFilteredChats(filtered);
  }, [searchQuery, chats, user]);

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Chats</h2>
      </div>

      <div className="chat-list-search">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="chat-list-container">
        {isLoading ? (
          <div className="loading">Loading chats...</div>
        ) : filteredChats.length === 0 ? (
          <div className="no-chats">No chats yet</div>
        ) : (
          filteredChats.map((chat) => {
            const otherParticipant = chat.participants.find(
              (p) => p._id !== user?._id
            );
            const chatName =
              chat.chatType === 'private'
                ? otherParticipant?.username
                : chat.groupName;
            const lastMessageText = chat.lastMessage
              ? truncateText(chat.lastMessage.text, 40)
              : 'No messages yet';
            const isSelected = selectedChatId === chat._id;

            return (
              <div
                key={chat._id}
                className={`chat-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="chat-avatar" style={{
                  backgroundColor: getRandomColor(chatName),
                }}>
                  {chat.chatType === 'private' && otherParticipant?.profilePicture ? (
                    <img src={otherParticipant.profilePicture} alt={chatName} />
                  ) : chat.groupIcon ? (
                    <img src={chat.groupIcon} alt={chatName} />
                  ) : (
                    getInitials(chatName)
                  )}
                </div>

                <div className="chat-info">
                  <h3 className="chat-name">{chatName}</h3>
                  <p className="chat-preview">{lastMessageText}</p>
                </div>

                <div className="chat-time">
                  {chat.lastMessageTime && (
                    <span>{formatTime(chat.lastMessageTime)}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;
