import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { notify } from "../utils/toast.jsx";

const WS_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://vertexcanvas.onrender.com";

export function useGlobalSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const userId = user?._id;

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(`${WS_URL}`, {
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      socketRef.current.emit("register-user", user._id);
    });

    socketRef.current.on("access-requested", (data) => {
      // notify.info(`${data.requesterName} wants to access your board`);
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
      if (window.location.pathname.includes(boardId)) {
        notify.info("You were removed from this board");
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
  }, [userId]);

  return { socketRef, isConnected };
}
