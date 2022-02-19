import { registerActions } from "../registerActions";
// types
import { State, ColorMapType } from "../models";

const actions = registerActions({
  /**
   * ColorMap
   * @param {State} state
   * @param {ColorMapType} payload
   */
  setColorMap: (state: State, payload: ColorMapType) => {
    state.colorMap = payload;
  },
});

export const { setColorMap } = actions;
