import { ReactiveVar } from "@apollo/client";
import {
  CONTROL_EDITOR,
  POS_EDITOR,
  IDLE,
  EDITING,
  DANCER,
  PART,
  POSITION,
} from "@/constants";
import { Color } from "three";

export type id = string;
export type index = number;
export type DancerName = string;
export type PartName = string;
export type ColorName = string;
export type ColorCode = string;

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

export type CurrentStatusDelta = Record<DancerName, Record<PartName, PartData>>;

export type ControlMapPayload = {
  [frameId: id]: {
    fade: boolean;
    start: number;
    status: Array<DancerStatusPayload>;
  };
};

export type DancerStatusPayload = Array<FiberDataPayload | LEDDataPayload>;

export type FiberDataPayload = [ColorName, number];

export type LEDDataPayload = [string, number];

/**
 * PosRecord and PosMap
 */
export type PosRecord = id[]; // array of all IDs , each correspondsto diff status

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
    pos: Array<CoordinatesPayload>;
  };
};

export type CoordinatesPayload = [number, number, number];

/**
 * Editing
 */
export type EditMode = typeof IDLE | typeof EDITING;
export type Editor = typeof CONTROL_EDITOR | typeof POS_EDITOR;
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

export type PartPayload = Record<string, string[]>;

/**
 * selection mode
 */
export type SelectionMode = typeof DANCER | typeof PART | typeof POSITION;

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

export type DancersArray = Array<{
  name: DancerName;
  parts: Array<{
    name: PartName;
    type: PartType;
  }>;
}>;

/**
 * ColorMap
 */
export type ColorMap = Record<ColorName, ColorCode>;

/**
 * Led Effect Map, get from backend
 */
export type LedMap = Record<PartName, Record<LedEffectName, LedEffect>>;

type LedEffectName = string;

interface LedEffect {
  repeat: number; // repeat counts, 0 for continuously repeat
  effects: LedEffectFrame[];
}

export interface LedEffectFrame {
  start: number;
  fade: boolean;
  effect: Array<{
    colorCode: ColorCode;
    alpha: number;
  }>; // ColorCode array for led strips
}

/**
 * LedEffectRecord
 * Save dancer LED part's appearing record id
 * Generated from controlMap and controlRecord, but stripped out the `no-effect` source
 *
 */
export type LedEffectRecord = Record<DancerName, Record<PartName, LedRecord>>;

export type LedRecord = id[];

/**
 * CurrentLedEffect
 * Save the ledEffect index (in ledEffectRecord) and the effect
 * Get data from LedEffectRecord and LedMap
 * recordIndex indicates the place in LedEffectRecord
 * effectIndex indicates the place in the effect
 */
export type CurrentLedEffect = Record<
  DancerName,
  Record<
    PartName,
    {
      recordIndex: number;
      effectIndex: number;
      effect: Array<{
        colorCode: ColorCode;
        alpha: number;
      }>; // this is to handle faded effect, so we will clone the effect from ledMap
    }
  >
>;

export type EffectListType = Array<{
  start: number;
  end: number;
  description: string;
  data: {
    control: Record<string, ControlMapElement>;
    position: Record<string, PosMapElement>;
  };
}>;
/**
 * group errors
 */
export type AddNewGroupError = "EMPTY" | "EXISTED" | "INVALID" | "TYPE";

export type DeleteGroupError = "DNE";

export type EditGroupError = "DNE";

/**
 * Mutable State
 */
export interface State {
  isLoggedIn: boolean;
  token: string;

  isPlaying: boolean; // isPlaying

  controlMap: ControlMap;
  posMap: PosMap;

  currentTime: number; // current time
  currentControlIndex: number; // current index in controlRecord
  currentPosIndex: number; // current index in posRecord

  currentFade: boolean; // current control Frame will fade to next
  currentStatus: ControlMapStatus; // current dancers' status
  currentPos: PosMapStatus; // current dancers' position

  ledEffectRecord: LedEffectRecord;
  currentLedEffect: CurrentLedEffect;

  editMode: EditMode; // IDLE | EDITING | ADDING
  editor: Editor; // editor, should be CONTROL_EDITOR or POS_EDITOR
  editingData: EditingData; // store the editingData's start time id and index

  selected: Selected; // array of selected dancer's name

  selectionMode: SelectionMode; // selection mode used by simulator and dancer tree

  dancers: Dancers;
  dancersArray: DancersArray;
  dancerNames: DancerName[];
  partTypeMap: PartTypeMap;
  colorMap: ColorMap;

  effectList: EffectListType;
}

export type StateKey = keyof State;

export type ReactiveState = {
  [key in StateKey]: ReactiveVar<State[key]>;
};