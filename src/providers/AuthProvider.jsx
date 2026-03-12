import { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../lib/api";

const AuthContext = createContext(null);
const storageKey = "pulsechat-auth";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setBooting(false);
      return;
    }

    const parsed = JSON.parse(saved);
    setToken(parsed.token);
    setUser(parsed.user);
    setAuthToken(parsed.token);

    api
      .get("/auth/me")
      .then((response) => setUser(response.data))
      .catch(() => logout())
      .finally(() => setBooting(false));
  }, []);

  const saveAuth = (payload) => {
    localStorage.setItem(storageKey, JSON.stringify(payload));
    setAuthToken(payload.token);
    setToken(payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem(storageKey);
    setAuthToken("");
    setToken("");
    setUser(null);
  };

  const updateStoredUser = (nextUser) => {
    setUser(nextUser);
    if (token) {
      localStorage.setItem(storageKey, JSON.stringify({ token, user: nextUser }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        booting,
        saveAuth,
        setUser: updateStoredUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
