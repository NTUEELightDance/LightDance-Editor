import { makeVar } from "@apollo/client";
import { cloneDeep } from "lodash";
import onChange from "on-change";

// types
import {
  State,
  ReactiveState,
  ControlMapStatus,
  TimeDataType,
  EffectRecordMapType,
  EffectStatusMapType,
  DancerCoordinates,
} from "../models";

/**
 * Mutable State
 */
const _state: State = {
  isPlaying: false,
  selected: [],
  currentStatus: {},
  currentPos: {},
  currentFade: false,
  timeData: {
    from: "",
    time: 0,
    controlFrame: 0,
    posFrame: 0,
  },
  mode: 0,

  effectRecordMap: {}, // map of all effects and corresponding record ID array
  effectStatusMap: {},
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
  selected: makeVar<string[]>([]),
  currentStatus: makeVar<ControlMapStatus>({}),
  currentPos: makeVar<DancerCoordinates>({}),
  currentFade: makeVar<boolean>(false),
  timeData: makeVar<TimeDataType>({
    from: "",
    time: 0,
    controlFrame: 0,
    posFrame: 0,
  }),
  mode: makeVar<number>(0),

  effectRecordMap: makeVar<EffectRecordMapType>({}), // map of all effects and corresponding record ID array
  effectStatusMap: makeVar<EffectStatusMapType>({}),
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
