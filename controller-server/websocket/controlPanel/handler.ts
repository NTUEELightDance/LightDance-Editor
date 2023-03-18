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
} from "@/types/RPiMessage";

import dancerTable, { dancerToMAC } from "@/configs/dancerTable";

import { sendToRPi, sendBoardInfoToRPi } from "@/websocket/RPi/handlers";

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

export function handlePlay(msg: FromControlPanelPlay) {
  const { dancers, start, delay } = msg.payload;

  const toRPiMsg: ToRPiPlay = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: [
      "playerctl",
      "play",
      Math.round(start).toString(),
      "-d",
      Math.round(delay).toString(),
    ],
  };

  sendToRPi(dancers, toRPiMsg);
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
    payload: ["parttest", "--hex", colorCode.replace(/^#/, ""), "-a", "10"],
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

export function handleDarkAll() {
  const toRPiMsgPartTest: ToRPiPartTest = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["parttest", "--hex", "000000", "-a", "0"],
  };

  sendToRPi(Object.keys(dancerToMAC), toRPiMsgPartTest);
}
