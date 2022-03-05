import { cloneDeep } from "lodash";
import { registerActions } from "../registerActions";
// utils
import { getControl, setItem } from "../utils";
// types
import {
  State,
  ControlMapStatus,
  LED,
  Fiber,
  El,
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
   * Edit current Status
   * @param {State} state
   * @param {{ dancerName, partName, value }} payload - set EL part
   */
  editCurrentStatus: (
    state: State,
    payload: {
      dancerName: string;
      partName: string;
      value: El;
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
      value: Fiber;
    }
  ) => {
    const {
      dancerName,
      partName,
      value: { color, alpha },
    } = payload;

    state.currentStatus = cloneDeep(state.currentStatus); // make a new clone since the data may be readOnly (calculate from cache)
    if (color && color !== "") {
      (state.currentStatus[dancerName][partName] as Fiber).color = color;
      (state.currentStatus[dancerName][partName] as Fiber).colorCode =
        new Color(state.colorMap[color]);
    }
    if (typeof alpha === "number")
      (state.currentStatus[dancerName][partName] as Fiber).alpha = alpha;
  },

  /**
   * Edit current Status (LED)
   * @param {State} state
   * @param {object} payload
   */

  editCurrentStatusLED: (
    state: State,
    payload: {
      dancerName: string;
      partName: string;
      value: LED;
    }
  ) => {
    const {
      dancerName,
      partName,
      value: { src, alpha },
    } = payload;

    state.currentStatus = cloneDeep(state.currentStatus); // make a new clone since the data may be readOnly (calculate from cache)
    if (src && src !== "")
      (state.currentStatus[dancerName][partName] as LED).src = src;
    if (typeof alpha === "number")
      (state.currentStatus[dancerName][partName] as LED).alpha = alpha;
  },

  /**
   * This is for saving controlRecord and controlMap to localStorage.
   * @param state
   */
  saveToLocal: async (state: State) => {
    const [controlRecord, controlMap] = await getControl();
    setItem("controlRecord", JSON.stringify(controlRecord));
    setItem("controlMap", JSON.stringify(controlMap));
    console.log("Control Saved to Local Storage...");
  },

  editCurrentStatusDelta: (state: State, payload: CurrentStatusDelta) => {
    // make a new clone since the data may be readOnly (calculate from cache)
    state.currentStatus = cloneDeep(state.currentStatus);

    Object.entries(payload).forEach(([dancerName, parts]) => {
      Object.entries(parts).forEach(([partName, value]) => {
        state.currentStatus[dancerName][partName] = value;
      });
    });
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
