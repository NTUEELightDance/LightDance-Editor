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
} from "./handler";

export default function handleOnMessage(msg: FromControlPanel) {
  switch (msg.command) {
    case "boardInfo":
      handleBoardInfo(msg);
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
      handleDarkAll(msg);
      break;
  }
  console.error(`[Error]: Command not found ${msg.command}`);
}
