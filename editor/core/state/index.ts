import { makeVar } from "@apollo/client";
import onChange from "on-change";

import { debug } from "@/core/utils";

// types
import type { State, ReactiveState, StateKey } from "../models";

/**
 * Mutable State
 * DO NOT mutate the state directly.
 */
export const _state: State = {
  isLoggedIn: false,
  token: "",

  isPlaying: false,

  controlMap: {},
  posMap: {},

  ledMap: {},
  LEDEffectIDtable: {},

  currentTime: 0,
  currentControlIndex: 0,
  currentPosIndex: 0,
  currentLEDIndex: 0,
  posStack: [],
  posStackIndex: 0,

  currentStatus: {},
  currentFade: false,
  currentPos: {},
  statusStack: [],
  statusStackIndex: 0,

  ledEffectRecord: {},
  currentLEDStatus: {},

  editorState: "IDLE",
  editor: "CONTROL_EDITOR",
  selectionMode: "DANCER_MODE",
  editingData: {
    frameId: -1,
    start: 0,
    index: 0,
  },

  selected: {},
  selectedLEDs: [],

  currentLEDPartName: null,
  currentLEDEffectReferenceDancer: null,
  currentLEDEffectName: null,
  currentLEDEffect: null,
  currentLEDEffectStart: 0,

  dancers: {},
  dancerNames: [],
  partTypeMap: {},
  LEDPartLengthMap: {},
  colorMap: {},
  effectList: [],

  dancersArray: [],
  dancerPartIndexMap: {},

  RPiStatus: {},
  shellHistory: {},
};

// The diffSet will save changed attributes in state
const diffSet = new Set<string>();
export const state = onChange(_state, (path: string) => {
  diffSet.add(path.split(".")[0]);
});

/**
 * Reactive State, can trigger react component rerender
 */
export const reactiveState: ReactiveState = Object.entries(state).reduce(
  (acc, [key, value]) => {
    acc[key as StateKey] = makeVar(value);
    return acc;
  },
  {} as ReactiveState
);

/**
 * copy state to reactiveState, which will trigger rerender in react components.
 * If states array is empty, we will automatically replace the changed states.
 */
export function syncReactiveState(states: string[]) {
  if (states.length === 0) {
    // only update states in diffSet
    diffSet.forEach((key) => {
      if (key in state && key in reactiveState) {
        debug("update reactiveState", key);
        const newValue: State[StateKey] = Array.isArray(_state[key as StateKey])
          ? // @ts-expect-error only shallow copy for object types to speed up
            [..._state[key as StateKey]]
          : typeof _state[key as StateKey] === "object"
          ? // @ts-expect-error only shallow copy for object types to speed up
            { ..._state[key as StateKey] }
          : _state[key as StateKey];

        // @ts-expect-error newValue's type is guaranteed to be the same as state[key]
        reactiveState[key as StateKey](newValue);
      } else {
        console.error(`[syncReactiveState] Cannot find the key ${key}`);
      }
    });
    diffSet.clear();
  } else {
    states.forEach((key) => {
      if (key in reactiveState && key in state) {
        debug("update reactiveState", key);
        const newValue: State[StateKey] = Array.isArray(_state[key as StateKey])
          ? [..._state[key as StateKey]]
          : typeof _state[key as StateKey] === "object"
          ? // @ts-expect-error only shallow copy for object types to speed up
            { ..._state[key as StateKey] }
          : _state[key as StateKey];

        // @ts-expect-error newValue's type is guaranteed to be the same as state[key]
        reactiveState[key as StateKey](newValue);
      } else {
        console.error(
          `[syncReactiveState] Cannot find the key ${key} in state.`
        );
      }
    });
  }
}
