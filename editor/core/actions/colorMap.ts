import { registerActions } from "../registerActions";
// types
import { State, ColorMap } from "../models";

const actions = registerActions({
  /**
   * ColorMap
   * @param {State} state
   * @param {ColorMap} payload
   */
  setColorMap: (state: State, payload: ColorMap) => {
    state.colorMap = payload;
  },
});

export const { setColorMap } = actions;
