import { PinMap } from "../schema/PinMapTable";
import { OF, LED } from "../schema/global";
import { MACAddress } from "../schema/DancerData";

interface FromRPiBase {
  from: "RPi";
  topic: string;
  statusCode: number;
}

export interface FromRPiBoardInfo extends FromRPiBase {
  from: "RPi";
  topic: "boardInfo";
  payload: {
    MAC: MACAddress;
  };
}

export interface FromRPiCommandResponse extends FromRPiBase {
  from: "RPi";
  topic: "command";
  payload: {
    MAC: MACAddress;
    command: string;
    message: string;
  };
}

export type FromRPi = FromRPiBoardInfo | FromRPiCommandResponse;

// interface PinMap {}

// interface OF {}

// interface LED {}

interface ToRPiBase {
  from: "server";
  topic: string;
  statusCode: number;
}

// playerctl play [start(mili-sec)] -d [delay(mili-sec)]
export interface ToRPiPlay extends ToRPiBase {
  topic: "command";
  payload: ["playerctl", "play", string, "-d", string];
}

export interface ToRPiPause extends ToRPiBase {
  topic: "command";
  payload: ["playerctl", "pause"];
}

export interface ToRPiStop extends ToRPiBase {
  topic: "command";
  payload: ["playerctl", "stop"];
}

export interface ToRPiList extends ToRPiBase {
  topic: "command";
  payload: ["list"];
}

export interface ToRPiLoad extends ToRPiBase {
  topic: "command";
  payload: ["load"];
}

// TODO: define type for color with re
type Color = string;

export interface ToRPiPartTest extends ToRPiBase {
  topic: "command";
  payload: ["parttest", "--hex", Color, "-a", "10" | "0"];
}

export interface ToRPiCloseGPIO extends ToRPiBase {
  topic: "command";
  payload: ["close"];
}

export interface ToRPiReboot extends ToRPiBase {
  topic: "command";
  payload: ["restart"];
}

export interface ToRPiWebShell extends ToRPiBase {
  topic: "command";
  payload: [string];
}

export interface ToRPiUpload extends ToRPiBase {
  topic: "upload";
  payload: [PinMap, OF, LED];
}

export interface ToRPiSync extends ToRPiBase {
  topic: "sync";
  payload: string;
}

export type ToRPi =
  | ToRPiPlay
  | ToRPiPause
  | ToRPiStop
  | ToRPiList
  | ToRPiLoad
  | ToRPiPartTest
  | ToRPiCloseGPIO
  | ToRPiReboot
  | ToRPiWebShell
  | ToRPiUpload
  | ToRPiSync;
