import { useEffect, useRef, useState } from "react";
import { FaFileAlt, FaPaperclip, FaPaperPlane, FaVideo } from "react-icons/fa";
import { fileUrl } from "../lib/api";

const getChatTitle = (chat, currentUserId) => {
  if (!chat) return "Select a conversation";
  if (chat.isGroupChat) return chat.name;
  return chat.participants.find((participant) => participant._id !== currentUserId)?.name;
};

export const ChatWindow = ({
  chat,
  currentUser,
  messages,
  onSend,
}) => {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chat?._id]);

  const submit = async (event) => {
    event.preventDefault();
    await onSend({ text, files });
    setText("");
    setFiles([]);
  };

  if (!chat) {
    return (
      <section className="chat-window empty-state">
        <div className="empty-card">
          <h3>Your conversations will appear here</h3>
          <p>
            Start a direct chat, create a group, and share documents, images,
            or videos in real time.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        <div>
          <div className="eyebrow">{chat.isGroupChat ? "Group chat" : "Direct chat"}</div>
          <h2>{getChatTitle(chat, currentUser._id)}</h2>
        </div>
      </header>

      <div className="message-list">
        {messages.map((message) => {
          const mine = message.sender._id === currentUser._id;
          return (
            <article key={message._id} className={`message-bubble ${mine ? "mine" : ""}`}>
              <span className="message-author">{mine ? "You" : message.sender.name}</span>
              {message.text ? <p>{message.text}</p> : null}
              {message.attachments?.length ? (
                <div className="attachment-grid">
                  {message.attachments.map((attachment) => (
                    <a
                      key={`${message._id}-${attachment.url}`}
                      href={fileUrl(attachment.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="attachment-card"
                    >
                      {attachment.kind === "image" ? (
                        <img src={fileUrl(attachment.url)} alt={attachment.originalName} />
                      ) : attachment.kind === "video" ? (
                        <div className="attachment-icon">
                          <FaVideo />
                        </div>
                      ) : (
                        <div className="attachment-icon">
                          <FaFileAlt />
                        </div>
                      )}
                      <span>{attachment.originalName}</span>
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
        <div ref={endRef} />
      </div>

      <form className="composer" onSubmit={submit}>
        <label className="clip-button">
          <FaPaperclip />
          <input
            type="file"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
          />
        </label>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type your message"
        />
        <button type="submit" disabled={!text.trim() && files.length === 0}>
          <FaPaperPlane />
        </button>
      </form>
      {files.length ? (
        <div className="upload-preview">
          {files.map((file) => (
            <span key={file.name}>{file.name}</span>
          ))}
        </div>
      ) : null}
    </section>
  );
};
