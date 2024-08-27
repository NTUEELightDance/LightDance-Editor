import { WebSocket } from "ws";

import { FromControlPanel } from "@/types/controlPanelMessage";

import { ChildProcess } from "child_process";

import {
  handleBoardInfo,
  handleSync,
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
  handleReboot,
  handleCloseGPIO,
  handleCyan,
  handleYellow,
  handleMagenta,
  handleWebShell,
} from "./handler";

let music_subprocess: ChildProcess | null = null;

export async function handleOnControlPanelMessage(
  ws: WebSocket,
  msg: FromControlPanel
) {
  switch (msg.topic) {
    case "boardInfo":
      handleBoardInfo(ws);
      break;
    case "sync":
      handleSync(msg);
      break;
    case "play":
      if (music_subprocess?.pid && !music_subprocess.killed) {
        console.log(music_subprocess.pid + 1);
        try {
          process.kill(music_subprocess.pid + 1, "SIGHUP");
        } catch {
          console.log("failed to kill music");
        }
        console.log("killed music");
      }
      music_subprocess = handlePlay(msg);
      break;
    case "pause":
      if (music_subprocess?.pid && !music_subprocess.killed) {
        console.log(music_subprocess.pid + 1);
        try {
          process.kill(music_subprocess.pid + 1, "SIGHUP");
        } catch {
          console.log("failed to kill music");
        }
        console.log("killed music");
      }
      handlePause(msg);
      break;
    case "stop":
      if (music_subprocess?.pid && !music_subprocess.killed) {
        console.log(music_subprocess.pid + 1);
        try {
          process.kill(music_subprocess.pid + 1, "SIGHUP");
        } catch {
          console.log("failed to kill music");
        }
        console.log("killed music");
      }
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
    case "yellow":
      handleYellow(msg);
      break;
    case "magenta":
      handleMagenta(msg);
      break;
    case "cyan":
      handleCyan(msg);
      break;
    case "darkAll":
      handleDarkAll();
      break;
    case "reboot":
      handleReboot(msg);
      break;
    case "close":
      handleCloseGPIO(msg);
      break;
    case "webShell":
      handleWebShell(msg);
      break;
    default:
      msg satisfies never;
      console.log(`[Error]: Unknown topic ${msg}`);
      break;
  }
}
