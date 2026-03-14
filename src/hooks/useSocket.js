import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://real-time-chat-application-backend-fmim.onrender.com";

export const useSocket = (userId) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userId) return undefined;

    const nextSocket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    setSocket(nextSocket);
    nextSocket.emit("setup", userId);

    return () => {
      nextSocket.disconnect();
      setSocket(null);
    };
  }, [userId]);

  return socket;
};
