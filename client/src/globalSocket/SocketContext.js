import { createContext, useContext } from "react";

export const SocketContext = createContext(null);

export const useGlobalSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useGlobalSocketContext must be used within SocketProvider");
  }
  return context;
};