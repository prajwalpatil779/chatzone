/**
 * API Service
 * Centralized API calls
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (
  endpoint,
  method = 'GET',
  body = null,
  token = null
) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }

  return data;
};

// Auth Services
export const authService = {
  register: (username, email, password, confirmPassword) =>
    apiCall('/auth/register', 'POST', {
      username,
      email,
      password,
      confirmPassword,
    }),

  login: (email, password) =>
    apiCall('/auth/login', 'POST', { email, password }),

  logout: (token) => apiCall('/auth/logout', 'POST', null, token),

  getCurrentUser: (token) => apiCall('/auth/me', 'GET', null, token),

  updateProfile: (token, formData) =>
    fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((res) => res.json()),

  updateSettings: (token, settings) =>
    apiCall('/auth/settings', 'PUT', settings, token),

  updateFCMToken: (token, fcmToken) =>
    apiCall('/auth/fcm-token', 'POST', { fcmToken }, token),
};

// Chat Services
export const chatService = {
  createPrivateChat: (token, recipientId) =>
    apiCall('/chats/private', 'POST', { recipientId }, token),

  createGroupChat: (token, groupName, participants) =>
    apiCall('/chats/group', 'POST', { groupName, participants }, token),

  getUserChats: (token, page = 1, limit = 20) =>
    apiCall(`/chats?page=${page}&limit=${limit}`, 'GET', null, token),

  getChat: (token, chatId) =>
    apiCall(`/chats/${chatId}`, 'GET', null, token),

  updateGroupChat: (token, chatId, formData) =>
    fetch(`${API_URL}/chats/${chatId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then((res) => res.json()),

  addGroupMember: (token, chatId, userId) =>
    apiCall(`/chats/${chatId}/add-member`, 'POST', { userId }, token),

  removeGroupMember: (token, chatId, memberId) =>
    apiCall(
      `/chats/${chatId}/remove-member/${memberId}`,
      'DELETE',
      null,
      token
    ),

  archiveChat: (token, chatId) =>
    apiCall(`/chats/${chatId}/archive`, 'POST', null, token),

  unarchiveChat: (token, chatId) =>
    apiCall(`/chats/${chatId}/unarchive`, 'POST', null, token),

  deleteChat: (token, chatId) =>
    apiCall(`/chats/${chatId}`, 'DELETE', null, token),
};

// Message Services
export const messageService = {
  sendMessage: (token, chatId, formData) =>
    fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message');
      }
      return data;
    }),

  getMessages: (token, chatId, page = 1, limit = 30) =>
    apiCall(
      `/messages/${chatId}?page=${page}&limit=${limit}`,
      'GET',
      null,
      token
    ),

  editMessage: (token, messageId, text) =>
    apiCall(`/messages/${messageId}`, 'PUT', { text }, token),

  deleteMessageForMe: (token, messageId) =>
    apiCall(`/messages/${messageId}`, 'DELETE', null, token),

  deleteMessageForEveryone: (token, messageId) =>
    apiCall(
      `/messages/${messageId}/everyone`,
      'DELETE',
      null,
      token
    ),

  addReaction: (token, messageId, emoji) =>
    apiCall(
      `/messages/${messageId}/reaction`,
      'PUT',
      { emoji },
      token
    ),

  markMessageAsSeen: (token, messageId) =>
    apiCall(`/messages/${messageId}/seen`, 'PUT', null, token),

  searchMessages: (token, chatId, query, page = 1, limit = 20) =>
    apiCall(
      `/messages/search?chatId=${chatId}&query=${query}&page=${page}&limit=${limit}`,
      'GET',
      null,
      token
    ),
};

// User Services
export const userService = {
  searchUsers: (token, query, page = 1, limit = 20) =>
    apiCall(
      `/users/search?query=${query}&page=${page}&limit=${limit}`,
      'GET',
      null,
      token
    ),

  getUserProfile: (token, userId) =>
    apiCall(`/users/${userId}`, 'GET', null, token),

  getAllUsers: (token, page = 1, limit = 20) =>
    apiCall(
      `/users?page=${page}&limit=${limit}`,
      'GET',
      null,
      token
    ),

  getUserStatus: (token, userId) =>
    apiCall(`/users/${userId}/status`, 'GET', null, token),

  blockUser: (token, userId) =>
    apiCall(`/users/${userId}/block`, 'POST', null, token),

  unblockUser: (token, userId) =>
    apiCall(`/users/${userId}/unblock`, 'POST', null, token),

  getNotifications: (token, page = 1, limit = 20) =>
    apiCall(
      `/users/notifications?page=${page}&limit=${limit}`,
      'GET',
      null,
      token
    ),

  markNotificationAsRead: (token, notificationId) =>
    apiCall(
      `/users/notifications/${notificationId}/read`,
      'PUT',
      null,
      token
    ),
};

// Admin Services
export const adminService = {
  getAllUsers: (token, page = 1, limit = 20, search = '') =>
    apiCall(
      `/admin/users?page=${page}&limit=${limit}&search=${search}`,
      'GET',
      null,
      token
    ),

  banUser: (token, userId) =>
    apiCall(`/admin/users/${userId}/ban`, 'PUT', null, token),

  unbanUser: (token, userId) =>
    apiCall(`/admin/users/${userId}/unban`, 'PUT', null, token),

  getAllReports: (token, page = 1, limit = 20, status = '') =>
    apiCall(
      `/admin/reports?page=${page}&limit=${limit}&status=${status}`,
      'GET',
      null,
      token
    ),

  updateReportStatus: (token, reportId, status, resolution) =>
    apiCall(
      `/admin/reports/${reportId}`,
      'PUT',
      { status, resolution },
      token
    ),

  getDashboardStats: (token) =>
    apiCall('/admin/dashboard/stats', 'GET', null, token),
};

export default {
  authService,
  chatService,
  messageService,
  userService,
  adminService,
};
