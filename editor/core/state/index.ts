import { makeVar } from "@apollo/client";
import { cloneDeep } from "lodash";
import onChange from "on-change";
import { IDLE, CONTROL_EDITOR, DANCER } from "constants";

// types
import {
  State,
  ReactiveState,
  ControlMapStatus,
  DancerCoordinates,
  EditingData,
  EditMode,
  Editor,
  SelectionMode,
  Selected,
  Dancers,
  PartTypeMap,
  ColorMap,
  DancerName,
  CurrentLedEffect,
  LedEffectRecord,
} from "../models";

/**
 * Mutable State
 */
const _state: State = {
  isPlaying: false,
  selected: {},

  currentTime: 0,
  currentControlIndex: 0,
  currentPosIndex: 0,

  currentStatus: {},
  currentFade: false,
  currentPos: {},

  ledEffectRecord: {},
  currentLedEffect: {},

  editMode: IDLE,
  editor: CONTROL_EDITOR,
  editingData: {
    frameId: "",
    start: 0,
    index: 0,
  },

  selectionMode: "DANCER",

  dancers: {},
  dancerNames: [],
  partTypeMap: {},
  colorMap: {},
};

// The diffSet will save changed attributes in state
const diffSet = new Set<string>();
export const state = onChange(
  _state,
  (path: string, value, previousValue, applyData) => {
    diffSet.add(path.split(".")[0]);
  }
);

/**
 * Reactive State, can trigger react component rerender
 */
export const reactiveState: ReactiveState = {
  isPlaying: makeVar<boolean>(false),
  selected: makeVar<Selected>({}),
  currentTime: makeVar<number>(0),
  currentControlIndex: makeVar<number>(0),
  currentPosIndex: makeVar<number>(0),

  currentStatus: makeVar<ControlMapStatus>({}),
  currentPos: makeVar<DancerCoordinates>({}),
  currentFade: makeVar<boolean>(false),

  ledEffectRecord: makeVar<LedEffectRecord>({}),
  currentLedEffect: makeVar<CurrentLedEffect>({}),

  editMode: makeVar<EditMode>(IDLE),
  editor: makeVar<Editor>(CONTROL_EDITOR),
  editingData: makeVar<EditingData>({
    frameId: "",
    start: 0,
    index: 0,
  }),
  selectionMode: makeVar<SelectionMode>(DANCER),

  dancers: makeVar<Dancers>({}),
  dancerNames: makeVar<DancerName[]>([]),
  partTypeMap: makeVar<PartTypeMap>({}),
  colorMap: makeVar<ColorMap>({}),
};

/**
 * copy state to reactiveState, which will trigger rerender in react components.
 * If states array is empty, we will automatically replace the changed states.
 */
export function syncReactiveState(states: string[]) {
  if (states.length === 0) {
    // only update states in diffSet
    diffSet.forEach((key) => {
      if (key in state && key in reactiveState) {
        console.debug("update reactiveState", key);
        reactiveState[key](cloneDeep(state[key]));
      } else {
        console.error(`[syncReactiveState] Cannot find the key ${key}`);
      }
    });
    diffSet.clear();
  } else {
    states.forEach((key) => {
      if (key in reactiveState && key in state) {
        console.debug("update reactiveState", key);
        reactiveState[key](cloneDeep(state[key]));
      } else {
        console.error(
          `[syncReactiveState] Cannot find the key ${key} in state.`
        );
      }
    });
  }
}
