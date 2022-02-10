import { registerActions } from "../registerActions";
// utils
import { getControl, getPos } from "core/utils";
// types
import { State } from "../models";

const actions = registerActions({
  /**
   * Shift frame time from startFrame to endFrame += shiftTime
   * @param {State} state
   * @param {object} payload
   */
  shiftFrameTime: async (
    state: State,
    payload: {
      type: string;
      startFrame: number;
      endFrame: number;
      shiftTime: number;
    }
  ) => {
    const { type, startFrame, endFrame, shiftTime } = payload;
    // TODO: call mutation api
  },
});

export const { shiftFrameTime } = actions;
