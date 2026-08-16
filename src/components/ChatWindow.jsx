import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const ChatWindow = ({ selectedUser }) => {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Get conversation
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

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() || !selectedUser?._id) return;

    try {
      const response = await api.post("/messages/send", {
        receiverId: selectedUser._id,
        text: text.trim(),
      });

      setMessages((prev) => [
        ...prev,
        response.data.data,
      ]);

      setText("");
    } catch (error) {
      console.error(
        "Send Message Error:",
        error.response?.data?.message || error.message
      );
    }
  };

  if (!selectedUser) {
    return (
      <main className="hidden flex-1 items-center justify-center md:flex">
        <div className="text-center text-slate-500">
          <div className="mb-4 text-5xl">💬</div>

          <h2 className="text-xl font-semibold text-white">
            Select a conversation
          </h2>

          <p className="mt-2">
            Search for a user to start chatting.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-6 py-4">

        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 font-bold">
            {selectedUser.fullName
              ?.charAt(0)
              .toUpperCase()}
          </div>

          {/* Online indicator - temporary */}
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-950 bg-green-400" />
        </div>

        <div>
          <h2 className="font-semibold">
            {selectedUser.fullName}
          </h2>

          <p className="text-xs text-green-400">
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-6">

        {loading && (
          <div className="text-center text-sm text-slate-500">
            Loading messages...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center text-slate-500">
            <div>
              <p className="text-lg">
                No messages yet
              </p>

              <p className="mt-1 text-sm">
                Send a message to start the conversation.
              </p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const senderId =
              message.sender?._id || message.sender;

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
                  <p className="break-words">
                    {message.text}
                  </p>

                  <p
                    className={`mt-1 text-[10px] ${
                      isMine
                        ? "text-white/60"
                        : "text-slate-500"
                    }`}
                  >
                    {message.createdAt
                      ? new Date(
                          message.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-white/10 bg-white/[0.02] p-4"
      >
        <div className="flex gap-3">

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${selectedUser.fullName}...`}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!text.trim()}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            ➤
          </motion.button>

        </div>
      </form>
    </main>
  );
};

export default ChatWindow;