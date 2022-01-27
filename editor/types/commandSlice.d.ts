interface dancerStatusElement {
  dancerName?: string;
  ip: string;
  hostname?: string;
  isConnected: boolean;
  msg: string;
  OK?: boolean;
}
export interface boardConfigType {
  [index: string]: {
    type: string;
    ip: string;
    dancerName: string;
  };
}
export interface dancerStatusType {
  [index: string]: dancerStatusElement;
}
export interface commandState {
  play: boolean;
  stop: boolean;
  startTime: number;
  sysTime: number;
  dancerStatus: dancerStatusType;
}
