import { makeVar } from "@apollo/client";
import { cloneDeep, isEqual } from "lodash";
import { DancerCoordinates } from "types/globalSlice";
// types
import {
  State,
  ReactiveState,
  ControlMapStatus,
  TimeDataType,
  EffectRecordMapType,
  EffectStatusMapType,
  LightPresetsType,
  PosPresetsType,
} from "../models";

/**
 * Mutable State
 */
export const state: State = {
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
  lightPresets: [], // lightPresets, presets for light
  posPresets: [], // posPresets, presets for pos
};

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
  lightPresets: makeVar<LightPresetsType>([]), // lightPresets, presets for light
  posPresets: makeVar<PosPresetsType>([]), // posPresets, presets for pos
};

/**
 * copy state to reactiveState, which will trigger rerender in react components.
 * If states array is empty, we will automatically replace the changed states.
 */
export function syncReactiveState(states: string[]) {
  if (states.length === 0) {
    Object.keys(reactiveState).forEach((key) => {
      if (key in state) {
        if (!isEqual(reactiveState[key](), state[key])) {
          console.debug("update reactiveState", key);
          reactiveState[key](cloneDeep(state[key]));
        }
      } else {
        console.error(
          `[syncReactiveState] Cannot find the key ${key} in state.`
        );
      }
    });
  } else {
    states.forEach((key) => {
      console.debug("update reactiveState", key);
      if (key in reactiveState && key in state) {
        reactiveState[key](cloneDeep(state[key]));
      } else {
        console.error(
          `[syncReactiveState] Cannot find the key ${key} in state.`
        );
      }
    });
  }
}
