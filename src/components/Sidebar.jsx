import { FaPlus, FaSearch, FaUsers } from "react-icons/fa";
import { fileUrl } from "../lib/api";

const formatTime = (date) =>
  date
    ? new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(date))
    : "";

const getChatLabel = (chat, currentUserId) => {
  if (chat.isGroupChat) return chat.name;
  return chat.participants.find((participant) => participant._id !== currentUserId)?.name;
};

export const Sidebar = ({
  chats,
  selectedChat,
  currentUser,
  onlineUsers,
  onSelectChat,
  onOpenFinder,
  onOpenGroupModal,
}) => (
  <aside className="sidebar">
    <div className="sidebar-header">
      <div>
        <div className="eyebrow">Messages</div>
        <h2>Inbox</h2>
      </div>
      <div className="sidebar-actions">
        <button onClick={onOpenFinder} title="Find people">
          <FaSearch />
        </button>
        <button onClick={onOpenGroupModal} title="Create group">
          <FaUsers />
        </button>
        <button onClick={onOpenGroupModal} title="New group">
          <FaPlus />
        </button>
      </div>
    </div>

    <div className="chat-list">
      {chats.map((chat) => {
        const displayUser = chat.participants.find(
          (participant) => participant._id !== currentUser._id
        );
        const title = getChatLabel(chat, currentUser._id);
        const avatar = chat.isGroupChat ? "" : displayUser?.avatar;
        const online = displayUser && onlineUsers.includes(displayUser._id);
        const isActive = selectedChat?._id === chat._id;

        return (
          <button
            key={chat._id}
            className={`chat-row ${isActive ? "active" : ""}`}
            onClick={() => onSelectChat(chat)}
          >
            <div className="avatar-wrap">
              {avatar ? (
                <img src={fileUrl(avatar)} alt={title} className="avatar" />
              ) : (
                <div className="avatar placeholder">{title?.slice(0, 1)}</div>
              )}
              {online ? <span className="online-dot" /> : null}
            </div>
            <div className="chat-copy">
              <div className="chat-meta">
                <strong>{title}</strong>
                <span>{formatTime(chat.lastMessage?.createdAt)}</span>
              </div>
              <p>
                {chat.lastMessage?.text ||
                  chat.lastMessage?.attachments?.[0]?.originalName ||
                  (chat.isGroupChat ? "Group conversation" : "Start chatting")}
              </p>
            </div>
            {chat.unreadCount ? <span className="badge">{chat.unreadCount}</span> : null}
          </button>
        );
      })}
    </div>
  </aside>
);
