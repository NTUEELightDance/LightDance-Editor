import WebSocket from "ws";

import { FromRPi } from "@/types/RPiMessage";

import { handleRPiBoardInfo, handleRPiCommandResponse } from "./handlers";

export async function hadndleOnRPiMessage(ws: WebSocket, msg: FromRPi) {
  switch (msg.topic) {
    case "boardInfo":
      await handleRPiBoardInfo(ws, msg);
      break;
    case "command":
      handleRPiCommandResponse(ws, msg);
      break;
  }
}
