interface ToControllerServerBase {
  from: "controlPanel";
  topic: string;
  statusCode: number;
}

export interface ToControllerServerBoardInfo extends ToControllerServerBase {
  topic: "boardInfo";
}

export interface ToControllerServerSync extends ToControllerServerBase {
  topic: "sync";
  payload: {
    dancers: string[];
  };
}

export interface ToControllerServerPlay extends ToControllerServerBase {
  topic: "play";
  payload: {
    dancers: string[];
    start: number;
    timestamp: number;
  };
}

export interface ToControllerServerPause extends ToControllerServerBase {
  topic: "pause";
  payload: {
    dancers: string[];
  };
}

export interface ToControllerServerStop extends ToControllerServerBase {
  topic: "stop";
  payload: {
    dancers: string[];
  };
}

export interface ToControllerServerLoad extends ToControllerServerBase {
  topic: "load";
  payload: {
    dancers: string[];
  };
}

export interface ToControllerServerUpload extends ToControllerServerBase {
  topic: "upload";
  payload: {
    dancers: string[];
  };
}

export interface ToControllerServerReboot extends ToControllerServerBase {
  topic: "reboot";
  payload: {
    dancers: string[];
  };
}

export interface ToControllerServerTest extends ToControllerServerBase {
  topic: "test";
  payload: {
    dancers: string[];
    colorCode: string;
  };
}

export interface ToControllerServerRGB extends ToControllerServerBase {
  topic: "red" | "green" | "blue" | "yellow" | "cyan" | "magenta";
  payload: {
    dancers: string[];
  };
}

export interface ToControllerServerDarkAll extends ToControllerServerBase {
  topic: "darkAll";
  payload: {
    dancers: string[];
  };
}

export interface ToControllerServerCloseGPIO extends ToControllerServerBase {
  topic: "close";
  payload: {
    dancers: string[];
  };
}

export interface ToControllerServerWebShell extends ToControllerServerBase {
  topic: "webShell";
  payload: {
    dancers: string[];
    command: string;
  };
}

export type ToControllerServer =
  | ToControllerServerBoardInfo
  | ToControllerServerSync
  | ToControllerServerPlay
  | ToControllerServerPause
  | ToControllerServerStop
  | ToControllerServerLoad
  | ToControllerServerUpload
  | ToControllerServerReboot
  | ToControllerServerTest
  | ToControllerServerRGB
  | ToControllerServerDarkAll
  | ToControllerServerCloseGPIO
  | ToControllerServerWebShell;

export type DancerData = Record<
  string,
  {
    IP: string;
    MAC: string;
    dancer: string;
    hostname: string;
    connected: boolean;
    interface: "wifi" | "ethernet";
  }
>;

export interface FromControllerServerBase {
  from: "server";
  topic: string;
  statusCode: number;
}

export interface FromControllerServerBoardInfo
  extends FromControllerServerBase {
  topic: "boardInfo";
  payload: DancerData;
}

export interface FromControllerServerCommandResponse
  extends FromControllerServerBase {
  topic: "command";
  payload: {
    command: string;
    message: string;
    dancer: string;
  };
}

export type FromControllerServer =
  | FromControllerServerBoardInfo
  | FromControllerServerCommandResponse;
