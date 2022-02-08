import { registerActions } from "../registerActions";
// types
import { State } from "../models";

const actions = registerActions({
  /**
   * Set selected array
   * @param {State} state
   * @param {string[]} payload - array of dancer's name
   */
  setSelected: (state: State, payload: string[]) => {
    state.selected = payload;
  },

  /**
   * toggle one in selected array
   * @param {State} state
   * @param {string} payload - one of dancer's name
   */
  toggleSelected: (state: State, payload: string) => {
    const name = payload;
    if (state.selected.includes(name)) {
      // delete the name
      state.selected = state.selected.filter((n) => n !== name);
    } else state.selected.push(name);
  },
});

export const { setSelected, toggleSelected } = actions;
