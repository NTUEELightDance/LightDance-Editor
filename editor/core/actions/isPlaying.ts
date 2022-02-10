import { registerActions } from "../registerActions";
// types
import { State } from "../models";

const actions = registerActions({
  /**
   * Play or Pause
   * @param {State} state
   * @param {boolean} payload
   */
  setIsPlaying: (state: State, payload: boolean) => {
    state.isPlaying = payload;
  },
});

export const { setIsPlaying } = actions;
