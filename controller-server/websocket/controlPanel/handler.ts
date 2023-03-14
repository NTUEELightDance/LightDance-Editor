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
  FromControlPanelDarkAll,
  FromControlPanelLoad,
  FromControlPanelUpload,
  ToControlPanel,
  ToControlPanelBoardInfo,
} from "@/types/controlPanelMessage";

import {
  ToRPiPlay,
  ToRPiPause,
  ToRPiStop,
  ToRPiLoad,
  ToRPiLEDTest,
  ToRPiOFTest,
} from "@/types/RPiMessage";

import dancerTable, { dancerToMac } from "@/configs/dancerTable";

import { sendToRPi, sendBoardInfoToRPi } from "@/websocket/RPi/handlers";

export const controlPanelWSs: Record<string, WebSocket> = {};

export function sendToControlPanel(msg: ToControlPanel) {
  console.log("[Control Panel]: send ", msg, "\n");
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

  console.log(`[ControlPanel]: connected ${uuid}`);

  ws.on("close", () => {
    console.log(`[ControlPanel]: disconnected ${uuid}`);
    delete controlPanelWSs[uuid];
  });

  sendBoardInfoToControlPanel();
}

export function handlePlay(ws: WebSocket, msg: FromControlPanelPlay) {
  const { dancers, start, delay } = msg.payload;

  const toRPiMsg: ToRPiPlay = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["playerctl", "play", start, "-d", delay],
  };

  sendToRPi(dancers, toRPiMsg);
}

export function handlePause(ws: WebSocket, msg: FromControlPanelPause) {
  const { dancers } = msg.payload;

  const toRPiMsg: ToRPiPause = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["playerctl", "pause"],
  };

  sendToRPi(dancers, toRPiMsg);
}

export function handleStop(ws: WebSocket, msg: FromControlPanelStop) {
  const { dancers } = msg.payload;

  const toRPiMsg: ToRPiStop = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["playerctl", "stop"],
  };

  sendToRPi(dancers, toRPiMsg);
}

export async function handleUpload(ws: WebSocket, msg: FromControlPanelUpload) {
  const { dancers } = msg.payload;
  for (const dancer of dancers) {
    await sendBoardInfoToRPi(dancer);
  }
}

export function handleLoad(ws: WebSocket, msg: FromControlPanelLoad) {
  const { dancers } = msg.payload;
  const toRPiMsg: ToRPiLoad = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["load"],
  };

  sendToRPi(dancers, toRPiMsg);
}

function sendColor(dancers: string[], colorCode: string) {
  const toRPiMsgLED: ToRPiLEDTest = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["ledtest", "--hex", colorCode.replace(/^#/, "")],
  };

  const toRPiMsgOF: ToRPiOFTest = {
    from: "server",
    topic: "command",
    statusCode: 0,
    payload: ["oftest", "--hex", colorCode.replace(/^#/, "")],
  };

  sendToRPi(dancers, toRPiMsgLED);
  sendToRPi(dancers, toRPiMsgOF);
}

export function handleTest(ws: WebSocket, msg: FromControlPanelTest) {
  const { dancers, colorCode } = msg.payload;
  sendColor(dancers, colorCode);
}

export function handleRed(ws: WebSocket, msg: FromControlPanelRed) {
  const { dancers } = msg.payload;
  const colorCode = "ff0000";
  sendColor(dancers, colorCode);
}

export function handleGreen(ws: WebSocket, msg: FromControlPanelGreen) {
  const { dancers } = msg.payload;
  const colorCode = "00ff00";
  sendColor(dancers, colorCode);
}

export function handleBlue(ws: WebSocket, msg: FromControlPanelBlue) {
  const { dancers } = msg.payload;
  const colorCode = "0000ff";
  sendColor(dancers, colorCode);
}

export function handleDarkAll(ws: WebSocket, msg: FromControlPanelDarkAll) {
  const colorCode = "000000";
  sendColor(Object.keys(dancerToMac), colorCode);
}
