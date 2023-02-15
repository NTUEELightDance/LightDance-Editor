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
} from "../models";

import { Color } from "three";

const actions = registerActions({
  /**
   * Set currentStatus
   * @param {State} state
   * @param {ControlMapStatus} payload - status
   */
  setCurrentStatus: (state: State, payload: ControlMapStatus) => {
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

  /**
   * Edit current Status (LED)
   * @param {State} state
   * @param {object[]} payload
   */

  editCurrentStatusLED: (
    state: State,
    payload: Array<{
      dancerName: string;
      partName: string;
      value: LEDData;
    }>
  ) => {
    state.currentStatus = cloneDeep(state.currentStatus); // make a new clone since the data may be readOnly (calculate from cache)

    payload.forEach(({ dancerName, partName, value: { src, alpha } }) => {
      if (typeof src === "string") {
        (state.currentStatus[dancerName][partName] as LEDData).src = src;
      }
      if (typeof alpha === "number") {
        (state.currentStatus[dancerName][partName] as LEDData).alpha = alpha;
      }
    });
  },

  editCurrentStatusDelta: (state: State, payload: CurrentStatusDelta) => {
    // make a new clone since the data may be readOnly (calculate from cache)
    const newCurrentStatus = cloneDeep(state.currentStatus);
    let hasChange = false;

    // only update if there really is a difference
    Object.entries(payload).forEach(([dancerName, parts]) => {
      Object.entries(parts).forEach(([partName, newValue]) => {
        const oldValue = newCurrentStatus[dancerName][partName];
        if (!isEqual(oldValue, newValue)) {
          hasChange = true;
          newCurrentStatus[dancerName][partName] = newValue;
        }
      });
    });

    if (hasChange) {
      state.currentStatus = newCurrentStatus;
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
});

export const {
  setCurrentStatus,
  editCurrentStatusFiber,
  editCurrentStatusLED,
  editCurrentStatusDelta,
  syncCurrentStatusWithControlMap,
} = actions;
