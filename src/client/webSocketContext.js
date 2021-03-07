import React, { useState, useEffect, createContext } from "react";
import EditorSocketAPI from "./websocket/editorSocketAPI";

const WebSocketContext = createContext(null);
// export { WebSocketContext };

export default function WebSocket({ children }) {
  const [webSocket, setWebSocket] = useState(1);

  useEffect(() => {
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
