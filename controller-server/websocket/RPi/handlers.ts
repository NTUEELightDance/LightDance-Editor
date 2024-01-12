import { WebSocket } from "ws";

import {
  FromRPiBoardInfo,
  FromRPiCommandResponse,
  FromRPiSyncResponse,
  ToRPi,
  ToRPiUpload,
} from "@/types/RPiMessage";
import { ToControlPanelCommandResponse } from "@/types/controlPanelMessage";
import { MACAddress, MACAddressSchema } from "@/schema/DancerData";

import dancerTable, { dancerToMAC } from "@/configs/dancerTable";
import pinMapTable from "@/configs/pinMapTable";

import { getDancerLEDDataAPI, getDancerFiberDataAPI } from "@/api";

import {
  sendToControlPanel,
  sendBoardInfoToControlPanel,
} from "@/websocket/controlPanel/handler";

export const RPiWSs: Record<string, WebSocket> = {};

export function sendToRPi(dancers: string[], msg: ToRPi) {
  console.log("[Send]: RPi", msg, dancers, "\n");
  const toSend = JSON.stringify({
    ...msg,
    ...(msg.topic === "command" && { payload: msg.payload.join(" ") }),
  });

  dancers.forEach((dancer: string) => {
    if (!(dancer in dancerToMAC)) {
      console.error(`[Error]: dancer not found! ${dancer}`);
      return;
    }

    const { wifi, ethernet } = dancerToMAC[dancer];

    for (const MAC of [ethernet, wifi]) {
      if (MAC in RPiWSs) {
        if (RPiWSs[MAC].readyState !== WebSocket.OPEN) {
          delete RPiWSs[MAC];
          dancerTable[MAC].connected = false;
          sendBoardInfoToControlPanel();
          continue;
        }

        RPiWSs[MAC].send(toSend);
      } else {
        dancerTable[MAC].connected = false;
        sendBoardInfoToControlPanel();
      }
    }

    // when both wifi and ethernet are not connected
    console.error(`[Error]: RPi not connected! ${dancer}`);
  });
}

export async function sendBoardInfoToRPi(dancer: string) {
  // send pinMap, LED and OF to RPi
  /*
      TODO: the structure of LEDresult is changed from
            {status: Record<string, [number, number, number, number]>, start: number, fade: boolean}[]
            to Record<string, [number, number, number, number]>[]
            since start and fade is no longer used.
   */
  const [LEDresult, OFresult] = await Promise.allSettled([
    getDancerLEDDataAPI(dancer),
    getDancerFiberDataAPI(dancer),
  ]);

  if (LEDresult.status === "rejected") {
    console.error(`[Error]: failed to fetch LED data ${LEDresult.reason}`);
    return;
  }
  if (OFresult.status === "rejected") {
    console.error(`[Error]: failed to fetch OF data ${OFresult.reason}`);
    return;
  }

  const LEDData = LEDresult.value;
  const OFData = OFresult.value;

  const toRPiMsg: ToRPiUpload = {
    from: "server",
    topic: "upload",
    statusCode: 0,
    payload: [pinMapTable[dancer], OFData, LEDData],
  };

  sendToRPi([dancer], toRPiMsg);
}

function validateMAC(MAC: MACAddress) {
  const result = MACAddressSchema.safeParse(MAC);
  if (!result.success) {
    console.error(`[Error]: invalid MAC address format ${result.error}`);
    return false;
  }

  if (!(MAC in dancerTable)) {
    console.error(`[Error]: MAC not found! ${MAC}`);
    return false;
  }

  return true;
}

export async function handleRPiBoardInfo(ws: WebSocket, msg: FromRPiBoardInfo) {
  const { MAC } = msg.payload;

  if (!validateMAC(MAC)) return;

  const { dancer } = dancerTable[MAC];
  console.log(`[Connected]: RPi ${dancer}`);

  dancerTable[MAC].connected = true;
  RPiWSs[MAC] = ws;

  sendBoardInfoToControlPanel();

  // release ws on close
  ws.on("close", () => {
    console.log(`[Disconnected]: RPi ${dancer}`);
    dancerTable[MAC].connected = false;
    delete RPiWSs[MAC];
    sendBoardInfoToControlPanel();
  });
}

export function handleRPiCommandResponse(
  ws: WebSocket,
  msg: FromRPiCommandResponse
) {
  const { MAC, command, message } = msg.payload;
  if (!validateMAC(MAC)) return;

  const { dancer } = dancerTable[MAC];

  const toControlPanelMsg: ToControlPanelCommandResponse = {
    from: "server",
    topic: "command",
    statusCode: msg.statusCode,
    payload: {
      dancer,
      command,
      message,
    },
  };

  sendToControlPanel(toControlPanelMsg);
}

export function handleRPiSyncResponse(ws: WebSocket, msg: FromRPiSyncResponse) {
  const { MAC, command, message } = msg.payload;
  if (!validateMAC(MAC)) return;

  const { dancer } = dancerTable[MAC];

  const toControlPanelMsg: ToControlPanelCommandResponse = {
    from: "server",
    topic: "command",
    statusCode: msg.statusCode,
    payload: {
      dancer,
      command,
      message,
    },
  };

  sendToControlPanel(toControlPanelMsg);
}
