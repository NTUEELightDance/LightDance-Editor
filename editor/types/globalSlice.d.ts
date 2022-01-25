interface Fiber {
  color: string;
  alpha: number; //brightness
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
  start: number; //frame's start time
  status: ControlMapStatus;
  fade: boolean; // if this frame fades to the next
}
interface timeDataType {
  from: string; // update from what component
  time: number; // time
  controlFrame: number; // control frame's index
  posFrame: number; // positions' index
}
interface coordinates {
  x: number;
  y: number;
  z: number;
}

interface positionType {
  [index: string]: coordinates; //dancer corresponds to his/her position
}

interface posRecordElement {
  pos: positionType;
  start: number; //start time
}

interface lightPresetsElement {
  name: string; // ID named by user
  status: ControlMapStatus;
}
interface posPresetsElement {
  name: string;
  pos: positionType;
}
type LightPresetsType = lightPresetsElement[];
type posPresetsType = posPresetsElement[];
export interface posRecordType {
  [index: number]: posRecordElement;
}
export type ControlRecordType = string[]; // array of all IDs , each correspondsto diff status

export interface ControlMapType {
  [index: string]: ControlMapElement;
}
export interface globalState {
  isPlaying: boolean; // isPlaying
  selected: string[]; // array of selected dancer's name
  currentFade: boolean; // current control Frame will fade to next
  currentStatus: ControlMapStatus; // current dancers' status
  currentPos: positionType; // currnet dancers' position
  controlRecord: controlRecordType; // array of all IDs , each correspondsto diff status
  controlMap: controlMapType;
  posRecord: posRecordType; // array of all dancer's pos
  timeData: timeDataType;
  mode: number; // 0: nothing, 1: edit, 2: add
  lightPresets: lightPresetsType;
  posPresets: posPresetsType;
}
