import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api.js";
import { socket } from "../lib/socket.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // CHECK AUTH
  // ==========================================

  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/me");

      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log(
        "Auth check:",
        error.response?.data?.message || error.message
      );

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
          email,
          password,
        });

        const { user, token } = response.data;

        localStorage.setItem("token", token);

setUser(user);

      const loggedInUser = response.data.user;

      setUser(loggedInUser);

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

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (userData) => {
    try {
            const response = await api.post("/auth/register", {
        fullName,
        username,
        email,
        password,
      });

      const { user, token } = response.data;

      localStorage.setItem("token", token);

      setUser(user);

      const registeredUser = response.data.user;

      setUser(registeredUser);

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
          error.response?.data?.message ||
          "Registration failed",
      };
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error(
      "Logout Error:",
      error.response?.data?.message
    );
  } finally {
    localStorage.removeItem("token");
    setUser(null);
  }
};
  // ==========================================

  useEffect(() => {
    checkAuth();
  }, []);

  // ==========================================
  // SOCKET CONNECTION
  // ==========================================

  useEffect(() => {
    if (!user?._id) return;

    const handleConnect = () => {
      console.log(
        "🟢 Socket connected:",
        socket.id
      );

      socket.emit("user-online", user._id);
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [user?._id]);

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

// ==========================================
// CUSTOM HOOK
// ==========================================

export const useAuth = () => {
  return useContext(AuthContext);
};