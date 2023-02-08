import { cloneDeep, isEqual } from "lodash";
import { registerActions } from "../registerActions";
// utils
import { getControl, setItem } from "../utils";
// types
import {
  State,
  ControlMapStatus,
  LEDData,
  FiberData,
  ELData,
  CurrentStatusDelta,
} from "../models";

import { Color } from "three";

import { log } from "core/utils";

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
   * Edit current Status
   * @param {State} state
   * @param {{ dancerName, partName, value }} payload - set EL part
   */
  editCurrentStatus: (
    state: State,
    payload: {
      dancerName: string;
      partName: string;
      value: ELData;
    }
  ) => {
    const { dancerName, partName, value } = payload;

    state.currentStatus = cloneDeep(state.currentStatus); // make a new clone since the data may be readOnly (calculate from cache)
    state.currentStatus[dancerName][partName] = value;
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

  /**
   * This is for saving controlRecord and controlMap to localStorage.
   * @param state
   */
  saveToLocal: async () => {
    const [controlRecord, controlMap] = await getControl();
    setItem("controlRecord", JSON.stringify(controlRecord));
    setItem("controlMap", JSON.stringify(controlMap));
    log("Control Saved to Local Storage...");
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
});

export const {
  setCurrentStatus,
  editCurrentStatus,
  editCurrentStatusFiber,
  editCurrentStatusLED,
  editCurrentStatusDelta,
  saveToLocal,
} = actions;
