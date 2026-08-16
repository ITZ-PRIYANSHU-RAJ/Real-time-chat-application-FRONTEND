import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";

const UserSearch = ({ onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);

        const response = await api.get(
          `/users/search?query=${encodeURIComponent(query)}`
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

    const timer = setTimeout(searchUsers, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
      />

      {/* Search Results */}
      <AnimatePresence>
        {query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-0 right-0 top-14 z-50 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl"
          >
            {loading && (
              <div className="p-4 text-center text-sm text-slate-500">
                Searching...
              </div>
            )}

            {!loading && users.length === 0 && (
              <div className="p-4 text-center text-sm text-slate-500">
                No users found
              </div>
            )}

            {!loading &&
              users.map((searchUser) => (
                <motion.button
                  key={searchUser._id}
                  whileHover={{ x: 3 }}
                  onClick={() => {
                    onSelectUser(searchUser);
                    setQuery("");
                    setUsers([]);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-white/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 font-semibold text-white">
                    {searchUser.fullName
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {searchUser.fullName}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      @{searchUser.username}
                    </p>
                  </div>
                </motion.button>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSearch;