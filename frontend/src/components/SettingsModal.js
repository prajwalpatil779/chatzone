/**
 * SettingsModal Component
 * User settings and profile
 */

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './SettingsModal.css';

const SettingsModal = ({ onClose }) => {
  const { user, token, logout, getCurrentUser } = useAuth();
  const fileInputRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notificationsEnabled ?? true
  );
  const [soundEnabled, setSoundEnabled] = useState(user?.soundEnabled ?? true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || '');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setUsername(user?.username || '');
    setBio(user?.bio || '');
    setPhoneNumber(user?.phoneNumber || '');
    setNotificationsEnabled(user?.notificationsEnabled ?? true);
    setSoundEnabled(user?.soundEnabled ?? true);
    setPreviewUrl(user?.profilePicture || '');
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setStatusMessage('');

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      formData.append('phoneNumber', phoneNumber);
      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }

      const profileResponse = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const profileData = await profileResponse.json();
      if (!profileResponse.ok) {
        throw new Error(profileData.message || 'Failed to update profile');
      }

      const settingsResponse = await fetch(`${API_URL}/auth/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationsEnabled, soundEnabled }),
      });
      const settingsData = await settingsResponse.json();
      if (!settingsResponse.ok) {
        throw new Error(settingsData.message || 'Failed to update settings');
      }

      await getCurrentUser();
      setStatusMessage('Profile updated');
    } catch (error) {
      setStatusMessage(error.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-modal" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>Profile Settings</h2>
          <button className="settings-modal-close" onClick={onClose}>
            x
          </button>
        </div>

        <div className="settings-modal-body">
          <div className="settings-group">
            <label>Profile Picture</label>
            <div className="settings-avatar-row">
              <img
                src={previewUrl || '/default-avatar.svg'}
                alt="profile"
                className="settings-avatar"
              />
              <button
                type="button"
                className="settings-button"
                style={{ marginTop: 0, width: 'auto' }}
                onClick={() => fileInputRef.current?.click()}
              >
                Change
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </div>

          <div className="settings-group">
            <label>Username</label>
            <input
              className="settings-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="settings-group">
            <label>Phone Number</label>
            <input
              className="settings-input"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="settings-group">
            <label>Bio</label>
            <textarea
              className="settings-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
            />
          </div>

          <div className="settings-group">
            <label>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />{' '}
              Notifications
            </label>
            <label>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />{' '}
              Sound
            </label>
          </div>

          {statusMessage && (
            <div style={{ fontSize: '13px', marginTop: '8px' }}>{statusMessage}</div>
          )}

          <button
            className="settings-button"
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            className="settings-button"
            style={{ backgroundColor: '#d64545', marginTop: '10px' }}
            onClick={async () => {
              await logout();
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
