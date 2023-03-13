export interface FromRPiBoardInfo {
  from: "RPi";
  command: "boardInfo";
  status: number;
  payload: {
    macaddr: string;
  };
}

export interface FromRPiResponse {
  from: "RPi";
  command: ToRPi["payload"];
  status: number;
  payload: {
    message: string;
  };
}

export type FromRPi = FromRPiBoardInfo | FromRPiResponse;

// interface PinMap {}

// interface OF {}

// interface LED {}

// playerctl play [start(mili sec)] [end(mili sec)] -d [delay(sec)]
interface ToRPiPlay {
  action: "command";
  payload: ["playerctl", "play", number, number, "-d", number];
}

interface ToRPiPause {
  action: "command";
  payload: ["playerctl", "pause"];
}

interface ToRPiStop {
  action: "command";
  payload: ["playerctl", "stop"];
}

interface ToRPiQuit {
  action: "command";
  payload: ["playerctl", "quit"];
}

interface ToRPiReboot {
  action: "command";
  payload: ["playerctl", "restart"];
}

interface ToRPiList {
  action: "command";
  payload: ["list"];
}

// TODO: define type for color with re
type Color = string;

// ledtest --hex color(hex without)
interface ToRpiLEDTest {
  action: "command";
  payload: ["ledtest", "--hex", Color];
}

// oftest --hex color(hex without)
interface ToRpiOFTest {
  action: "command";
  payload: ["oftest", "--hex", Color];
}

// interface ToRPiUpload {
//   action: "upload";
//   payload: [PinMap, OF, LED];
// }

export type ToRPi =
  | ToRPiPlay
  | ToRPiPause
  | ToRPiStop
  | ToRPiQuit
  | ToRPiReboot
  | ToRPiList
  | ToRpiLEDTest
  | ToRpiOFTest;
// | ToRPiUpload;
