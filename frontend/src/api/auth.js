import api from "./axios";

// Login user
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

// Register user
export const registerUser = async (name, email, password, role) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
    role,
  });
  return response.data;
};

// Verify email token
export const verifyEmailToken = async (token) => {
  const response = await api.get(
    `/auth/verify?token=${encodeURIComponent(token)}`,
  );
  return response.data;
};

// Resend verification email
export const resendVerificationEmail = async (email) => {
  const response = await api.post("/auth/resend-verification", { email });
  return response.data;
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem("token");
};

// Save auth data to localStorage
export const saveAuthData = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// Clear auth data from localStorage
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};
