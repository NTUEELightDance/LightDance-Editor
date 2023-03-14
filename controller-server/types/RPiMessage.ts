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
  payload: ["playerctl", "play", number, "-d", number];
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

// ledtest --hex color(hex without #)
export interface ToRPiLEDTest extends ToRPiBase {
  topic: "command";
  payload: ["ledtest", "--hex", Color];
}

// oftest --hex color(hex without #)
export interface ToRPiOFTest extends ToRPiBase {
  topic: "command";
  payload: ["oftest", "--hex", Color];
}

export interface ToRPiUpload extends ToRPiBase {
  topic: "upload";
  payload: [PinMap, OF, LED];
}

export type ToRPi =
  | ToRPiPlay
  | ToRPiPause
  | ToRPiStop
  | ToRPiList
  | ToRPiLoad
  | ToRPiLEDTest
  | ToRPiOFTest
  | ToRPiUpload;
