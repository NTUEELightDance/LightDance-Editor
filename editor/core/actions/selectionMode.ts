import { registerActions } from "../registerActions";

import { State, SelectionModeType } from "../models";

const actions = registerActions({
  /**
   * @param {State} state
   * @param {SelectionModeType} payload
   */
  setSelectionMode: (state: State, payload: SelectionModeType) => {
    state.selectionMode = payload;
  },
});

export const { setSelectionMode } = actions;
