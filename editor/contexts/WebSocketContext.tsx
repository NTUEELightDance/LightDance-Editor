import React, { useState, useEffect, createContext } from "react";
import EditorSocketAPI from "../websocket/EditorSocketAPI";

export const WebSocketContext = createContext(null);

export default function WebSocket({ children }) {
  const [webSocket, setWebSocket] = useState(null);

  useEffect(async () => {
    console.log("init webSocket");
    const editorSocket = new EditorSocketAPI();
    editorSocket.init();
    setWebSocket(editorSocket);
  }, []);

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
}
