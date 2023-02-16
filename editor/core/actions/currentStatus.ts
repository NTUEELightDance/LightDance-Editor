import { cloneDeep, isEqual } from "lodash";
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

import { Color } from "three";
import { syncCurrentLEDStatus } from "./led";
import { log } from "core/utils";

const actions = registerActions({
  /**
   * Set currentStatus
   * @param {State} state
   * @param {ControlMapStatus} payload - status
   */
  setCurrentStatus: (state: State, payload: ControlMapStatus) => {
    log(payload);
    state.currentStatus = payload;
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
      value: { color, alpha },
    } = payload;

    state.currentStatus = cloneDeep(state.currentStatus); // make a new clone since the data may be readOnly (calculate from cache)
    if (color && color !== "") {
      (state.currentStatus[dancerName][partName] as FiberData).color = color;
      (state.currentStatus[dancerName][partName] as FiberData).colorCode =
        new Color(state.colorMap[color]);
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

    syncCurrentLEDStatus();
  },

  editCurrentStatusDelta: (state: State, payload: CurrentStatusDelta) => {
    // make a new clone since the data may be readOnly (calculate from cache)
    const newCurrentStatus = cloneDeep(state.currentStatus);
    const partTypeMap = state.partTypeMap;
    let hasChange = false;
    let hasLEDChange = false;

    // only update if there really is a difference
    Object.entries(payload).forEach(([dancerName, parts]) => {
      Object.entries(parts).forEach(([partName, newValue]) => {
        const oldValue = newCurrentStatus[dancerName][partName];
        if (!isEqual(oldValue, newValue)) {
          hasChange = true;
          if (partTypeMap[partName] === "LED") {
            hasLEDChange = true;
          }
          newCurrentStatus[dancerName][partName] = newValue;
        }
      });
    });

    if (hasChange) {
      state.currentStatus = newCurrentStatus;
      setStatusStack();
    }

    if (hasLEDChange) {
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

  setStatusStack: (state: State) => {
    state.statusStack.push(cloneDeep(state.currentStatus));
    log("statusStack: ", state.statusStack);
  },
});

export const {
  setCurrentStatus,
  editCurrentStatusFiber,
  editCurrentStatusLED,
  editCurrentStatusDelta,
  syncCurrentStatusWithControlMap,
  setStatusStack,
} = actions;
