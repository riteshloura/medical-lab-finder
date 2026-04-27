import api from "./axios";

// Fetch user profile data
export const getUserProfile = async (userId) => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

// Update user profile data
export const updateUserProfile = async (userId, data) => {
  const response = await api.put(`/user/${userId}`, data);
  return response.data;
};

// Delete user account
export const deleteUserProfile = async (userId) => {
  const response = await api.delete(`/user/${userId}`);
  return response.data;
};
