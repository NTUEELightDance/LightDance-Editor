import { cloneDeep } from "lodash";
import { registerActions } from "../registerActions";
// utils
import { getControl, setItem } from "../utils";
// types
import { State, ControlMapStatus, LED } from "../models";

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
      value: number;
    }
  ) => {
    const { dancerName, partName, value } = payload;
    try {
      state.currentStatus[dancerName][partName] = value;
    } catch (err) {
      state.currentStatus = cloneDeep(state.currentStatus); // make a new clone since the data may be readOnly (calculate from cache)
      state.currentStatus[dancerName][partName] = value;
    }
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
      value: { src: string; alpha: number };
    }
  ) => {
    const {
      dancerName,
      partName,
      value: { src, alpha },
    } = payload;
    try {
      if (src && src !== "")
        (state.currentStatus[dancerName][partName] as LED).src = src;
      if (typeof alpha === "number")
        (state.currentStatus[dancerName][partName] as LED).alpha = alpha;
    } catch (err) {
      state.currentStatus = cloneDeep(state.currentStatus); // make a new clone since the data may be readOnly (calculate from cache)
      if (src && src !== "")
        (state.currentStatus[dancerName][partName] as LED).src = src;
      if (typeof alpha === "number")
        (state.currentStatus[dancerName][partName] as LED).alpha = alpha;
    }
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

  /**
   * Save currentStatus, according to controlFrame and mode
   * @param {State} state
   */
  saveCurrentStatus: (state: State) => {
    // TODO: call mutation
  },

  /**
   * Delete currentStatus, according to controlFrame
   * @param {State} state
   */
  deleteCurrentStatus: (state: State) => {
    // TODO: call mutation
  },
});

export const {
  setCurrentStatus,
  editCurrentStatus,
  editCurrentStatusLED,
  saveCurrentStatus,
  deleteCurrentStatus,
  saveToLocal,
} = actions;
