import { randomUUID } from "crypto";
import WebSocket from "ws";

import {
  FromControlPanelPlay,
  FromControlPanelPause,
  FromControlPanelStop,
  FromControlPanelTest,
  FromControlPanelRed,
  FromControlPanelGreen,
  FromControlPanelBlue,
  FromControlPanelLoad,
  FromControlPanelUpload,
  ToControlPanel,
  ToControlPanelBoardInfo,
  FromControlPanelCloseGPIO,
  FromControlPanelReboot,
  FromControlPanelYellow,
  FromControlPanelMagenta,
  FromControlPanelCyan,
  FromControlPanelWebShell,
  FromControlPanelSync,
  FromControlPanelDark,
  FromControlPanelWhite,
} from "@/types/controlPanelMessage";

import {
  ToRPiPlay,
  ToRPiPause,
  ToRPiStop,
  ToRPiLoad,
  ToRPiPartTest,
  ToRPiReboot,
  ToRPiCloseGPIO,
  ToRPiWebShell,
  ToRPiSync,
} from "@/types/RPiMessage";

import dancerTable, { dancerToMAC } from "@/configs/dancerTable";

import { sendToRPi, sendBoardInfoToRPi } from "@/websocket/RPi/handlers";

import { exec } from "child_process";

export const controlPanelWSs: Record<string, WebSocket> = {};

export function sendToControlPanel(msg: ToControlPanel) {
  console.log("[Send]: ControlPanel ", msg, "\n");
  const toSend = JSON.stringify(msg);

  Object.values(controlPanelWSs).forEach((ws: WebSocket) => {
    ws.send(toSend);
  });
}

export function sendBoardInfoToControlPanel() {
  const toControlPanelMsg: ToControlPanelBoardInfo = {
    from: "server",
    topic: "boardInfo",
    statusCode: 0,
    payload: dancerTable,
  };

  sendToControlPanel(toControlPanelMsg);
}

export function handleBoardInfo(ws: WebSocket) {
  const uuid = randomUUID();
  controlPanelWSs[uuid] = ws;

  console.log(`[Connected]: Control Panel ${uuid}`);

  ws.on("close", () => {
    console.log(`[Disconnected]: Control Panel ${uuid}`);
    delete controlPanelWSs[uuid];
  });

  sendBoardInfoToControlPanel();
}

export function handleSync(msg: FromControlPanelSync) {
  const { dancers } = msg.payload;

  const toRPiMsg: ToRPiSync = {
    from: "server",
    topic: "sync",
    statusCode: 0,
    payload: "",
  };

  sendToRPi(dancers, toRPiMsg);
}

export function handlePlay(msg: FromControlPanelPlay) {
  const { dancers, start, timestamp } = msg.payload;

  const timestampString = Math.round(timestamp).toString();

  const toRPiMsg: ToRPiPlay = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: [
      "playerctl",
      "play",
      Math.round(start / 1000).toString(),
      "-d",
      timestampString,
    ],
  };

  sendToRPi(dancers, toRPiMsg);

  const music_delay = 0; // time offset of music

  const _timestampString = Math.round(timestamp - music_delay).toString();

  return exec(`./scripts/schedule_play.sh ${_timestampString} ${start / 1000}`);
}

export function handlePause(msg: FromControlPanelPause) {
  const { dancers } = msg.payload;

  const toRPiMsg: ToRPiPause = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["playerctl", "pause"],
  };

  sendToRPi(dancers, toRPiMsg);

  exec("./scripts/schedule_stop.sh");
}

export function handleStop(msg: FromControlPanelStop) {
  const { dancers } = msg.payload;

  const toRPiMsg: ToRPiStop = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["playerctl", "stop"],
  };

  sendToRPi(dancers, toRPiMsg);

  exec("./scripts/schedule_stop.sh");
}

export async function handleUpload(msg: FromControlPanelUpload) {
  const { dancers } = msg.payload;
  for (const dancer of dancers) {
    await sendBoardInfoToRPi(dancer);
  }
}

export function handleLoad(msg: FromControlPanelLoad) {
  const { dancers } = msg.payload;
  const toRPiMsg: ToRPiLoad = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["load"],
  };

  sendToRPi(dancers, toRPiMsg);
}

export function handleReboot(msg: FromControlPanelReboot) {
  const { dancers } = msg.payload;

  const toRPiMsg: ToRPiReboot = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["restart"],
  };

  sendToRPi(dancers, toRPiMsg);
}

export function handleCloseGPIO(msg: FromControlPanelCloseGPIO) {
  const { dancers } = msg.payload;

  const toRPiMsg: ToRPiCloseGPIO = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["close"],
  };

  sendToRPi(dancers, toRPiMsg);
}

export function handleWebShell(msg: FromControlPanelWebShell) {
  const { dancers, command } = msg.payload;

  const toRPiMsg: ToRPiWebShell = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: [command],
  };

  sendToRPi(dancers, toRPiMsg);
}

function sendColor(dancers: string[], colorCode: string) {
  const toRPiMsgPartTest: ToRPiPartTest = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["parttest", "--hex", colorCode.replace(/^#/, ""), "-a", "200"],
  };

  sendToRPi(dancers, toRPiMsgPartTest);
}

export function handleTest(msg: FromControlPanelTest) {
  const { dancers, colorCode } = msg.payload;
  sendColor(dancers, colorCode);
}

export function handleRed(msg: FromControlPanelRed) {
  const { dancers } = msg.payload;
  const colorCode = "ff0000";
  sendColor(dancers, colorCode);
}

export function handleGreen(msg: FromControlPanelGreen) {
  const { dancers } = msg.payload;
  const colorCode = "00ff00";
  sendColor(dancers, colorCode);
}

export function handleBlue(msg: FromControlPanelBlue) {
  const { dancers } = msg.payload;
  const colorCode = "0000ff";
  sendColor(dancers, colorCode);
}

export function handleYellow(msg: FromControlPanelYellow) {
  const { dancers } = msg.payload;
  const colorCode = "ffff00";
  sendColor(dancers, colorCode);
}

export function handleMagenta(msg: FromControlPanelMagenta) {
  const { dancers } = msg.payload;
  const colorCode = "ff00ff";
  sendColor(dancers, colorCode);
}

export function handleCyan(msg: FromControlPanelCyan) {
  const { dancers } = msg.payload;
  const colorCode = "00ffff";
  sendColor(dancers, colorCode);
}

export function handleDark(msg: FromControlPanelDark) {
  const { dancers } = msg.payload;
  const colorCode = "000000";
  sendColor(dancers, colorCode);
}

export function handleWhite(msg: FromControlPanelWhite) {
  const { dancers } = msg.payload;
  const colorCode = "ffffff";
  sendColor(dancers, colorCode);
}

export function handleDarkAll() {
  const toRPiMsgPartTest: ToRPiPartTest = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["parttest", "--hex", "000000", "-a", "0"],
  };

  sendToRPi(Object.keys(dancerToMAC), toRPiMsgPartTest);
}
