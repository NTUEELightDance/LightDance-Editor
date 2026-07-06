import { DancerData } from "../schema/DancerData";

interface FromControlPanelBase {
  from: "controlPanel";
  topic: string;
  statusCode: number;
}

export interface FromControlPanelBoardInfo extends FromControlPanelBase {
  topic: "boardInfo";
}

export interface FromControlPanelSync extends FromControlPanelBase {
  topic: "sync";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelPlay extends FromControlPanelBase {
  topic: "play";
  payload: {
    dancers: string[];
    start: number;
    timestamp: number;
  };
}

export interface FromControlPanelPause extends FromControlPanelBase {
  topic: "pause";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelStop extends FromControlPanelBase {
  topic: "stop";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelLoad extends FromControlPanelBase {
  topic: "load";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelUpload extends FromControlPanelBase {
  topic: "upload";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelReboot extends FromControlPanelBase {
  topic: "reboot";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelTest extends FromControlPanelBase {
  topic: "test";
  payload: {
    dancers: string[];
    // #ffffff
    colorCode: string;
  };
}

export interface FromControlPanelRed extends FromControlPanelBase {
  topic: "red";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelGreen extends FromControlPanelBase {
  topic: "green";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelBlue extends FromControlPanelBase {
  topic: "blue";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelYellow extends FromControlPanelBase {
  topic: "yellow";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelMagenta extends FromControlPanelBase {
  topic: "magenta";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelCyan extends FromControlPanelBase {
  topic: "cyan";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelDark extends FromControlPanelBase {
  topic: "dark";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelWhite extends FromControlPanelBase {
  topic: "white";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelDarkAll extends FromControlPanelBase {
  topic: "darkAll";
}

export interface FromControlPanelCloseGPIO extends FromControlPanelBase {
  topic: "close";
  payload: {
    dancers: string[];
  };
}

export interface FromControlPanelWebShell extends FromControlPanelBase {
  topic: "webShell";
  payload: {
    dancers: string[];
    command: string;
  };
}

export type FromControlPanel =
  | FromControlPanelBoardInfo
  | FromControlPanelSync
  | FromControlPanelPlay
  | FromControlPanelPause
  | FromControlPanelStop
  | FromControlPanelLoad
  | FromControlPanelUpload
  | FromControlPanelReboot
  | FromControlPanelTest
  | FromControlPanelRed
  | FromControlPanelGreen
  | FromControlPanelBlue
  | FromControlPanelYellow
  | FromControlPanelMagenta
  | FromControlPanelCyan
  | FromControlPanelDark
  | FromControlPanelWhite
  | FromControlPanelDarkAll
  | FromControlPanelCloseGPIO
  | FromControlPanelWebShell;

export interface ToControlPanelBase {
  from: "server";
  topic: string;
  statusCode: number;
}

export interface ToControlPanelBoardInfo extends ToControlPanelBase {
  topic: "boardInfo";
  payload: DancerData;
}

export interface ToControlPanelCommandResponse extends ToControlPanelBase {
  topic: "command";
  payload: {
    command: string;
    message: string;
    dancer: string;
  };
}

export type ToControlPanel =
  | ToControlPanelBoardInfo
  | ToControlPanelCommandResponse;
