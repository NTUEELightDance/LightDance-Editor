interface Fiber {
  color: string;
  alpha: number;
}

type El = number;

interface LED {
  src: string;
  alpha: number;
}

interface ControlMapStatus {
  [index: string]: Fiber | El | LED;
}

interface ControlMapElement {
  start: number;
  status: ControlMapStatus;
  fade: boolean;
}

export interface ControlMap {
  [index: string]: ControlMapElement;
}
