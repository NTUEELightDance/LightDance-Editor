import ControlPanelSocket from "../websocket/controlPanelSocket";
import DancerSocket from "../websocket/dancerSocket";
import { ActionType, CommandSubType } from "../constants/index";
import { ControlJsonType } from "../database/dancerControlJson";
import { OfJsonType } from "../database/dancerOF";
import { LedJsonType } from "../database/dancerLED";

// General payload type
// request only
type TimeType = number;
interface LightStatusType { } // TODO: specify LightCurrentStatus
interface PlayTimeType {
  startTime: TimeType; // ms
  delay: TimeType; // ms
  sysTime: TimeType; // ms
}
interface Dic {
  [key: string]: any;
}

// Old Protocol : type ControlType = Dic
interface SingleDancerControlType  {
  "start": number;
  "fade": boolean;
  "status": {
    [key: string]: number[] /* for Of */;
  } | number[][] /* for LED */
}
type ControlType ={
  [key: string]: SingleDancerControlType;
} 

type LedType = Dic

// response only
enum ClientType {
  CONTROLPANEL = "controlPanel",
  RPI = "RPi",
}

// Upload Payload = [control.json, Of.json, Led.json]
type UploadPayloadType = [ControlJsonType | undefined, OfJsonType | undefined, LedJsonType | undefined];
interface InfoType {
  type: ClientType;
  macaddr?: string,
  dancerName?: string;
  ip?: string; // only needed when type is RPI
  hostName?: string;
}
interface MacAddrType {
  type: ClientType;
  macaddr: string;
}
interface SyncType {
  delay: TimeType; // ms
  offset: TimeType; // ms
}

// Websocket message interface
// Control Panel to Server
interface MesC2S {
  command: ActionType;
  selectedDancers: [string];
  payload: string | PlayTimeType | LightStatusType | InfoType; // Control panel frontend info
}
// Server to Control Panel
interface MesS2C {
  command: ActionType;
  payload: {
    from?: string; // DancerName type
    success: boolean;
    info: string | InfoType | SyncType; // RPi info
  };
}
// Server to RPi
// In new protocol, the type of ControlType is strictly defined
interface MesS2R {
  action: ActionType;
  payload?: string | PlayTimeType | LightStatusType | ControlType | LedType | CommandSubType[]; 
}
// RPi to Server
interface MesR2S {
  command: ActionType;
  status: boolean, // added 
  payload: {
    // success: boolean;
    info: string | InfoType | SyncType | MacAddrType; // RPi info
  };
}

// Client dictionaries
interface dancerClientDic {
  [key: string]: DancerSocket;
}
interface controlPanelClientDic {
  [key: string]: ControlPanelSocket;
}

export {
  ActionType,
  TimeType,
  LightStatusType,
  PlayTimeType,
  SingleDancerControlType,
  ControlType,
  LedType,
  ClientType,
  InfoType,
  MacAddrType,
  SyncType,
  MesC2S,
  MesS2C,
  MesS2R,
  MesR2S,
  dancerClientDic,
  controlPanelClientDic,
  Dic,
};
