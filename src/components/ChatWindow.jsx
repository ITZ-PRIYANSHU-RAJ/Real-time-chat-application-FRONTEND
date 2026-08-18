import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api.js";
import { socket } from "../lib/socket.js";

const ChatWindow = ({ selectedUser, currentUser,isOnline }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Scroll to bottom when messages change

  useEffect(() => {
  const handleTyping = ({ userId, typing }) => {
    if (userId === selectedUser?._id) {
      setIsTyping(typing);
    }
  };

  socket.on("user-typing", handleTyping);

  return () => {
    socket.off("user-typing", handleTyping);
  };
}, [selectedUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  // Fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id) return;

      try {
        setLoading(true);

        const response = await api.get(
          `/messages/${selectedUser._id}`
        );

        setMessages(response.data.messages || []);
      } catch (error) {
        console.error(
          "Fetch messages error:",
          error.response?.data?.message || error.message
        );

        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  // Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = (message) => {
      // Only add messages belonging to this conversation
      const isCurrentConversation =
        (message.sender?._id === currentUser?._id &&
          message.receiver?._id === selectedUser?._id) ||
        (message.sender?._id === selectedUser?._id &&
          message.receiver?._id === currentUser?._id);

      if (isCurrentConversation) {
        setMessages((prev) => {
          // Prevent duplicate messages
          const alreadyExists = prev.some(
            (msg) => msg._id === message._id
          );

          if (alreadyExists) {
            return prev;
          }

          return [...prev, message];
        });
      }
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [selectedUser, currentUser]);

  const handleTyping = (e) => {
  const value = e.target.value;

  setMessageText(value);

  if (!currentUser?._id || !selectedUser?._id) {
    return;
  }

  if (value.trim()) {
    socket.emit("typing-start", {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
    });
  } else {
    socket.emit("typing-stop", {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
    });
  }
};
  // Send message
const handleSendMessage = (e) => {
  e.preventDefault();

  if (!messageText.trim()) return;

  if (!currentUser?._id || !selectedUser?._id) {
    return;
  }

  socket.emit("send-message", {
    senderId: currentUser._id,
    receiverId: selectedUser._id,
    text: messageText.trim(),
  });

  socket.emit("typing-stop", {
    senderId: currentUser._id,
    receiverId: selectedUser._id,
  });

  setMessageText("");
};

  // No selected user
  if (!selectedUser) {
    return (
      <main className="hidden flex-1 items-center justify-center bg-slate-900 md:flex">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-3xl">
            💬
          </div>

          <h2 className="text-2xl font-semibold text-white">
            Welcome to Talksy
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Search for someone and start a conversation.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
      <main className="chat-bg flex flex-1 flex-col">

      {/* Header */}
      <header className="flex items-center gap-3 border-b border-white/10 bg-white/[.02] px-6 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 font-bold text-white">
          {selectedUser.fullName?.charAt(0)?.toUpperCase()}
        </div>

        <div>
          <h2 className="font-semibold text-white">
            {selectedUser.fullName}
          </h2>

          <p
  className={`text-xs ${
    isOnline
      ? "text-green-400"
      : "text-slate-500"
  }`}
>
  ● {isOnline ? "Online" : "Offline"}
</p>

        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">

        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-600">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isMine =
                message.sender?._id === currentUser?._id;

              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isMine
                        ? "rounded-br-md bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                        : "rounded-bl-md bg-white/10 text-slate-200"
                    }`}
                  >
                    {message.text && (
                      <p className="text-sm">
                        {message.text}
                      </p>
                    )}

                    {message.image && (
                      <img
                        src={message.image}
                        alt="message"
                        className="mt-2 max-w-full rounded-lg"
                      />
                    )}

                    <p className="mt-1 text-[10px] opacity-60">
                      {new Date(
                        message.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      <div ref={messagesEndRef} />
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {isTyping && <div className="px-6 pb-2 text-xs text-[#70d7c6]">{selectedUser.fullName} is typing...</div>}
      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-white/10 p-4"
      >
        <div className="flex gap-3">

          <input
            type="text"
            placeholder={`Message ${selectedUser.fullName}...`}
            value={messageText}
            onChange={handleTyping}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!messageText.trim()}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </motion.button>

        </div>
      </form>
    </main>
  );
};


export default ChatWindow;
