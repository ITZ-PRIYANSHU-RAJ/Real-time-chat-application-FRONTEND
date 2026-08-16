import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import api from "../services/api.js";
import { socket } from "../lib/socket.js";
import { useAuth } from "../context/AuthContext.jsx";

const ChatWindow = ({ selectedUser }) => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(false);

  const [isOnline, setIsOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // ==========================================
  // GET OLD MESSAGES
  // ==========================================

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id) {
        setMessages([]);
        return;
      }

      try {
        setLoading(true);
        setIsTyping(false);

        const response = await api.get(
          `/messages/${selectedUser._id}`
        );

        setMessages(response.data.messages || []);
      } catch (error) {
        console.error(
          "Get Messages Error:",
          error.response?.data?.message || error.message
        );

        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  // ==========================================
  // RECEIVE REAL-TIME MESSAGE
  // ==========================================

  useEffect(() => {
    const handleNewMessage = (message) => {
      const senderId =
        message.sender?._id || message.sender;

      const receiverId =
        message.receiver?._id || message.receiver;

      const currentUserId =
        user?._id?.toString();

      const selectedUserId =
        selectedUser?._id?.toString();

      const isCurrentConversation =
        (senderId?.toString() === selectedUserId &&
          receiverId?.toString() === currentUserId) ||
        (senderId?.toString() === currentUserId &&
          receiverId?.toString() === selectedUserId);

      if (!isCurrentConversation) {
        return;
      }

      setMessages((prev) => {
        const alreadyExists = prev.some(
          (msg) => msg._id === message._id
        );

        if (alreadyExists) {
          return prev;
        }

        return [...prev, message];
      });
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [user?._id, selectedUser?._id]);

  // ==========================================
  // ONLINE / OFFLINE STATUS
  // ==========================================

  useEffect(() => {
    if (!selectedUser?._id) {
      setIsOnline(false);
      return;
    }

    const selectedUserId =
      selectedUser._id.toString();

    // Receive current online users
    const handleOnlineUsers = (userIds) => {
      const online = userIds.some(
        (id) => id.toString() === selectedUserId
      );

      setIsOnline(online);
    };

    // Receive status changes
    const handleUserStatus = (data) => {
      if (
        data.userId?.toString() === selectedUserId
      ) {
        setIsOnline(data.online);
      }
    };

    socket.on(
      "online-users",
      handleOnlineUsers
    );

    socket.on(
      "user-status",
      handleUserStatus
    );

    return () => {
      socket.off(
        "online-users",
        handleOnlineUsers
      );

      socket.off(
        "user-status",
        handleUserStatus
      );
    };
  }, [selectedUser]);

  // ==========================================
  // TYPING INDICATOR
  // ==========================================

  useEffect(() => {
    if (!selectedUser?._id) {
      setIsTyping(false);
      return;
    }

    const selectedUserId =
      selectedUser._id.toString();

    const handleUserTyping = ({ userId }) => {
      if (
        userId?.toString() === selectedUserId
      ) {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = ({ userId }) => {
      if (
        userId?.toString() === selectedUserId
      ) {
        setIsTyping(false);
      }
    };

    socket.on(
      "user-typing",
      handleUserTyping
    );

    socket.on(
      "user-stopped-typing",
      handleUserStoppedTyping
    );

    return () => {
      socket.off(
        "user-typing",
        handleUserTyping
      );

      socket.off(
        "user-stopped-typing",
        handleUserStoppedTyping
      );
    };
  }, [selectedUser]);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // ==========================================
  // HANDLE TYPING
  // ==========================================

  const handleTyping = (e) => {
    const value = e.target.value;

    setText(value);

    if (!selectedUser?._id || !user?._id) {
      return;
    }

    if (!socket.connected) {
      return;
    }

    if (value.trim()) {
      socket.emit("typing-start", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });
    } else {
      socket.emit("typing-stop", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });
    }
  };

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSendMessage = (e) => {
    e.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    if (!selectedUser?._id) {
      return;
    }

    if (!user?._id) {
      return;
    }

    if (!socket.connected) {
      console.error(
        "Socket is not connected"
      );

      return;
    }

    // Stop typing
    socket.emit("typing-stop", {
      senderId: user._id,
      receiverId: selectedUser._id,
    });

    // Send message
    socket.emit("send-message", {
      senderId: user._id,
      receiverId: selectedUser._id,
      text: trimmedText,
    });

    setText("");
    setIsTyping(false);
  };

  // ==========================================
  // NO USER SELECTED
  // ==========================================

  if (!selectedUser) {
    return (
      <main className="hidden flex-1 items-center justify-center md:flex">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.4,
          }}
          className="text-center"
        >
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-4xl">
            💬
          </div>

          <h2 className="text-2xl font-semibold text-white">
            Welcome to Talksy
          </h2>

          <p className="mt-2 text-slate-500">
            Search for a user and start a conversation.
          </p>
        </motion.div>
      </main>
    );
  }

  // ==========================================
  // CHAT UI
  // ==========================================

  return (
    <main className="flex flex-1 flex-col">

      {/* ======================================
          CHAT HEADER
      ====================================== */}

      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-6 py-4">

        {/* Avatar */}

        <div className="relative">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 font-bold">
            {selectedUser.fullName
              ?.charAt(0)
              .toUpperCase()}
          </div>

          {/* Online Dot */}

          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950 ${
              isOnline
                ? "bg-green-400"
                : "bg-slate-500"
            }`}
          />

        </div>

        {/* User Information */}

        <div>
          <h2 className="font-semibold text-white">
            {selectedUser.fullName}
          </h2>

          <div className="flex items-center gap-1.5">

            <span
              className={`h-2 w-2 rounded-full ${
                isOnline
                  ? "bg-green-400"
                  : "bg-slate-500"
              }`}
            />

            <p
              className={`text-xs ${
                isOnline
                  ? "text-green-400"
                  : "text-slate-500"
              }`}
            >
              {isOnline
                ? "Online"
                : "Offline"}
            </p>

          </div>
        </div>

      </div>

      {/* ======================================
          MESSAGE AREA
      ====================================== */}

      <div className="flex-1 space-y-3 overflow-y-auto p-6">

        {/* Loading */}

        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-cyan-400" />

              Loading messages...
            </div>
          </div>
        )}

        {/* Empty Conversation */}

        {!loading &&
          messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-center text-slate-500">

              <div>

                <div className="mb-3 text-4xl">
                  👋
                </div>

                <p className="text-lg text-slate-400">
                  No messages yet
                </p>

                <p className="mt-1 text-sm">
                  Send a message to start the conversation.
                </p>

              </div>

            </div>
          )}

        {/* Messages */}

        {!loading && (
          <AnimatePresence initial={false}>
            {messages.map((message) => {

              const senderId =
                message.sender?._id ||
                message.sender;

              const isMine =
                senderId?.toString() ===
                user?._id?.toString();

              return (
                <motion.div
                  key={message._id}
                  initial={{
                    opacity: 0,
                    y: 10,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-lg ${
                      isMine
                        ? "rounded-br-md bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                        : "rounded-bl-md bg-white/10 text-slate-200"
                    }`}
                  >

                    {/* Text */}

                    {message.text && (
                      <p className="break-words whitespace-pre-wrap">
                        {message.text}
                      </p>
                    )}

                    {/* Time */}

                    {message.createdAt && (
                      <p
                        className={`mt-1 text-[10px] ${
                          isMine
                            ? "text-white/60"
                            : "text-slate-500"
                        }`}
                      >
                        {new Date(
                          message.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}

                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Typing Indicator */}

        {isTyping && (
          <motion.div
            initial={{
              opacity: 0,
              y: 5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="flex items-center gap-2 px-2"
          >

            <div className="rounded-2xl rounded-bl-md bg-white/10 px-4 py-3">

              <div className="flex items-center gap-1">

                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />

                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />

                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />

              </div>

            </div>

            <span className="text-xs text-slate-500">
              {selectedUser.fullName} is typing...
            </span>

          </motion.div>
        )}

        {/* Scroll Target */}

        <div ref={messagesEndRef} />

      </div>

      {/* ======================================
          MESSAGE INPUT
      ====================================== */}

      <form
        onSubmit={handleSendMessage}
        className="border-t border-white/10 bg-white/[0.02] p-4"
      >

        <div className="flex gap-3">

          {/* Input */}

          <input
            type="text"
            value={text}
            onChange={handleTyping}
            placeholder={`Message ${selectedUser.fullName}...`}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
          />

          {/* Send */}

          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            type="submit"
            disabled={!text.trim()}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 font-semibold text-white shadow-lg shadow-purple-500/20 transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            ➤
          </motion.button>

        </div>

      </form>

    </main>
  );
};

export default ChatWindow;