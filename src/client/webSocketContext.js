import React, { useState, useEffect, createContext } from "react";
import WebSocketAPI from "./websocket";

const WebSocketContext = createContext(null);
export { WebSocketContext };

export default function WebSocket({ children }) {
  const [webSocket, setWebSocket] = useState(1);

  useEffect(() => {
    const webAPI = new WebSocketAPI();
    webAPI.init();
    setWebSocket(webAPI);
  }, []);

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
}
