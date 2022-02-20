import React, { useState, useEffect, createContext } from "react";
import EditorSocketAPI from "../websocket/EditorSocketAPI";

import { fetchBoardConfig } from "../slices/commandSlice";
import store from "../store";

export const WebSocketContext = createContext(null);

export default function WebSocket({ children }) {
  const [webSocket, setWebSocket] = useState(null);

  // useEffect(async () => {
  //   const editorSocket = new EditorSocketAPI();
  //   await store.dispatch(fetchBoardConfig());
  //   editorSocket.init();
  //   setWebSocket(editorSocket);
  // }, []);

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
}
