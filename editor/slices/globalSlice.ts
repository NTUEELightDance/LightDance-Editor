/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { setItem } from "../core/utils/localStorage";
import { nanoid } from "nanoid";
import {
  GlobalState,
  LightPresetsType,
  PosPresetsType,
  EffectRecordMapType,
  EffectStatusMapType,
  EffectRecordType,
} from "../types/globalSlice";
import { RootState } from "../store/index";
const initialState: GlobalState = {
  currentStatus: {}, // current dancers' status
  currentPos: {}, // currnet dancers' position

  controlRecord: [], // array of all dancer's status
  controlMap: {},
  posRecord: [], // array of all dancer's pos
  posMap: {}, //
  timeData: {
    from: "", // update from what component
    time: 0, // time
    controlFrame: 0, // control frame's index
    posFrame: 0, // positions' index
  },

  effectRecordMap: {}, // map of all effects and corresponding record ID array
  effectStatusMap: {},
  lightPresets: [], // lightPresets, presets for light
  posPresets: [], // posPresets, presets for pos
};
export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    /**
     * set lightPresets
     * @param {*} state
     * @param {*} action
     */
    setLightPresets: (state, action: PayloadAction<LightPresetsType>) => {
      state.lightPresets = action.payload;
      setItem("lightPresets", JSON.stringify(state.lightPresets));
    },

    /**
     * edit a lightPreset's name
     * @param {*} state
     * @param {*} action.payload - index and newName
     */
    editLightPresetsName: (
      state,
      action: PayloadAction<{ name: string; idx: number }>
    ) => {
      const { name, idx } = action.payload;
      state.lightPresets[idx].name = name;
      setItem("lightPresets", JSON.stringify(state.lightPresets));
    },

    /**
     * add lightPresets
     * @param {*} state
     * @param {*} action.payload
     */
    addLightPresets: (state, action: PayloadAction<string>) => {
      const name = action.payload;
      state.lightPresets.push({ name, status: state.currentStatus });
      setItem("lightPresets", JSON.stringify(state.lightPresets));
    },

    /**
     * delete a lightPreset (by index)
     * @param {*} state
     * @param {*} action
     */
    deleteLightPresets: (state, action: PayloadAction<number>) => {
      const idx = action.payload;
      state.lightPresets.splice(idx, 1);
      setItem("lightPresets", JSON.stringify(state.lightPresets));
    },

    /**
     * set lightPresets
     * @param {*} state
     * @param {*} action
     */
    setPosPresets: (state, action: PayloadAction<PosPresetsType>) => {
      state.posPresets = action.payload;
      setItem("posPresets", JSON.stringify(state.posPresets));
    },

    /**
     * set effectRecordMap
     * @param {*} state
     * @param {*} action
     */
    setEffectRecordMap: (state, action: PayloadAction<EffectRecordMapType>) => {
      state.effectRecordMap = action.payload;
      setItem("effectRecordMap", JSON.stringify(state.effectRecordMap));
    },

    /**
     * set effectStatusMap
     * @param {*} state
     * @param {*} action
     */
    setEffectStatusMap: (state, action: PayloadAction<EffectStatusMapType>) => {
      state.effectStatusMap = action.payload;
      setItem("effectStatusMap", JSON.stringify(state.effectStatusMap));
    },

    /**
     * add effect to record map and status map, the effect doesn't contain frame of endIndex
     * @param {*} state
     * @param {*} action
     */
    addEffect: (
      state,
      action: PayloadAction<{
        effectName: string;
        startIndex: number;
        endIndex: number;
      }>
    ) => {
      const { effectName, startIndex, endIndex } = action.payload;
      state.effectRecordMap[effectName] = state.controlRecord.slice(
        startIndex,
        endIndex
      );
      state.effectRecordMap[effectName].map((id) => {
        state.effectStatusMap[id] = state.controlMap[id];
      });
      setItem("effectRecordMap", JSON.stringify(state.effectRecordMap));
      setItem("effectStatusMap", JSON.stringify(state.effectStatusMap));
    },

    /**
     * delete chosen effect from EffectRecodeMap and EffectStatusMap
     * @param {*} state
     * @param {*} action
     */
    deleteEffect: (state, action: PayloadAction<string>) => {
      const effectName: string = action.payload;
      const effectFrameId: EffectRecordType = state.effectRecordMap[effectName];
      effectFrameId.map((id) => {
        delete state.effectStatusMap[id];
      });
      delete state.effectRecordMap[effectName];
      setItem("effectStatusMap", JSON.stringify(state.effectStatusMap));
      setItem("effectRecodeMap", JSON.stringify(state.effectRecordMap));
    },

    /**
     * apply effect to current frame
     * @param {*} state
     * @param {*} action
     */
    applyEffect: (state, action: PayloadAction<string>) => {
      const effectName: string = action.payload;
      const shiftTime: number =
        state.timeData.time -
        state.effectStatusMap[state.effectRecordMap[effectName][0]].start;
      const controlRecordCopy = [...state.controlRecord];
      const controlMapCopy = { ...state.controlMap };
      state.effectRecordMap[effectName].map((id) => {
        const newId: string = nanoid(6);
        controlRecordCopy.push(newId);
        controlMapCopy[newId] = { ...state.effectStatusMap[id] };
        controlMapCopy[newId].start += shiftTime;
      });
      state.controlRecord = controlRecordCopy.sort(
        (a, b) => controlMapCopy[a].start - controlMapCopy[b].start
      );
      state.controlMap = controlMapCopy;
    },

    /**
     * edit a lightPreset's name
     * @param {*} state
     * @param {*} action.payload - index and newName
     */
    editPosPresetsName: (
      state,
      action: PayloadAction<{
        name: string;
        idx: number;
      }>
    ) => {
      const { name, idx } = action.payload;
      state.posPresets[idx].name = name;
      setItem("posPresets", JSON.stringify(state.posPresets));
    },

    /**
     * add lightPresets
     * @param {*} state
     * @param {*} action.payload
     */
    addPosPresets: (state, action: PayloadAction<string>) => {
      const name = action.payload;
      state.posPresets.push({ name, pos: state.currentPos });
      setItem("posPresets", JSON.stringify(state.posPresets));
    },

    /**
     * delete a lightPreset (by index)
     * @param {*} state
     * @param {*} action
     */
    deletePosPresets: (state, action: PayloadAction<number>) => {
      const idx = action.payload;
      state.posPresets.splice(idx, 1);
      setItem("posPresets", JSON.stringify(state.posPresets));
    },

    /**
     * Shift frame time from startFrame to endFrame += shiftTime
     */
    shiftFrameTime: (
      state,
      action: PayloadAction<{
        type: string;
        startFrame: number;
        endFrame: number;
        shiftTime: number;
      }>
    ) => {
      const { type, startFrame, endFrame, shiftTime } = action.payload;
      console.log(type, startFrame, endFrame, shiftTime);

      if (type === "control") {
        const controlMapCopy = { ...state.controlMap };
        for (let i = Number(startFrame); i <= Number(endFrame); i += 1) {
          controlMapCopy[state.controlRecord[i]].start += shiftTime;
        }
        const controlRecordCopy = [...state.controlRecord];
        state.controlRecord = controlRecordCopy.sort(
          (a, b) => controlMapCopy[a].start - controlMapCopy[b].start
        );
        state.controlMap = controlMapCopy;
      } else {
        const posMapCopy = { ...state.posMap };
        for (let i = Number(startFrame); i <= Number(endFrame); i += 1) {
          posMapCopy[state.posRecord[i]].start += shiftTime;
        }
        const posRecordCopy = [...state.posRecord];
        state.posRecord = posRecordCopy.sort(
          (a, b) => posMapCopy[a].start - posMapCopy[b].start
        );
        state.posMap = posMapCopy;
      }
    },
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
  setEffectRecordMap,
  setEffectStatusMap,

  shiftFrameTime,
} = globalSlice.actions;

export const selectGlobal = (state: RootState) => state.global;

export default globalSlice.reducer;
