import cloneDeep from "lodash/cloneDeep";
import { registerActions } from "../registerActions";
// utils
import { getControl, fadeStatus } from "../utils";
// types
import {
  State,
  ControlMapStatus,
  LEDData,
  FiberData,
  CurrentStatusDelta,
  isLEDData,
} from "../models";

import { syncCurrentLEDStatus } from "./led";

const actions = registerActions({
  /**
   * Set currentStatus
   * @param {State} state
   * @param {ControlMapStatus} payload - status
   */
  setCurrentStatus: (state: State, payload: ControlMapStatus) => {
    state.currentStatus = payload;
    pushStatusStack();
    syncCurrentLEDStatus();
  },

  /**
   * Edit current Status EL
   * @param {State} state
   * @param {{ dancerName, partName, value }} payload - set EL part
   */
  editCurrentStatusFiber: (
    state: State,
    payload: {
      dancerName: string;
      partName: string;
      value: FiberData;
    }
  ) => {
    const {
      dancerName,
      partName,
      value: { colorID, alpha },
    } = payload;

    state.currentStatus = cloneDeep(state.currentStatus); // make a new clone since the data may be readOnly (calculate from cache)
    if (colorID && colorID !== -1) {
      (state.currentStatus[dancerName][partName] as FiberData) = {
        colorID,
        alpha,
        rgb: state.colorMap[colorID].rgb,
      };
    }
    if (typeof alpha === "number") {
      (state.currentStatus[dancerName][partName] as FiberData).alpha = alpha;
    }
  },

  // remember to call syncCurrentLEDStatus after this
  editCurrentStatusLED: async (
    state: State,
    payload: Array<{
      dancerName: string;
      partName: string;
      value: Partial<LEDData>;
    }>
  ) => {
    state.currentStatus = cloneDeep(state.currentStatus); // make a new clone since the data may be readOnly (calculate from cache)
    payload.forEach(({ dancerName, partName, value: { src, alpha } }) => {
      const data = state.currentStatus[dancerName][partName];
      if (isLEDData(data)) {
        if (typeof src === "string") {
          data.src = src;
        }
        if (typeof alpha === "number") {
          data.alpha = alpha;
        }
      }
    });

    pushStatusStack();
    syncCurrentLEDStatus();
  },

  editCurrentStatusDelta: (state: State, payload: CurrentStatusDelta) => {
    // make a new clone since the data may be readOnly (calculate from cache)
    const newCurrentStatus = cloneDeep(state.currentStatus);
    const partTypeMap = state.partTypeMap;
    let hasChanged = false;
    let hasLEDChanged = false;

    // change to for loop for readability
    for (const [dancerName, parts] of Object.entries(payload)) {
      for (const [partName, partData] of Object.entries(parts)) {
        for (const [key, newValue] of Object.entries(partData)) {
          // @ts-expect-error the key is guaranteed to be in the type
          const oldValue = state.currentStatus[dancerName][partName][key];
          if (oldValue === newValue) continue;
          hasChanged = true;
          if (partTypeMap[partName] === "LED") {
            hasLEDChanged = true;
          }
          // @ts-expect-error the key is guaranteed to be in the type
          newCurrentStatus[dancerName][partName][key] = newValue;
        }
      }
    }

    if (hasChanged) {
      state.currentStatus = newCurrentStatus;
      pushStatusStack();
    }

    if (hasLEDChanged) {
      syncCurrentLEDStatus();
    }
  },

  syncCurrentStatusWithControlMap: async (state: State) => {
    const [controlMap, controlRecord] = await getControl();

    const controlIndex = state.currentControlIndex;
    const time = state.currentTime;
    // status fade
    if (controlIndex === controlRecord.length - 1) {
      // Can't fade
      state.currentStatus = controlMap[controlRecord[controlIndex]].status;
    } else {
      // do fade
      state.currentStatus = fadeStatus(
        time,
        controlMap[controlRecord[controlIndex]],
        controlMap[controlRecord[controlIndex + 1]],
        state.colorMap
      );
    }
  },

  pushStatusStack: (state: State) => {
    if (state.statusStack.length - 1 !== state.statusStackIndex) {
      state.statusStack = state.statusStack.slice(
        0,
        state.statusStackIndex + 1
      );
    }
    if (state.statusStack[state.statusStackIndex] === state.currentStatus)
      return;
    state.statusStack.push(cloneDeep(state.currentStatus));
    state.statusStackIndex += 1;
  },

  initStatusStack: (state: State) => {
    state.statusStack = [cloneDeep(state.currentStatus)];
    state.statusStackIndex = 0;
  },

  DecrementStatusStackIndex: (state: State) => {
    state.statusStackIndex -= 1;
    state.currentStatus = state.statusStack[state.statusStackIndex];
  },

  IncrementStatusStackIndex: (state: State) => {
    state.statusStackIndex += 1;
    state.currentStatus = state.statusStack[state.statusStackIndex];
  },
});

export const {
  setCurrentStatus,
  editCurrentStatusFiber,
  editCurrentStatusLED,
  editCurrentStatusDelta,
  syncCurrentStatusWithControlMap,
  pushStatusStack,
  initStatusStack,
  DecrementStatusStackIndex,
  IncrementStatusStackIndex,
} = actions;
