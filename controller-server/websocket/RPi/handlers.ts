import { WebSocket } from "ws";

import {
  FromRPiBoardInfo,
  FromRPiCommandResponse,
  ToRPi,
  ToRPiUpload,
} from "../../types/RPiMessage";
import { ToControlPanelCommandResponse } from "../../types/controlPanelMessage";
import { MACAddressSchema } from "../..//types/schema/DancerData";

import dancerTable, { dancerToMac } from "../../configs/dancerTable";
import pinMapTable from "../../configs/pinMapTable";

import {
  sendToControlPanel,
  sendBoardInfoToControlPanel,
} from "../controlPanel/handler";
import { getDancerLEDDataAPI, getDancerFiberDataAPI } from "../../api";

export const RPiWSs: Record<string, WebSocket> = {};

export function sendToRPi(dancers: string[], msg: ToRPi) {
  const toSend = JSON.stringify(msg);
  console.log(toSend);

  dancers.forEach((dancer: string) => {
    const MAC = dancerToMac[dancer];
    if (MAC in RPiWSs) {
      RPiWSs[MAC].send(toSend);
    }
  });
}

export async function sendBoardInfoToRPi(dancer: string) {
  // send pinMap, LED and OF to RPi
  const LEDData = await getDancerLEDDataAPI(dancer);
  const OFData = await getDancerFiberDataAPI(dancer);
  if (!LEDData || !OFData) return;

  const toRPiMsg: ToRPiUpload = {
    from: "server",
    topic: "upload",
    statusCode: 0,
    payload: [pinMapTable[dancer], OFData, LEDData],
  };

  sendToRPi([dancer], toRPiMsg);
}

export async function handleRPiBoardInfo(ws: WebSocket, msg: FromRPiBoardInfo) {
  console.log(`[BOARDINFO]: ${msg.payload.MAC}\n`);
  const { MAC } = msg.payload;
  const { dancer } = dancerTable[MAC];

  const result = MACAddressSchema.safeParse(MAC);
  if (!result.success) {
    console.error(result.error);
    return;
  }

  dancerTable[MAC].connected = true;
  RPiWSs[MAC] = ws;
  sendBoardInfoToRPi(dancer);

  // release ws on close
  ws.on("close", () => {
    dancerTable[MAC].connected = false;
    delete RPiWSs[MAC];
    sendBoardInfoToControlPanel();
  });
}

export function handleRPiCommandResponse(
  ws: WebSocket,
  msg: FromRPiCommandResponse
) {
  console.log(`[COMMAND]: ${msg.topic}`);
  console.log(`${msg.statusCode}`);
  console.log(`${msg.payload.message}\n`);

  const toControlPanelMsg: ToControlPanelCommandResponse = {
    from: "server",
    topic: "command",
    statusCode: msg.statusCode,
    payload: msg.payload,
  };
  sendToControlPanel(toControlPanelMsg);
}
