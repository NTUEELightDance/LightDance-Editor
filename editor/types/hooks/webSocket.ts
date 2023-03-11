interface PlayTimeType {
  startTime: number; // ms
  delay: number; // ms
  sysTime: number; // ms, unix time stamp
}
interface InfoType {
  type: string; // ex.RPI
  dancerName?: string; // only needed when type is RPI
  ip?: string; // only needed when type is RPI
  hostName?: string; // only needed when type is RPI
}
interface SyncType {
  delay: number;
  offset: number;
}
type LightStatusType = any;
interface BoardInfoS2CType {
  dancerName: string[]; // array of dancerNames
  ip: string[]; // array of ips
  hostName: string[]; // array of hostNames
}
interface BoardInfoC2SType {
  command: string;
  payload: { type: string };
}
interface ServerMessage {
  command: string; // ex. COMMANDS.START
  payload: {
    from: string; // dancer name
    success: boolean;
    info: string | InfoType | SyncType | BoardInfoS2CType;
  };
}
interface ClientMessage {
  command: string; // ex. COMMANDS.START
  selectedDancers: string[]; // if no dancer -> []
  payload?: string | PlayTimeType | LightStatusType | InfoType; // correspond to command
}
interface setMessageType {
  dancer: string;
  msg: string;
  Ok?: boolean;
  isConnected?: boolean;
}
interface statusType {
  hostname: string; // Rpi's hostname, to distinguish Rpis
  ip: string; // Rpi's ip
  Ok: boolean; // Rpi's status is Ok after command
  msg: string; // response message from Rpis
  isConnected: boolean; // if Rpi is connected to server
}
type DancerStatusType = Record<string, statusType>;
interface panelPayloadType {
  command: string;
  selectedDancers: string[];
  delay: number;
}
export {
  SyncType,
  ServerMessage,
  ClientMessage,
  BoardInfoS2CType,
  BoardInfoC2SType,
  setMessageType,
  DancerStatusType,
  panelPayloadType,
};
