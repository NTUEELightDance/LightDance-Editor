interface FromControlPanelBase {
  from: "controlPanel";
  command: string;
}

export interface FromControlPanelBoardInfo extends FromControlPanelBase {
  command: "boardInfo";
}

export interface FromControlPanelPlay extends FromControlPanelBase {
  command: "play";
}

export interface FromControlPanelPause extends FromControlPanelBase {
  command: "pause";
}

export interface FromControlPanelStop extends FromControlPanelBase {
  command: "stop";
}

export interface FromControlPanelReboot extends FromControlPanelBase {
  command: "reboot";
}

export interface FromControlPanelTest extends FromControlPanelBase {
  command: "test";
}

export interface FromControlPanelRed extends FromControlPanelBase {
  command: "red";
}

export interface FromControlPanelGreen extends FromControlPanelBase {
  command: "green";
}

export interface FromControlPanelBlue extends FromControlPanelBase {
  command: "blue";
}

export interface FromControlPanelDarkAll extends FromControlPanelBase {
  command: "darkAll";
}

export type FromControlPanel =
  | FromControlPanelBoardInfo
  | FromControlPanelPlay
  | FromControlPanelPause
  | FromControlPanelStop
  | FromControlPanelTest
  | FromControlPanelRed
  | FromControlPanelGreen
  | FromControlPanelBlue
  | FromControlPanelDarkAll;

export interface ToControlPanelDisconnect {
  command: "disconnect";
  payload: {
    from: string;
    success: false;
    info: "dancer disconnect";
  };
}

export type ToControlPanel = ToControlPanelDisconnect;
