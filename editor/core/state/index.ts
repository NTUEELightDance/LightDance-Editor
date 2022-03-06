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
  EditingDataType,
  EditModeType,
  EditorType,
  SelectionModeType,
  SelectedType,
  DancersType,
  PartTypeMapType,
  ColorMapType,
  DancerName,
  CurrentLedEffect,
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
  selected: makeVar<SelectedType>({}),
  currentTime: makeVar<number>(0),
  currentControlIndex: makeVar<number>(0),
  currentPosIndex: makeVar<number>(0),

  currentStatus: makeVar<ControlMapStatus>({}),
  currentPos: makeVar<DancerCoordinates>({}),
  currentFade: makeVar<boolean>(false),
  currentLedEffect: makeVar<CurrentLedEffect>({}),

  editMode: makeVar<EditModeType>(IDLE),
  editor: makeVar<EditorType>(CONTROL_EDITOR),
  editingData: makeVar<EditingDataType>({
    frameId: "",
    start: 0,
    index: 0,
  }),
  selectionMode: makeVar<SelectionModeType>(DANCER),

  dancers: makeVar<DancersType>({}),
  dancerNames: makeVar<DancerName[]>([]),
  partTypeMap: makeVar<PartTypeMapType>({}),
  colorMap: makeVar<ColorMapType>({}),
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
