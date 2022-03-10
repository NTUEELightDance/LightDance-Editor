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
export type index = number;
export type DancerName = string;
export type PartName = string;
export type ColorName = string;
export type ColorCode = string;

/**
 * ControlRecord and ControlMap
 */
export type ControlRecord = id[]; // array of all IDs , each correspondsto diff status

export interface ControlMap {
  [index: id]: ControlMapElement;
}

export interface ControlMapElement {
  start: number; //frame's start time
  status: ControlMapStatus;
  fade: boolean; // if this frame fades to the next
}

export interface ControlMapStatus {
  [key: DancerName]: DancerStatus; //DancerNames :  dancerStatus
}

export interface DancerStatus {
  [key: PartName]: Fiber | El | LED; //PartNames: partStatus
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
export type PosRecord = id[]; // array of all IDs , each correspondsto diff status

export interface PosMap {
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
export type EditMode = IDLE | EDITING | ADDING;
export type Editor = CONTROL_EDITOR | POS_EDITOR;
export interface EditingData {
  start: number;
  frameId: string;
  index: number;
}

/**
 * selected dancer and parts
 */
export type Selected = {
  [index: string]: {
    selected: boolean;
    parts: string[];
  };
};

export type PartPayload = { [index: string]: string[] };

/**
 * selection mode
 */
export type SelectionMode = DANCER | PART | POSITION;

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
export interface PartTypeMap {
  [key: string]: PartType;
}

// PartType
type PartType = "LED" | "FIBER" | "El";

/**
 * DancerType
 */
export interface Dancers {
  [key: DancerName]: PartName[]; // DancerName: PartNames
}

/**
 * ColorMap
 */
export type ColorMap = {
  [key: ColorName]: ColorCode;
};

/**
 * Led Effect Map
 */
export type LedMap = {
  [key: PartName]: {
    [key: LedEffectName]: LedEffect;
  };
};

/**
 * LedEffectRecord
 * Save dancer LED part's appearing record id
 * Generated from controlMap and controlRecord, but stripped out the `no-effect` source
 *
 */
type LedEffectRecord = {
  [key: DancerName]: {
    [key: PartName]: id[];
  };
};

/**
 * CurrentLedEffect
 * Save the ledEffect index and the effect
 * Get data from LedEffectRecord and LedMap
 */
export type CurrentLedEffect = {
  [key: DancerName]: {
    [key: PartName]: {
      index: number;
      effect: {
        colorCode: ColorCode;
        alpha: number;
      }[]; // this is to handle faded effect, so we will clone the effect from ledMap
    };
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
  effect: {
    colorCode: ColorCode;
    alpha: number;
  }[]; // ColorCode array for led strips
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

  ledEffectRecord: LedEffectRecord;
  currentLedEffect: CurrentLedEffect;

  editMode: EditMode; // IDLE | EDITING | ADDING
  editor: Editor; // editor, should be CONTROL_EDITOR or POS_EDITOR
  editingData: EditingData; // store the editingData's start time id and index

  selected: Selected; // array of selected dancer's name

  selectionMode: SelectionMode; // selection mode used by simulator and dancer tree

  dancers: Dancers;
  dancerNames: DancerName[];
  partTypeMap: PartTypeMap;
  colorMap: ColorMap;
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

  ledEffectRecord: ReactiveVar<LedEffectRecord>;
  currentLedEffect: ReactiveVar<CurrentLedEffect>;

  editMode: ReactiveVar<EditMode>;
  editor: ReactiveVar<Editor>;
  editingData: ReactiveVar<EditingData>;

  selected: ReactiveVar<Selected>; // array of selected dancer's name

  selectionMode: ReactiveVar<SelectionMode>; // selection mode used by simulator and dancer tree

  dancers: ReactiveVar<Dancers>;
  dancerNames: ReactiveVar<DancerName[]>;
  partTypeMap: ReactiveVar<PartTypeMap>;
  colorMap: ReactiveVar<ColorMap>;
}
