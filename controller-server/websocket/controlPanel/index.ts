import { WebSocket } from "ws";

import { FromControlPanel } from "@/types/controlPanelMessage";

import {
  handleBoardInfo,
  handlePlay,
  handlePause,
  handleStop,
  handleTest,
  handleRed,
  handleGreen,
  handleBlue,
  handleDarkAll,
  handleLoad,
  handleUpload,
} from "./handler";

export async function hadndleOnControlPanelMessage(
  ws: WebSocket,
  msg: FromControlPanel
) {
  switch (msg.topic) {
    case "boardInfo":
      handleBoardInfo(ws);
      break;
    case "play":
      handlePlay(ws, msg);
      break;
    case "pause":
      handlePause(ws, msg);
      break;
    case "stop":
      handleStop(ws, msg);
      break;
    case "test":
      handleTest(ws, msg);
      break;
    case "upload":
      await handleUpload(ws, msg);
      break;
    case "load":
      handleLoad(ws, msg);
      break;
    case "red":
      handleRed(ws, msg);
      break;
    case "green":
      handleGreen(ws, msg);
      break;
    case "blue":
      handleBlue(ws, msg);
      break;
    case "darkAll":
      handleDarkAll(ws, msg);
      break;
    default:
      console.error(`[Error]: Command not found ${msg.topic}`);
      break;
  }
}
