interface Fiber {
  color: string;
  alpha: number; //brightness
}

type El = number;

export interface LED {
  src: string;
  alpha: number;
}

interface DancerStatus {
  [index: string]: Fiber | El | LED; //partNames: partStatus
}

export interface ControlMapStatus {
  [index: string]: DancerStatus; //dancerNames :  dancerStatus
}

export interface ControlMapElement {
  start: number; //frame's start time
  status: ControlMapStatus;
  fade: boolean; // if this frame fades to the next
}
interface timeDataType {
  from: string; // update from what component (input bar, or waveSurferApp cursor)
  time: number; // time
  controlFrame: number; // control frame's index
  posFrame: number; // positions' index
}
export interface coordinates {
  x: number;
  y: number;
  z: number;
}

export interface positionType {
  [index: string]: coordinates; //dancer corresponds to his/her position
}

export interface posRecordElement {
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
export type lightPresetsType = lightPresetsElement[];
export type posPresetsType = posPresetsElement[];

export type posRecordType = Array<posRecordElement>;
export type ControlRecordType = string[]; // array of all IDs , each correspondsto diff status

export interface ControlMapType {
  [index: string]: ControlMapElement;
}

//  for effect list
type EffectRecordType = string[];

interface EffectRecordMapType {
  [index: string]: EffectRecordType; // effectName: effectRecord
}

interface EffectStatusType {
  [index: string]: DancerStatus; //dancerNames :  dancerStatus
}

interface EffectStatueMapElementType {
  start: number;
  status: EffectStatus;
  fade: boolean; // if this frame fades to the next
}

interface EffectStatusMapType {
  [index: string]: EffectStatueMapElement;
}

export interface globalState {
  isPlaying: boolean; // isPlaying
  selected: string[]; // array of selected dancer's name
  currentFade: boolean; // current control Frame will fade to next
  currentStatus: ControlMapStatus; // current dancers' status
  currentPos: positionType; // currnet dancers' position
  controlRecord: ControlRecordType; // array of all IDs , each corresponds to diff status
  controlMap: ControlMapType;
  effectRecordMap: EffectRecordMapType; // map of all effects and corresponding record ID array
  effectStatusMap: EffectStatusMapType; // map of effect record ID and its status
  posRecord: posRecordType; // array of all dancer's pos
  timeData: timeDataType;
  mode: number; // 0: nothing, 1: edit, 2: add
  lightPresets: lightPresetsType;
  posPresets: posPresetsType;
}
