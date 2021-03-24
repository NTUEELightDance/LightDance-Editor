import React, { useState, useEffect, createContext } from "react";
import EditorSocketAPI from "../websocket/editorSocketAPI";

import { fetchBoardConfig } from "../slices/globalSlice";
import store from "../store";

export const WebSocketContext = createContext(null);

export default function WebSocket({ children }) {
  const [webSocket, setWebSocket] = useState(1);

  useEffect(async () => {
    const editorSocket = new EditorSocketAPI();
    await store.dispatch(fetchBoardConfig());
    editorSocket.init();
    setWebSocket(editorSocket);
  }, []);

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
}
