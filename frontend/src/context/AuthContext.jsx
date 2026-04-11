import { createContext, useContext, useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  saveAuthData,
  clearAuthData,
  getCurrentUser,
  isAuthenticated,
  getToken,
} from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser && isAuthenticated()) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await loginUser(email, password);

      const userData = {
        name: response.name,
        userId: response.userId,
        email: response.email,
        role: response.role,
      };

      saveAuthData(response.token, userData);
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Login failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (name, email, password, role = "USER") => {
    try {
      setError(null);
      setLoading(true);
      const response = await registerUser(name, email, password, role);
      setLoading(false);
      return {
        success: true,
        message: response?.message || "Registration successful.",
        emailSent: response?.emailSent ?? false,
      };
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        "Registration failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    clearAuthData();
    setUser(null);
  };

  const updateUserContext = (updatedData) => {
    const newData = { ...user, ...updatedData };
    setUser(newData);
    saveAuthData(getToken(), newData);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isLabOwner: user?.role === "LAB_OWNER",
    login,
    register,
    logout,
    updateUserContext,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
