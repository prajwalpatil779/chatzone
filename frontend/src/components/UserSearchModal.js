/**
 * UserSearchModal Component
 * Search and add users
 */

import React, { useState } from 'react';
import { useUserSearch } from '../hooks/useCustomHooks';
import { getInitials, getRandomColor } from '../utils/helpers';
import './UserSearchModal.css';

const UserSearchModal = ({ onSelectUser, onClose }) => {
  const [query, setQuery] = useState('');
  const { results, isLoading, search } = useUserSearch();

  const handleSearch = (value) => {
    setQuery(value);
    if (value) {
      search(value);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Search Users</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="Search by username or email..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          autoFocus
        />

        <div className="search-results">
          {isLoading && <p>Searching...</p>}
          {!isLoading && query && results.length === 0 && (
            <p>No users found</p>
          )}
          {results.map((user) => (
            <div
              key={user._id}
              className="user-result"
              onClick={() => {
                onSelectUser(user);
                onClose();
              }}
            >
              <div className="result-avatar" style={{
                backgroundColor: getRandomColor(user.username),
              }}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.username} />
                ) : (
                  getInitials(user.username)
                )}
              </div>

              <div className="result-info">
                <h4>{user.username}</h4>
                <p>{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
