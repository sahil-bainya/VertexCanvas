import { SocketContext } from "./SocketContext.js";
import { useGlobalSocket } from "./useGlobalSocket.js";

export default function SocketProvider({ children }) {
  const socketData = useGlobalSocket(); // { socketRef, isConnected }

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
}
