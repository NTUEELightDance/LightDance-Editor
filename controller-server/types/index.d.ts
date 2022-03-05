import ControlPanelSocket from "./controlPanelSocket";
import DancerSocket from "./dancerSocket";

interface LightStatusType {}
interface PlayTimeType {
  startTime: number;
  delay: number;
  sysTime: number;
}
// type controlJson = ?;
// type LedType = ?;
// Above type are for payload definition
type PayloadType = number | string | LightStatusType | PlayTimeType;
interface SocketMes {
  command: string;
  payload?: PayloadType;
}
interface dancerClientDic {
  [key: string]: DancerSocket;
}
interface controlPanelClientDic {
  [key: string]: ControlPanelSocket;
}
interface Dic {
  [key: string]: any;
}
interface clientsAgent {
  addDancerClient: Function;
  deleteDancerClient: Function;
  getDancerClients: Function;
  socketReceiveData: Function;
}

export {
  LightStatusType,
  PlayTimeType,
  PayloadType,
  dancerClientDic,
  controlPanelClientDic,
  SocketMes,
  Dic,
  clientsAgent,
};
