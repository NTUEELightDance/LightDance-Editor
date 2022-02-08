import { registerActions } from "../registerActions";
// types
import { State, LightPresetsType, PosPresetsType } from "../models";
// utils
import { setItem } from "core/utils";

const actions = registerActions({
  /**
   * set lightPresets
   * @param {State} state
   * @param {LightPresetsType} payload
   */
  setLightPresets: (state: State, payload: LightPresetsType) => {
    state.lightPresets = payload;
    setItem("lightPresets", JSON.stringify(state.lightPresets));
  },

  /**
   * edit a lightPreset's name
   * @param {State} state
   * @param {object} action.payload - index and newName
   */
  editLightPresetsName: (state, payload: { name: string; idx: number }) => {
    const { name, idx } = payload;
    state.lightPresets[idx].name = name;
    setItem("lightPresets", JSON.stringify(state.lightPresets));
  },

  /**
   * add lightPresets
   * @param {State} state
   * @param {string} payload
   */
  addLightPresets: (state, payload: string) => {
    const name = payload;
    state.lightPresets.push({ name, status: state.currentStatus });
    setItem("lightPresets", JSON.stringify(state.lightPresets));
  },

  /**
   * delete a lightPreset (by index)
   * @param {State} state
   * @param {number} payload
   */
  deleteLightPresets: (state, payload: number) => {
    const idx = payload;
    state.lightPresets.splice(idx, 1);
    setItem("lightPresets", JSON.stringify(state.lightPresets));
  },

  /**
   * set lightPresets
   * @param {State} state
   * @param {PosPresetsType} action
   */
  setPosPresets: (state, payload: PosPresetsType) => {
    state.posPresets = payload;
    setItem("posPresets", JSON.stringify(state.posPresets));
  },

  /**
   * edit a lightPreset's name
   * @param {State} state
   * @param {object} action.payload - index and newName
   */
  editPosPresetsName: (
    state,
    payload: {
      name: string;
      idx: number;
    }
  ) => {
    const { name, idx } = payload;
    state.posPresets[idx].name = name;
    setItem("posPresets", JSON.stringify(state.posPresets));
  },

  /**
   * add lightPresets
   * @param {State} state
   * @param {string} action.payload
   */
  addPosPresets: (state, payload: string) => {
    const name = payload;
    state.posPresets.push({ name, pos: state.currentPos });
    setItem("posPresets", JSON.stringify(state.posPresets));
  },

  /**
   * delete a lightPreset (by index)
   * @param {State} state
   * @param {number} action
   */
  deletePosPresets: (state, payload: number) => {
    const idx = payload;
    state.posPresets.splice(idx, 1);
    setItem("posPresets", JSON.stringify(state.posPresets));
  },
});

export const {
  setLightPresets,
  editLightPresetsName,
  addLightPresets,
  deleteLightPresets,

  setPosPresets,
  editPosPresetsName,
  addPosPresets,
  deletePosPresets,
} = actions;
