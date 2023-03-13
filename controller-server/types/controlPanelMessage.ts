import { DancerData } from "./schema/DancerData";

interface FromControlPanelBase {
  from: "controlPanel";
  topic: string;
}

export interface FromControlPanelBoardInfo extends FromControlPanelBase {
  topic: "boardInfo";
}

export interface FromControlPanelPlay extends FromControlPanelBase {
  topic: "play";
  payload: {
    dancers: string[];
    start: number;
    delay: number;
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

export interface FromControlPanelDarkAll extends FromControlPanelBase {
  topic: "darkAll";
  payload: {
    dancers: string[];
  };
}

export type FromControlPanel =
  | FromControlPanelBoardInfo
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
  | FromControlPanelDarkAll;

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
  };
}

export type ToControlPanel =
  | ToControlPanelBoardInfo
  | ToControlPanelCommandResponse;
