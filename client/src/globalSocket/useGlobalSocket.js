// src/hooks/useGlobalSocket.js
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { notify } from "../utils/toast.jsx";

export function useGlobalSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io("http://localhost:3000", {
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Global socket connected:", socketRef.current.id);
      setIsConnected(true);
      socketRef.current.emit("register-user", user._id);
    });

    socketRef.current.on("access-requested", (data) => {
      // Notification show karo ya custom event dispatch karo
      console.log("Access requested:", data);

      // Toast notification
      notify.success(`${data.requesterName} wants to access your board`);

      // Ya custom event se UI update karo
      window.dispatchEvent(new CustomEvent("access-request", { detail: data }));
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return { socketRef, isConnected };
}
