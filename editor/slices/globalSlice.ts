/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { setItem } from "../core/utils/localStorage";
import { nanoid } from "nanoid";
import {
  GlobalState,
  EffectRecordMapType,
  EffectStatusMapType,
  EffectRecordType,
} from "../types/globalSlice";
import { RootState } from "../store/index";

const initialState: GlobalState = {
  controlRecord: [], // array of all dancer's status
  controlMap: {},
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
  },
});

export const { setEffectRecordMap, setEffectStatusMap } = globalSlice.actions;

export const selectGlobal = (state: RootState) => state.global;

export default globalSlice.reducer;
