import { ReactiveVar } from "@apollo/client";
import { CONTROL_EDITOR, POS_EDITOR, IDLE, EDITING, ADDING } from "constants";
import { number, string } from "prop-types";

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
 * Editing
 */
export type EditModeType = IDLE | EDITING | ADDING;
export type EditorType = CONTROL_EDITOR | POS_EDITOR;
export interface EditingDataType {
  start: number;
  frameId: string;
  index: number;
}

/**
 * Mutable State
 */
export interface State {
  isPlaying: boolean; // isPlaying
  selected: string[]; // array of selected dancer's name

  currentTime: number; // current time
  currentControlIndex: number; // current index in controlRecord
  currentPosIndex: number; // current index in posRecord

  currentFade: boolean; // current control Frame will fade to next
  currentStatus: ControlMapStatus; // current dancers' status
  currentPos: DancerCoordinates; // current dancers' position

  editMode: EditModeType; // IDLE | EDITING | ADDING
  editor: EditorType; // editor, should be CONTROL_EDITOR or POS_EDITOR
  editingData: EditingDataType; // store the editingData's start time id and index

  effectRecordMap: EffectRecordMapType; // map of all effects and corresponding record ID array
  effectStatusMap: EffectStatusMapType; // map of effect record ID and its status
}

/**
 * Reactive State, can trigger react component
 */
export interface ReactiveState {
  isPlaying: ReactiveVar<boolean>; // isPlaying
  selected: ReactiveVar<string[]>; // array of selected dancer's name

  currentTime: ReactiveVar<number>; // current time
  currentControlIndex: ReactiveVar<number>; // current index in controlRecord
  currentPosIndex: ReactiveVar<number>; // current index in posRecord

  currentFade: ReactiveVar<boolean>; // current control Frame will fade to next
  currentStatus: ReactiveVar<ControlMapStatus>; // current dancers' status
  currentPos: ReactiveVar<DancerCoordinates>; // current dancers' position

  editMode: ReactiveVar<EditModeType>;
  editor: ReactiveVar<EditorType>;
  editingData: ReactiveVar<EditingDataType>;

  effectRecordMap: ReactiveVar<EffectRecordMapType>; // map of all effects and corresponding record ID array
  effectStatusMap: ReactiveVar<EffectStatusMapType>; // map of effect record ID and its status
}
