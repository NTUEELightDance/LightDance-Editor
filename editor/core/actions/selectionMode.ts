import { registerActions } from "../registerActions";

import { State, SelectionModeType, EditorType } from "../models";

import {
  CONTROL_EDITOR,
  POS_EDITOR,
  POSITION,
  DANCER,
  CONTROL_EDITOR,
} from "constants";

const actions = registerActions({
  /**
   * @param {State} state
   * @param {SelectionModeType} payload
   */
  setSelectionMode: (state: State, payload: SelectionModeType) => {
    state.selectionMode = payload;
  },

  /**
   * @param {State} state
   * @param {EditorType} payload
   */
  setSelectionModeByEditor: (state: State, payload: EditorType) => {
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
});

export const { setSelectionMode, setSelectionModeByEditor } = actions;
