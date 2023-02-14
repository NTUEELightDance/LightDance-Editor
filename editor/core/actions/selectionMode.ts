import { registerActions } from "../registerActions";

import { State, SelectionMode, Editor } from "../models";

import { CONTROL_EDITOR, POS_EDITOR, POSITION, DANCER } from "@/constants";

const actions = registerActions({
  /**
   * @param {State} state
   * @param {Selected} payload
   */
  setSelectionMode: (state: State, payload: SelectionMode) => {
    state.selectionMode = payload;
  },

  /**
   * @param {State} state
   * @param {Editor} payload
   */
  setSelectionModeByEditor: (state: State, payload: Editor) => {
    const editor = payload;
    switch (editor) {
      case CONTROL_EDITOR:
        state.selectionMode = POSITION;
        break;
      case POS_EDITOR:
        state.selectionMode = DANCER;
        break;
      default:
        state.selectionMode = DANCER;
    }
  },

  /**
   * @param {State} state
   */
  setLasso: (state: State) => {
    state.lasso = !state.lasso;
    console.log(state.lasso);
  },
});

export const {
  setSelectionMode,
  setSelectionModeByEditor,
  setLasso,
  getLasso,
} = actions;
