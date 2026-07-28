import apiClient from './apiClient';

// ==========================================
// AUTHENTICATION & USERS
// ==========================================

export const loginUser = async (email, password) => {
  const response = await apiClient.post('/users/login', { email, password });
  return response.data;
};

export const signupUser = async (userData) => {
  const response = await apiClient.post('/users/signup', userData);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await apiClient.post('/users/forgotPassword', { email });
  return response.data;
};

export const resetPassword = async (token, password, passwordConfirm) => {
  const response = await apiClient.patch(`/users/resetPassword/${token}`, { password, passwordConfirm });
  return response.data;
};

export const verifyOTP = async (userId, otp) => {
  const response = await apiClient.post('/users/verify-otp', { userId, otp });
  return response.data;
};

export const toggleTwoFactor = async () => {
  const response = await apiClient.patch('/users/toggle-2fa');
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await apiClient.get(`/users/verify/${token}`);
  return response.data;
};

export const updatePassword = async (password, newPassword, newPasswordConfirm) => {
  const response = await apiClient.patch('/users/updatePassword', { password, newPassword, newPasswordConfirm });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

export const updateProfile = async (userData, photoFile) => {
  const formData = new FormData();
  if (userData.name) formData.append('name', userData.name);
  if (userData.location) formData.append('location', userData.location);
  if (photoFile) formData.append('photo', photoFile);

  const response = await apiClient.patch('/users/updateMe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

export const searchUsers = async (query) => {
  if (!query) return { data: { result: [] } };
  const response = await apiClient.get(`/users/search?searched=${query}`);
  return response.data;
};

export const followUser = async (userId) => {
  const response = await apiClient.post(`/users/follow/${userId}`);
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await apiClient.delete(`/users/follow/${userId}`);
  return response.data;
};

export const acceptFollow = async (userId) => {
  const response = await apiClient.post(`/users/follow/${userId}/accept`);
  return response.data;
};

export const declineFollow = async (userId) => {
  const response = await apiClient.post(`/users/follow/${userId}/decline`);
  return response.data;
};

export const getUserFollowers = async (userId, page = 1, limit = 20) => {
  const response = await apiClient.get(`/users/${userId}/followers?page=${page}&limit=${limit}`);
  return response.data;
};

export const getUserFollowing = async (userId, page = 1, limit = 20) => {
  const response = await apiClient.get(`/users/${userId}/following?page=${page}&limit=${limit}`);
  return response.data;
};

// ==========================================
// POSTS & FEED
// ==========================================

export const getFeedPosts = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`/posts/feed?page=${page}&limit=${limit}`);
  return response.data.data?.feedPost || [];
};

export const getAllPosts = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`/posts?page=${page}&limit=${limit}`);
  return response.data.data?.data || [];
};

export const getUserPosts = async (userId, page = 1, limit = 10) => {
  const response = await apiClient.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
  return response.data.data?.data || [];
};

export const createPost = async (content, mediaFiles = []) => {
  const formData = new FormData();
  if (content) formData.append('content', content);
  mediaFiles.forEach(file => formData.append('media', file));

  const response = await apiClient.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updatePost = async (postId, content, existingMedia, newMediaFiles) => {
  const formData = new FormData();
  if (content) formData.append('content', content);
  
  if (existingMedia && existingMedia.length > 0) {
    existingMedia.forEach(media => {
      formData.append('existingMedia', media);
    });
  }

  if (newMediaFiles && newMediaFiles.length > 0) {
    newMediaFiles.forEach(file => {
      formData.append('media', file);
    });
  }

  const response = await apiClient.patch(`/posts/${postId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await apiClient.delete(`/posts/${postId}`);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await apiClient.post(`/posts/${postId}/likes`);
  return response.data;
};

// ==========================================
// COMMENTS
// ==========================================

export const getComments = async (postId) => {
  const response = await apiClient.get(`/posts/${postId}/comments`);
  return response.data.data?.data || response.data.data?.comments || [];
};

export const addComment = async (postId, content) => {
  const response = await apiClient.post(`/posts/${postId}/comments`, { content });
  return response.data.data?.comment || response.data.data?.data || response.data;
};

export const getReplies = async (commentId) => {
  const response = await apiClient.get(`/comments/${commentId}/reply`);
  return response.data.data?.replies || response.data.data || [];
};

export const addReply = async (commentId, postId, content) => {
  const response = await apiClient.post(`/comments/${commentId}/reply`, { content, post: postId });
  return response.data.data?.comment || response.data.data?.data || response.data;
};

export const updateComment = async (commentId, content) => {
  const response = await apiClient.patch(`/comments/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await apiClient.delete(`/comments/${commentId}`);
  return response.data;
};

export const likeComment = async (commentId) => {
  const response = await apiClient.post(`/comments/${commentId}/likes`);
  return response.data;
};

// ==========================================
// NOTIFICATIONS
// ==========================================

export const getNotifications = async () => {
  const response = await apiClient.get('/notifications');
  return response.data.notifications || response.data.data?.notifications || [];
};

export const markNotificationsRead = async () => {
  const response = await apiClient.patch('/notifications/read-all');
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await apiClient.delete(`/notifications/${notificationId}`);
  return response.data;
};

// ==========================================
// BOOKMARKS
// ==========================================

export const getBookmarks = async () => {
  const response = await apiClient.get('/bookmarks');
  return response.data.data?.bookMarks || [];
};

export const bookmarkPost = async (postId) => {
  const response = await apiClient.post(`/posts/${postId}/bookmark`);
  return response.data;
};

export const unbookmarkPost = async (postId) => {
  const response = await apiClient.delete(`/posts/${postId}/bookmark`);
  return response.data;
};
