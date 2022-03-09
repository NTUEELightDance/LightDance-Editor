import { registerActions } from "../registerActions";
// types
import { State, Selected, PartPayload } from "../models";
import _ from "lodash";

const actions = registerActions({
  /**
   * Set the 'selected' object
   * @param {State} state
   * @param {Selected} payload - object containing dancer names as keys selected parts as values
   */
  setSelected: (state: State, payload: Selected) => {
    state.selected = payload;
  },

  /**
   * Set selected dancer
   * @param {State} state
   * @param {string[]} payload - array of dancer's name
   */
  setSelectedDancers: (state: State, payload: string[]) => {
    const dancers = payload;
    Object.keys(state.selected).forEach((dancer) => {
      state.selected[dancer].selected = dancers.includes(dancer);
    });
  },

  /**
   * Set selected dancer
   * @param {State} state
   * @param {PartPayload} payload
   */
  setSelectedParts: (state: State, payload: PartPayload) => {
    Object.keys(state.selected).forEach((dancer) => {
      state.selected[dancer].parts = payload.hasOwnProperty(dancer)
        ? payload[dancer]
        : [];
    });
  },

  /**
   * toggle one in selected array
   * @param {State} state
   * @param {string} payload - one of dancer's name
   */
  toggleSelectedDancer: (state: State, payload: string) => {
    const dancer = payload;
    state.selected[dancer].selected = !state.selected[dancer].selected;
  },

  /**
   * toggle one in selected array
   * @param {State} state
   * @param {{ dancer: string; part: string }} payload
   */
  toggleSelectedPart: (
    state: State,
    payload: { dancer: string; part: string }
  ) => {
    const { dancer, part } = payload;
    const index = state.selected[dancer].parts.indexOf(part as string);
    if (index !== -1) {
      state.selected[dancer].parts.splice(index, 1);
    } else {
      state.selected[dancer].parts.push(part as string);
    }
  },

  /**
   * toggle one in selected array
   * @param {State} state
   * @param {null} payload
   */
  clearSelected: (state: State, payload: null) => {
    Object.keys(state.selected).forEach((name) => {
      state.selected[name].selected = false;
      state.selected[name].parts = [];
    });
  },
});

export const {
  setSelected,
  setSelectedDancers,
  setSelectedParts,
  toggleSelectedDancer,
  toggleSelectedPart,
  clearSelected,
} = actions;
