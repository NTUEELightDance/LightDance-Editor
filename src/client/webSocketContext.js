import React, { useState, useEffect, createContext } from "react";
import WebSocketAPI from "./websocket";
import { multiEditAgent } from "./api";

const WebSocketContext = createContext(null);
export { WebSocketContext };

export default function WebSocket({ children }) {
  const [webSocket, setWebSocket] = useState(1);

  useEffect(() => {
    const webAPI = new WebSocketAPI();
    webAPI.init(`ws://${window.location.host}`, multiEditAgent);
    setWebSocket(webAPI);
  }, []);

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
}
