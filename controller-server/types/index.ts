import ControlPanelSocket from "../websocket/controlPanelSocket";
import DancerSocket from "../websocket/dancerSocket";
import { CommandType } from "../constants/index";

// General payload type
// request only
type TimeType = number;
interface LightStatusType { } // TODO: specify LightCurrentStatus
interface PlayTimeType {
  startTime: TimeType; // ms
  delay: TimeType; // ms
  sysTime: TimeType; // ms
}
interface ControlType {
  // TODO
}
interface LedType {
  // TODO
}
// response only
enum ClientType {
  CONTROLPANEL = "controlPanel",
  RPI = "RPi",
}
interface InfoType {
  type: ClientType;
  dancerName?: string;
  ip?: string; // only needed when type is RPI
  hostName?: string;
}
interface SyncType {
  delay: TimeType; // ms
  offset: TimeType; // ms
}

// Websocket message interface
// Control Panel to Server
interface MesC2S {
  command: CommandType;
  selectedDancers: [string];
  payload: string | PlayTimeType | LightStatusType | InfoType; // Control panel frontend info
}
// Server to Control Panel
interface MesS2C {
  command: CommandType;
  payload: {
    from?: string; // DancerName type
    success: boolean;
    info: string | InfoType | SyncType; // RPi info
  };
}
// Server to RPi
interface MesS2R {
  command: CommandType;
  payload?: string | PlayTimeType | LightStatusType | ControlType | LedType;
}
// RPi to Server
interface MesR2S {
  command: CommandType;
  payload: {
    success: boolean;
    info: string | InfoType | SyncType; // RPi info
  };
}

// Client dictionaries
interface dancerClientDic {
  [key: string]: DancerSocket;
}
interface controlPanelClientDic {
  [key: string]: ControlPanelSocket;
}
interface Dic {
  [key: string]: any;
}

export {
  CommandType,
  TimeType,
  LightStatusType,
  PlayTimeType,
  ControlType,
  LedType,
  ClientType,
  InfoType,
  SyncType,
  MesC2S,
  MesS2C,
  MesS2R,
  MesR2S,
  dancerClientDic,
  controlPanelClientDic,
  Dic,
};
