import { ReactiveVar } from "@apollo/client";
import {
  CONTROL_EDITOR,
  POS_EDITOR,
  IDLE,
  EDITING,
  ADDING,
  DANCER,
  PART,
  POSITION,
} from "constants";
import { number, string } from "prop-types";

export type id = string;
export type DancerName = string;
export type PartName = string;
export type ColorName = string;
export type ColorCode = string;

/**
 * ControlRecord and ControlMap
 */
export type ControlRecordType = id[]; // array of all IDs , each correspondsto diff status

export interface ControlMapType {
  [index: id]: ControlMapElement;
}

export interface ControlMapElement {
  start: number; //frame's start time
  status: ControlMapStatus;
  fade: boolean; // if this frame fades to the next
}

export interface ControlMapStatus {
  [index: DancerName]: DancerStatus; //DancerNames :  dancerStatus
}

interface DancerStatus {
  [index: PartName]: Fiber | El | LED; //PartNames: partStatus
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

export type CurrentStatusDelta = {
  // dancer name
  [key: DancerName]: {
    // part name
    [key: PartName]: El | LED | Fiber;
  };
};

/**
 * PosRecord and PosMap
 */
export type PosRecordType = id[]; // array of all IDs , each correspondsto diff status

export interface PosMapType {
  //IDs: {start, pos}
  [index: id]: PosMapElement;
}

export interface PosMapElement {
  start: number;
  pos: DancerCoordinates;
}

export interface DancerCoordinates {
  // dancer: coordinates
  [index: DancerName]: Coordinates;
}

export interface Coordinates {
  x: number;
  y: number;
  z: number;
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
 * selected dancer and parts
 */
export type SelectedType = {
  [index: string]: {
    selected: boolean;
    parts: string[];
  };
};

export type PartPayloadType = { [index: string]: string[] };

/**
 * selection mode
 */
export type SelectionModeType = DANCER | PART | POSITION;

/**
 * Dancer name with its parts
 */
interface DancerParts {
  name: DancerName;
  parts: Part[];
}

/**
 * Part, includes its name and type
 */
interface Part {
  name: PartName;
  type: PartType;
}

/**
 * PartTypeMap
 */
export interface PartTypeMapType {
  [key: string]: PartType;
}

// PartType
type PartType = "LED" | "FIBER" | "El";

/**
 * DancerType
 */
export interface DancersType {
  [key: DancerName]: PartName[]; // DancerName: PartNames
}

/**
 * ColorMap
 */
export type ColorMapType = {
  [key: ColorName]: ColorCode;
};

/**
 * CurrentLedEffect
 * Save the ledEffect index and the effect
 */
export type CurrentLedEffect = {
  [key: DancerName]: {
    [key: PartName]: {
      index: number;
      effect: ColorCode[]; // this is to handle faded effect, so we will clone the effect from ledMap
    };
  };
};

/**
 * Led Effect Map
 */
export type LedMap = {
  [key: PartName]: {
    [key: LedEffectName]: LedEffect;
  };
};

type LedEffectName = string;

type LedEffect = {
  repeat: number; // 0 for continously repeat // THIS WON'T BE FUNCIONAL IN THIS VERSION
  effects: LedEffectFrame[];
};
export type LedEffectFrame = {
  start: number;
  fade: boolean;
  effect: ColorCode[]; // ColorCode array for led strips
};

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
  isPlaying: boolean; // isPlaying

  currentTime: number; // current time
  currentControlIndex: number; // current index in controlRecord
  currentPosIndex: number; // current index in posRecord

  currentFade: boolean; // current control Frame will fade to next
  currentStatus: ControlMapStatus; // current dancers' status
  currentPos: DancerCoordinates; // current dancers' position
  currentLedEffect: CurrentLedEffect;

  editMode: EditModeType; // IDLE | EDITING | ADDING
  editor: EditorType; // editor, should be CONTROL_EDITOR or POS_EDITOR
  editingData: EditingDataType; // store the editingData's start time id and index

  selected: SelectedType; // array of selected dancer's name

  selectionMode: SelectionModeType; // selection mode used by simulator and dancer tree

  dancers: DancersType;
  dancerNames: DancerName[];
  partTypeMap: PartTypeMapType;
  colorMap: ColorMapType;
}

/**
 * Reactive State, can trigger react component
 */
export interface ReactiveState {
  isPlaying: ReactiveVar<boolean>; // isPlaying

  currentTime: ReactiveVar<number>; // current time
  currentControlIndex: ReactiveVar<number>; // current index in controlRecord
  currentPosIndex: ReactiveVar<number>; // current index in posRecord

  currentFade: ReactiveVar<boolean>; // current control Frame will fade to next
  currentStatus: ReactiveVar<ControlMapStatus>; // current dancers' status
  currentPos: ReactiveVar<DancerCoordinates>; // current dancers' position
  currentLedEffect: ReactiveVar<CurrentLedEffect>;

  editMode: ReactiveVar<EditModeType>;
  editor: ReactiveVar<EditorType>;
  editingData: ReactiveVar<EditingDataType>;

  selected: ReactiveVar<SelectedType>; // array of selected dancer's name

  selectionMode: ReactiveVar<SelectionModeType>; // selection mode used by simulator and dancer tree

  dancers: ReactiveVar<DancersType>;
  dancerNames: ReactiveVar<DancerName[]>;
  partTypeMap: ReactiveVar<PartTypeMapType>;
  colorMap: ReactiveVar<ColorMapType>;
}
