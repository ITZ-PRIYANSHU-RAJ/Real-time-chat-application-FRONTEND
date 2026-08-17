import { useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api.js";

const UserSearch = ({ onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    const value = e.target.value;

    setQuery(value);

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get(
        `/users/search?query=${encodeURIComponent(value)}`
      );

      setUsers(response.data.users || []);
    } catch (error) {
      console.error(
        "Search error:",
        error.response?.data?.message || error.message
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    onSelectUser(user);
    setQuery("");
    setUsers([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleSearch}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
      />

      {query && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-2xl"
        >
          {loading && (
            <p className="p-4 text-sm text-slate-400">
              Searching...
            </p>
          )}

          {!loading && users.length === 0 && (
            <p className="p-4 text-sm text-slate-400">
              No users found
            </p>
          )}

          {!loading &&
            users.map((user) => (
              <button
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 font-semibold text-white">
                  {user.fullName?.charAt(0)?.toUpperCase()}
                </div>

                <div>
                  <p className="font-medium text-white">
                    {user.fullName}
                  </p>

                  <p className="text-xs text-slate-500">
                    @{user.username}
                  </p>
                </div>
              </button>
            ))}
        </motion.div>
      )}
    </div>
  );
};

export default UserSearch;