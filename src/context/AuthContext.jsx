import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api.js";
import { socket } from "../lib/socket.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/me");

      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const loggedInUser = response.data.user;

      setUser(loggedInUser);

      socket.connect();

      socket.emit("user-online", loggedInUser._id);

      return {
        success: true,
        user: loggedInUser,
      };
    } catch (error) {
      console.error(
        "Login Error:",
        error.response?.data?.message || error.message
      );

      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);

      const registeredUser = response.data.user;

      setUser(registeredUser);

      socket.connect();

      socket.emit("user-online", registeredUser._id);

      return {
        success: true,
        user: registeredUser,
      };
    } catch (error) {
      console.error(
        "Register Error:",
        error.response?.data?.message || error.message
      );

      return {
        success: false,
        message:
          error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");

      socket.disconnect();
      setUser(null);
    } catch (error) {
      console.error(
        "Logout Error:",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user?._id && !socket.connected) {
      socket.connect();
      socket.emit("user-online", user._id);
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};