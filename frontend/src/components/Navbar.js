/**
 * Navbar Component
 * Top navigation bar
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = ({ onOpenSettings, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <img src="/logo.png" alt="chrome1" />
        </div>
        <h1 className="navbar-brand">chrome1</h1>
      </div>

      <div className="navbar-center">
        <button
          className="nav-btn"
          onClick={onOpenSearch}
          title="Search"
        >
          🔍
        </button>
      </div>

      <div className="navbar-right">
        <button
          className="nav-btn"
          title="Toggle theme"
          onClick={toggleTheme}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        <button
          className="nav-btn"
          onClick={onOpenSettings}
          title="Settings"
        >
          ⚙️
        </button>

        <div className="navbar-user">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.username}
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar-placeholder">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          )}
          <span>{user?.username}</span>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
