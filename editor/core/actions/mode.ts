import { registerActions } from "../registerActions";
// constants
import { IDLE, POS_ADD, POS_EDIT, CONTROL_EDIT, CONTROL_ADD } from "constants";
// types
import { State } from "../models";
// actions
import { setCurrentTime } from "./index";

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
    if (payload === state.mode) {
      state.mode = IDLE;
      // reset currentStatus when switching mode back to IDLE
      setCurrentTime({ payload: state.currentTime });
    } else state.mode = payload;
  },
});

export const { setMode, toggleMode } = actions;
