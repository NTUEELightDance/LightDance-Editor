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

export async function handleOnControlPanelMessage(
  ws: WebSocket,
  msg: FromControlPanel
) {
  switch (msg.topic) {
    case "boardInfo":
      handleBoardInfo(ws);
      break;
    case "play":
      handlePlay(msg);
      break;
    case "pause":
      handlePause(msg);
      break;
    case "stop":
      handleStop(msg);
      break;
    case "test":
      handleTest(msg);
      break;
    case "upload":
      await handleUpload(msg);
      break;
    case "load":
      handleLoad(msg);
      break;
    case "red":
      handleRed(msg);
      break;
    case "green":
      handleGreen(msg);
      break;
    case "blue":
      handleBlue(msg);
      break;
    case "darkAll":
      handleDarkAll();
      break;
    default:
      console.error(`[Error]: Command not found ${msg.topic}`);
      break;
  }
}
