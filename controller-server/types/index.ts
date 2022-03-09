import ControlPanelSocket from "../test_websocket/controlPanelSocket";
import DancerSocket from "../test_websocket/dancerSocket";
import { DancerName } from "./dancer";
import { CommandType } from "../constants/index";

// General payload type
// request only
type TimeType = number;
interface LightStatusType { }
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
  name: string;
  ip?: string; // only needed when type is RPI
}
interface SyncType {
  delay: TimeType; // ms
  offset: TimeType; // ms
}

// Websocket message interface
// Control Panel to Server
interface MesC2S {
  command: CommandType;
  selectedDancers: [DancerName];
  payload: PlayTimeType | LightStatusType | InfoType; // Control panel frontend info
}
// Server to Control Panel
interface MesS2C {
  command: CommandType;
  payload: {
    from?: DancerName;
    success: boolean;
    info: string | InfoType | SyncType; // RPi info
  };
}
// Server to RPi
interface MesS2R {
  command: CommandType;
  payload?: PlayTimeType | LightStatusType | ControlType | LedType;
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
