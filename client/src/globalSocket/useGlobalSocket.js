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
      setIsConnected(true);
      socketRef.current.emit("register-user", user._id);
    });

    socketRef.current.on("access-requested", (data) => {
      // Toast notification
      notify.success(`${data.requesterName} wants to access your board`);

      // Ya custom event se UI update karo
      window.dispatchEvent(new CustomEvent("access-request", { detail: data }));
    });

    socketRef.current.on("request-approved", () => {
      notify.success("Access approved! Redirecting...");

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });

    socketRef.current.on("request-rejected", () => {
      notify.error("Access denied by owner");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    });

    socketRef.current.on("removed-from-board", ({ boardId }) => {
      // Sirf tabhi redirect karo agar user abhi usi board pe hai
      if (window.location.pathname.includes(boardId)) {
        notify.error("You were removed from this board");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
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
