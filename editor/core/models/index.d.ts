import { ReactiveVar } from "@apollo/client";

/**
 * ControlRecord and ControlMap
 */
export type ControlRecordType = string[]; // array of all IDs , each correspondsto diff status

export interface ControlMapType {
  [index: string]: ControlMapElement;
}

export interface ControlMapElement {
  start: number; //frame's start time
  status: ControlMapStatus;
  fade: boolean; // if this frame fades to the next
}

export interface ControlMapStatus {
  [index: string]: DancerStatus; //dancerNames :  dancerStatus
}

interface DancerStatus {
  [index: string]: Fiber | El | LED; //partNames: partStatus
}

export interface Fiber {
  color: string;
  alpha: number; //brightness
}

export type El = number;

export interface LED {
  src: string;
  alpha: number;
}

/**
 * PosRecord and PosMap
 */
export type PosRecordType = string[]; // array of all IDs , each correspondsto diff status

export interface PosMapType {
  //IDs: {start, pos}
  [index: string]: PosMapElement;
}

export interface PosMapElement {
  start: number;
  pos: DancerCoordinates;
}

export interface DancerCoordinates {
  // dancer: coordinates
  [index: string]: Coordinates;
}

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

/**
 * Time Data
 */
export interface TimeDataType {
  from: string; // update from what component (input bar, or waveSurferApp cursor)
  time: number; // time
  controlFrame: number; // control frame's index
  posFrame: number; // positions' index
}

/**
 * Light Presets
 */
export type LightPresetsType = LightPresetsElement[];
interface LightPresetsElement {
  name: string; // ID named by user
  status: ControlMapStatus;
}

/**
 * Pos Presets
 */
export type PosPresetsType = PosPresetsElement[];
interface PosPresetsElement {
  name: string;
  pos: DancerCoordinates;
}

/**
 * EffectRecordMap and EffectStatusMap
 */
export interface EffectRecordMapType {
  [index: string]: EffectRecordType; // effectName: effectRecord
}
export type EffectRecordType = string[];

export interface EffectStatusMapType {
  [index: string]: EffectStatusMapElementType;
}

interface EffectStatusMapElementType {
  start: number;
  status: EffectStatusType;
  fade: boolean; // if this frame fades to the next
}

export interface EffectStatusType {
  [index: string]: DancerStatus; //dancerNames :  dancerStatus
}

/**
 * Mutable State
 */
export interface State {
  isPlaying: boolean; // isPlaying
  selected: string[]; // array of selected dancer's name
  currentFade: boolean; // current control Frame will fade to next
  currentStatus: ControlMapStatus; // current dancers' status
  currentPos: DancerCoordinates; // currnet dancers' position
  timeData: TimeDataType;
  mode: number; // 0: nothing, 1: edit, 2: add
  effectRecordMap: EffectRecordMapType; // map of all effects and corresponding record ID array
  effectStatusMap: EffectStatusMapType; // map of effect record ID and its status
  lightPresets: LightPresetsType;
  posPresets: PosPresetsType;
}

/**
 * Reactive State, can trigger react component
 */
export interface ReactiveState {
  isPlaying: ReactiveVar<boolean>; // isPlaying
  selected: ReactiveVar<string[]>; // array of selected dancer's name
  currentFade: ReactiveVar<boolean>; // current control Frame will fade to next
  currentStatus: ReactiveVar<ControlMapStatus>; // current dancers' status
  currentPos: ReactiveVar<DancerCoordinates>; // currnet dancers' position
  timeData: ReactiveVar<TimeDataType>;
  mode: ReactiveVar<number>; // 0: nothing, 1: edit, 2: add
  effectRecordMap: ReactiveVar<EffectRecordMapType>; // map of all effects and corresponding record ID array
  effectStatusMap: ReactiveVar<EffectStatusMapType>; // map of effect record ID and its status
  lightPresets: ReactiveVar<LightPresetsType>;
  posPresets: ReactiveVar<PosPresetsType>;
}
