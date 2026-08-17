import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

import UserSearch from "../components/UserSearch.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import { socket } from "../lib/socket.js";

const Chat = () => {
  const { user, logout } = useAuth();

  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // ================= ONLINE USER STATUS =================

  useEffect(() => {
    const handleUserStatus = ({ userId, online }) => {
      console.log("User status:", userId, online);

      setOnlineUsers((previous) => {
        const updated = new Set(previous);

        if (online) {
          updated.add(userId.toString());
        } else {
          updated.delete(userId.toString());
        }

        return updated;
      });
    };

    socket.on("user-status", handleUserStatus);

    return () => {
      socket.off("user-status", handleUserStatus);
    };
  }, []);

  // ================= RENDER =================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex h-screen overflow-hidden">

        {/* ================= SIDEBAR ================= */}

        <motion.aside
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex w-full max-w-sm flex-col border-r border-white/10 bg-white/[0.03] backdrop-blur-xl"
        >

          {/* Header */}

          <div className="flex items-center justify-between border-b border-white/10 p-5">

            <div>
              <h1 className="text-xl font-bold">
                Talksy
              </h1>

              <p className="text-xs text-slate-400">
                Messages
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              Logout
            </motion.button>

          </div>

          {/* ================= CURRENT USER ================= */}

          <div className="border-b border-white/10 p-4">

            <div className="flex items-center gap-3">

              {/* Avatar */}

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 font-bold">
                {user?.fullName
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              {/* User Information */}

              <div className="min-w-0">

                <p className="truncate font-medium">
                  {user?.fullName}
                </p>

                <p className="truncate text-sm text-slate-400">
                  @{user?.username}
                </p>

              </div>

              {/* Online indicator */}

              <span className="ml-auto h-2.5 w-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/40" />

            </div>

          </div>

          {/* ================= SEARCH ================= */}

          <div className="border-b border-white/10 p-4">

            <UserSearch
              onSelectUser={(selectedUser) => {
                setSelectedUser(selectedUser);
              }}
            />

          </div>

          {/* ================= SELECTED USER ================= */}

          <div className="flex-1 overflow-y-auto px-3 py-4">

            <p className="px-2 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              Current Chat
            </p>

            {selectedUser ? (

              <motion.button
                initial={{
                  opacity: 0,
                  x: -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                onClick={() =>
                  setSelectedUser(selectedUser)
                }
                className="flex w-full items-center gap-3 rounded-xl bg-white/5 p-3 text-left transition hover:bg-white/10"
              >

                {/* Avatar */}

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 font-semibold">
                  {selectedUser.fullName
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                {/* User information */}

                <div className="min-w-0">

                  <p className="truncate text-sm font-medium">
                    {selectedUser.fullName}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    @{selectedUser.username}
                  </p>

                </div>

                {/* Online indicator */}

                <span
                  className={`ml-auto h-2.5 w-2.5 rounded-full ${
                    onlineUsers.has(
                      selectedUser._id.toString()
                    )
                      ? "bg-green-400 shadow-lg shadow-green-400/40"
                      : "bg-slate-600"
                  }`}
                />

              </motion.button>

            ) : (

              <div className="rounded-xl p-4 text-center text-sm text-slate-500">
                Search for a user to start chatting.
              </div>

            )}

          </div>

          {/* ================= FOOTER ================= */}

          <div className="border-t border-white/10 p-4">

            <p className="text-center text-xs text-slate-600">
              Talksy • Real-time Chat
            </p>

          </div>

        </motion.aside>

        {/* ================= CHAT WINDOW ================= */}

        <ChatWindow
          selectedUser={selectedUser}
          currentUser={user}
          isOnline={
            selectedUser
              ? onlineUsers.has(
                  selectedUser._id.toString()
                )
              : false
          }
        />

      </div>
    </div>
  );
};

export default Chat;