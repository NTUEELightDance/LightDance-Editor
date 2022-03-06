import ControlPanelSocket from "./controlPanelSocket";
import DancerSocket from "./dancerSocket";
import { DancerName } from "./dancer"

// Command Type
enum CommandType {
  SYNC = "sync",
  UPLOAD_LED = "uploadLed",
  UPLOAD_CONTROL = "uploadControl",
  LOAD = "load",
  PLAY = "play",
  PAUSE = "pause",
  STOP = "stop",
  LIGTHCURRENTSTATUS = "lightCurrentStatus",
  KICK = "kick",
  SHUTDOWN = "shutdown",
  REBOOT = "reboot",
  BOARDINFO = "boardinfo",
  INIT = "init",
  TEST = "test"
}

// General payload type
// request only
type TimeType = number;
interface LightStatusType {}
interface PlayTimeType {
  startTime: TimeType,  // ms
  delay: TimeType,  // ms
  sysTime: TimeType  // ms
}
interface ControlType {
  // TODO
}
interface LedType {
  // TODO
}
// response only
enum ClientType {
  CONTROLPANEL = "controlpanel",
  RPI = "rpi"
}
interface BoardInfoType {
  type: ClientType,
  name: string,
  ip?: string  // only needed when type is RPI
}
interface SyncType {
  delay: TimeType,  // ms
  offset: TimeType  // ms
}

// Websocket message interface
// Control Panel to Server
interface MesC2S {
  command: CommandType,
  selectedDancers: [DancerName],
  payload: PlayTimeType | LightStatusType | ControlType | LedType
}
// Server to Control Panel
interface MesS2C {
  command: CommandType,
  payload: {
    from: DancerName,
    success: boolean,
    info: string | BoardInfoType | SyncType
  }
}
// Server to RPi
interface MesS2R {
  command: CommandType,
  payload: PlayTimeType | LightStatusType | ControlType | LedType
}
// RPi to Server
interface MesR2S {
  command: CommandType,
  payload: {
    success: boolean,
    info: string | BoardInfoType | SyncType
  }
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
// Agents
interface clientsAgent {
  addDancerClient: Function;
  deleteDancerClient: Function;
  getDancerClients: Function;
  socketReceiveData: Function;
}

export {
  CommandType,
  TimeType,
  LightStatusType,
  PlayTimeType,
  ControlType,
  LedType,
  ClientType,
  BoardInfoType,
  SyncType,
  MesC2S,
  MesS2C,
  MesS2R,
  MesR2S,
  dancerClientDic,
  controlPanelClientDic,
  Dic,
  clientsAgent,
};
