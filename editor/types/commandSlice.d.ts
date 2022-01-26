interface dancerStatusElement {
  dancerName: string;
  ip: string;
  hostname: string;
  isConnected: boolean;
  msg: string;
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
