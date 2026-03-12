import { useEffect, useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { ChatWindow } from "./components/ChatWindow";
import { GroupModal } from "./components/GroupModal";
import { RightPanel } from "./components/RightPanel";
import { Sidebar } from "./components/Sidebar";
import { UserFinderModal } from "./components/UserFinderModal";
import { useSocket } from "./hooks/useSocket";
import { api } from "./lib/api";
import { useAuth } from "./providers/AuthProvider";

const sortChats = (items) =>
  [...items].sort(
    (a, b) =>
      new Date(b.lastMessage?.createdAt || b.updatedAt) -
      new Date(a.lastMessage?.createdAt || a.updatedAt)
  );

export default function App() {
  const { user, booting, logout, setUser } = useAuth();
  const socket = useSocket(user?._id);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [foundUsers, setFoundUsers] = useState([]);
  const [finderOpen, setFinderOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const loadChats = async () => {
    const response = await api.get("/chats");
    setChats(sortChats(response.data));
    if (selectedChat) {
      const refreshed = response.data.find((chat) => chat._id === selectedChat._id);
      if (refreshed) setSelectedChat(refreshed);
    }
  };

  const loadMessages = async (chatId) => {
    const response = await api.get(`/messages/${chatId}`);
    setMessages(response.data);
  };

  const searchUsers = async (search = "") => {
    const response = await api.get(`/users?search=${encodeURIComponent(search)}`);
    setFoundUsers(response.data);
  };

  useEffect(() => {
    if (!user) return;
    loadChats();
    searchUsers();
  }, [user]);

  useEffect(() => {
    if (!selectedChat?._id || !socket) return;

    socket.emit("chat:join", selectedChat._id);
    loadMessages(selectedChat._id);

    return () => {
      socket.emit("chat:leave", selectedChat._id);
    };
  }, [selectedChat?._id, socket]);

  useEffect(() => {
    if (!socket) return;

    const onMessage = (message) => {
      if (message.chat !== selectedChat?._id) return;
      setMessages((current) => [...current, message]);
      loadChats();
    };

    const onRefresh = () => loadChats();
    const onPresence = (users) => setOnlineUsers(users);

    socket.on("message:received", onMessage);
    socket.on("chat:refresh", onRefresh);
    socket.on("presence:update", onPresence);

    return () => {
      socket.off("message:received", onMessage);
      socket.off("chat:refresh", onRefresh);
      socket.off("presence:update", onPresence);
    };
  }, [socket, selectedChat?._id]);

  if (booting) return <div className="loading-screen">Loading...</div>;
  if (!user) return <AuthScreen />;

  const onSelectChat = async (chat) => {
    setSelectedChat(chat);
    await loadMessages(chat._id);
    await loadChats();
  };

  const onStartChat = async (userId) => {
    const response = await api.post("/chats/direct", { userId });
    setFinderOpen(false);
    await loadChats();
    await onSelectChat(response.data);
  };

  const onCreateGroup = async (payload) => {
    const response = await api.post("/chats/group", payload);
    setGroupOpen(false);
    setChats((current) => sortChats([response.data, ...current]));
    setSelectedChat(response.data);
  };

  const onSend = async ({ text, files }) => {
    if (!selectedChat) return;

    const formData = new FormData();
    formData.append("chatId", selectedChat._id);
    formData.append("text", text);
    files.forEach((file) => formData.append("files", file));

    const response = await api.post("/messages", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setMessages((current) => [...current, response.data]);
    setChats((current) =>
      sortChats(
        current.map((chat) =>
          chat._id === selectedChat._id ? { ...chat, lastMessage: response.data } : chat
        )
      )
    );

    socket?.emit("message:new", {
      chatId: selectedChat._id,
      message: response.data,
      participants: selectedChat.participants.map((participant) => participant._id),
    });
  };

  const onUpdateProfile = async (form) => {
    const body = new FormData();
    body.append("name", form.name);
    body.append("bio", form.bio);
    if (form.avatar) body.append("avatar", form.avatar);

    const response = await api.put("/users/profile", body, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUser(response.data);
  };

  return (
    <>
      <div className="app-shell">
        <Sidebar
          chats={chats}
          selectedChat={selectedChat}
          currentUser={user}
          onlineUsers={onlineUsers}
          onSelectChat={onSelectChat}
          onOpenFinder={() => setFinderOpen(true)}
          onOpenGroupModal={() => setGroupOpen(true)}
        />
        <ChatWindow
          chat={selectedChat}
          currentUser={user}
          messages={messages}
          onSend={onSend}
        />
        <RightPanel user={user} onUpdateProfile={onUpdateProfile} onLogout={logout} />
      </div>

      <UserFinderModal
        open={finderOpen}
        users={foundUsers}
        onClose={() => setFinderOpen(false)}
        onSearch={searchUsers}
        onStartChat={onStartChat}
      />

      <GroupModal
        open={groupOpen}
        users={foundUsers}
        onClose={() => setGroupOpen(false)}
        onSearch={searchUsers}
        onCreateGroup={onCreateGroup}
      />
    </>
  );
}
