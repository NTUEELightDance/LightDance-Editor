import { registerActions } from "../registerActions";
// utils
import { getControl, getPos, fadeStatus, interpolationPos } from "../utils";
// constants
import { IDLE } from "constants";
// types
import { State } from "../models";

const actions = registerActions({
  /**
   * set editor mode, 0: IDLE, 1: EDIT, 2: ADD
   * @param {State} state
   * @param {number} payload - new mode
   */
  setMode: (state: State, payload: number) => {
    state.mode = payload;
  },

  /**
   * toggle editor mode, 0: IDLE, 1: EDIT, 2: ADD
   * @param {State} state
   * @param {number} payload - new mode
   */
  toggleMode: async (state: State, payload: number) => {
    const [controlMap, controlRecord] = await getControl();
    const [posMap, posRecord] = await getPos();
    if (payload === state.mode) {
      state.mode = IDLE;
      // reset currentStatus when switching mode back to IDLE
      const currentControlFrame = state.timeData.controlFrame;
      if (currentControlFrame === controlRecord.length - 1) {
        // Can't fade
        state.currentStatus =
          controlMap[controlRecord[currentControlFrame]].status;
      } else {
        // do fade
        state.currentStatus = fadeStatus(
          state.timeData.time,

          controlMap[controlRecord[currentControlFrame]],
          controlMap[controlRecord[currentControlFrame + 1]]
        );
      }
      // reset currentPosFrame when switching mode back to IDLE
      const currentPosFrame = state.timeData.posFrame;
      if (currentPosFrame === posRecord.length - 1) {
        // can't interpolation
        state.currentPos = posMap[posRecord[currentPosFrame]].pos;
      } else {
        // do interpolation
        state.currentPos = interpolationPos(
          state.timeData.time,
          posMap[posRecord[currentPosFrame]],
          posMap[posRecord[currentPosFrame + 1]]
        );
      }
    } else state.mode = payload;
  },
});

export const { setMode, toggleMode } = actions;
