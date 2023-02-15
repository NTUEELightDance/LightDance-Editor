// types
import { State } from "../models";
import { registerActions } from "core/registerActions";

const actions = registerActions({
  /**
   * Set current Fade
   * @param {State} state
   * @param {boolean} payload
   */
  setCurrentFade: (state: State, payload: boolean) => {
    const fade = payload;
    if (typeof fade !== "boolean") {
      throw new Error(
        `[Error] setCurrentFade, invalid parameter(fade), ${fade}`
      );
    }
    state.currentFade = fade;
  },
});

export const { setCurrentFade, saveCurrentFade } = actions;
