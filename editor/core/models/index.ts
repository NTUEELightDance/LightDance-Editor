import type { ReactiveVar } from "@apollo/client";
import { Color } from "three";

export type id = string;
export type index = number;
export type DancerName = string;
export type PartName = string;
export type LEDPartName = string & { __ledPartName: never };

export function isLEDPartName(partName: unknown): partName is LEDPartName {
  return typeof partName === "string" && partName.startsWith("_LED");
}

export type ColorName = string;
export type ColorCode = string & { __colorCode: never };
export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];

export function isColorCode(colorCode: unknown): colorCode is ColorCode {
  if (typeof colorCode !== "string") return false;
  return /^#[0-9a-fA-F]{6}$/i.test(colorCode);
}

/**
 * ControlRecord and ControlMap
 */
export type ControlRecord = id[]; // array of all IDs , each corresponds to diff status

export type ControlMap = Record<id, ControlMapElement>;

export interface ControlMapElement {
  start: number; // frame's start time
  status: ControlMapStatus;
  fade: boolean; // if this frame fades to the next
}

export type ControlMapStatus = Record<DancerName, DancerStatus>;

export function isControlMapStatus(
  status: ControlMapStatus | PosMapStatus
): status is ControlMapStatus {
  const values = Object.values(status);
  return isDancerStatus(values[0]) || values.length === 0;
}

export type DancerStatus = Record<PartName, PartData>;

export function isDancerStatus(status: unknown): status is DancerStatus {
  if (typeof status !== "object" || status === null) return false;
  const values = Object.values(status);
  return isPartData(values[0]) || values.length === 0;
}

export type PartData = LEDData | FiberData | ELData;

export function isPartData(partData: PartData): partData is PartData {
  return isFiberData(partData) || isLEDData(partData) || isELData(partData);
}

export interface FiberData {
  color: string;
  alpha: number; // brightness
  colorCode?: Color; // this is a three type Color, for doing color fade
}

export function isFiberData(partData: PartData): partData is FiberData {
  return (
    typeof (partData as FiberData)?.color === "string" &&
    typeof (partData as FiberData)?.alpha === "number"
  );
}

export interface LEDData {
  src: string;
  alpha: number;
}

export function isLEDData(partData: PartData): partData is LEDData {
  return (
    typeof (partData as LEDData)?.src === "string" &&
    typeof (partData as LEDData)?.alpha === "number"
  );
}

export type ELData = number;

export function isELData(partData: PartData): partData is ELData {
  return typeof partData === "number";
}

export type CurrentStatusDelta = Record<DancerName, DancerStatus>;

export type ControlMapQueryPayload = {
  [frameId: id]: {
    fade: boolean;
    start: number;
    status: DancerStatusQueryPayload[];
  };
};

export type DancerStatusQueryPayload = Array<
  FiberDataQueryPayload | LEDDataQueryPayload
>;

export type FiberDataQueryPayload = [ColorName, number];

export type LEDDataQueryPayload = [string, number];

export type ControlMapStatusMutationPayload = DancerStatusMutationPayload[];

export type DancerStatusMutationPayload = [string, string][];

/**
 * PosRecord and PosMap
 */
export type PosRecord = id[]; // array of all IDs , each corresponds to diff status

export type PosMap = Record<id, PosMapElement>;

export interface PosMapElement {
  start: number;
  pos: PosMapStatus;
}

export type PosMapStatus = Record<DancerName, Coordinates>;

export function isPosMapStatus(
  status: ControlMapStatus | PosMapStatus
): status is PosMapStatus {
  const values = Object.values(status);
  return isCoordinates(values[0]) || values.length === 0;
}
export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export function isCoordinates(
  coordinates: unknown
): coordinates is Coordinates {
  return (
    typeof (coordinates as Coordinates)?.x === "number" &&
    typeof (coordinates as Coordinates)?.y === "number" &&
    typeof (coordinates as Coordinates)?.z === "number"
  );
}

export type PosMapPayload = {
  [frameId: id]: {
    start: number;
    pos: CoordinatesPayload[];
  };
};

export type CoordinatesPayload = [number, number, number];

/**
 * Editing
 */
export type EditMode = "IDLE" | "EDITING";
export type Editor = "CONTROL_EDITOR" | "POS_EDITOR" | "LED_EDITOR";
export interface EditingData {
  start: number;
  frameId: string;
  index: number;
}

/**
 * selected dancer and parts
 */
export type Selected = Record<
  string,
  {
    selected: boolean;
    parts: string[];
  }
>;

export type SelectedPartPayload = Record<DancerName, PartName[]>;

/**
 * selection mode
 */
export type SelectionMode =
  | "DANCER_MODE"
  | "PART_MODE"
  | "POSITION_MODE"
  | "LED_MODE";

/**
 * PartTypeMap
 */
export type PartTypeMap = Record<string, PartType>;

// PartType
export type PartType = "LED" | "FIBER" | "El";

/**
 * DancerType
 */
export type Dancers = Record<DancerName, PartName[]>;

export type DancersPayload = DancersArray;

/**
 * ColorMap
 */
export type ColorMap = Record<ColorName, ColorCode>;

export function isColorMap(colorMap: unknown): colorMap is ColorMap {
  return Object.values(colorMap as ColorMap).every(isColorCode);
}

/**
 * Led Effect Map, get from backend
 */
export type LEDMap = Record<PartName, Record<LEDEffectName, LEDEffect>>;

type LEDEffectName = string;

export interface LEDEffect {
  repeat: number; // repeat counts, 0 for continuously repeat
  effects: LEDEffectFrame[];
}

export interface LEDEffectFrame {
  start: number;
  fade: boolean;
  effect: LEDBulbData[]; // ColorCode array for led strips
}

export type LEDMapPayload = Record<
  PartName,
  Record<LEDEffectName, LEDEffectPayload>
>;
export interface LEDEffectPayload {
  repeat: number; // repeat counts, 0 for continuously repeat
  frames: LEDEffectFramePayload[];
}
export interface LEDEffectFramePayload {
  start: number;
  fade: boolean;
  // [r, g, b, alpha(0-10)]
  LEDs: RGBA[];
}

/**
 * LedEffectRecord
 * Save dancer LED part's appearing record id
 * Generated from controlMap and controlRecord, but stripped out the `no-effect` source
 *
 */
export type LEDEffectRecord = Record<DancerName, Record<PartName, LEDRecord>>;

export type LEDRecord = id[];
/**
 * CurrentLedEffect
 * Save the ledEffect index (in ledEffectRecord) and the effect
 * Get data from LedEffectRecord and LedMap
 * recordIndex indicates the place in LedEffectRecord
 * effectIndex indicates the place in the effect
 */
export type CurrentLEDStatus = Record<DancerName, LEDPartStatus>;

export type LEDPartStatus = Record<PartName, LEDPartData>;

export type LEDPartData = {
  recordIndex: number;
  effectIndex: number;
  alpha: number;
  effect: LEDBulbData[]; // this is to handle faded effect, so we will clone the effect from ledMap
};

export type LEDBulbData = {
  colorCode: ColorCode;
  alpha: number;
};

export type EffectListType = Array<{
  start: number;
  end: number;
  description: string;
  id: number;
  controlFrames: Array<{
    id: number;
    fade: boolean;
    start: number;
  }>;
  positionFrames: Array<{
    id: number;
    start: number;
  }>;
}>;
/**
 * group errors
 */
export type AddNewGroupError = "EMPTY" | "EXISTED" | "INVALID" | "TYPE";

export type DeleteGroupError = "DNE";

export type EditGroupError = "DNE";

// conversion helpers
export type DancersArray = Array<{
  name: DancerName;
  parts: Array<{
    name: PartName;
    type: PartType;
  }>;
}>;

export type DancerPartIndexMap = Record<
  DancerName,
  {
    index: number;
    parts: Record<PartName, number>;
  }
>;

/**
 * Mutable State
 */
export interface State {
  isLoggedIn: boolean;
  token: string;

  isPlaying: boolean; // isPlaying

  controlMap: ControlMap;
  posMap: PosMap;

  ledMap: LEDMap; // stores led effects for each part

  currentTime: number; // current time
  currentControlIndex: number; // current index in controlRecord
  currentPosIndex: number; // current index in posRecord
  posStack: PosMapStatus[]; // current pos Frame
  posStackIndex: number; // current index in posStack

  currentFade: boolean; // current control Frame will fade to next
  currentStatus: ControlMapStatus; // current dancers' status
  currentPos: PosMapStatus; // current dancers' position
  statusStack: ControlMapStatus[]; // current control Frame
  statusStackIndex: number; // current index in statusStack

  ledEffectRecord: LEDEffectRecord;
  currentLEDStatus: CurrentLEDStatus;

  editMode: EditMode;
  editor: Editor;
  selectionMode: SelectionMode;
  editingData: EditingData; // store the editingData's start time id and index

  selected: Selected; // array of selected dancer's name
  selectedLEDs: number[]; // array of selected LED bulb's index

  currentLEDPartName: LEDPartName | ""; // the LED part whose effect is being edited
  currentLEDEffectName: LEDEffectName; // the LED effect name being edited
  currentLEDEffectStart: number; // the start time on the timeline where currentLEDEffect is displayed during editing
  currentLEDEffect: LEDEffect | null; // the LED effect being edited

  dancers: Dancers;
  dancerNames: DancerName[];
  partTypeMap: PartTypeMap;
  colorMap: ColorMap;
  effectList: EffectListType;

  // for converting
  dancersArray: DancersArray;
  dancerPartIndexMap: DancerPartIndexMap;
}

export type StateKey = keyof State;

export type ReactiveState = {
  [key in StateKey]: ReactiveVar<State[key]>;
};
