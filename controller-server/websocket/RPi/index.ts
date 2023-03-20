import WebSocket from "ws";

import { FromRPi } from "@/types/RPiMessage";

import {
  handleRPiBoardInfo,
  handleRPiCommandResponse,
  handleRPiSyncResponse,
} from "./handlers";

export async function handleOnRPiMessage(ws: WebSocket, msg: FromRPi) {
  switch (msg.topic) {
    case "boardInfo":
      await handleRPiBoardInfo(ws, msg);
      break;
    case "command":
      handleRPiCommandResponse(ws, msg);
      break;
    case "sync":
      handleRPiSyncResponse(ws, msg);
      break;
    default:
      msg satisfies never;
      break;
  }
}
