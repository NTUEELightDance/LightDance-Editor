/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import updateFrameByTime from "./utils";
import control from "../../../data/control.json";
import position from "../../../data/position.json";

export const globalSlice = createSlice({
  name: "global",
  initialState: {
    dancerNum: Object.keys(control).length,
    isPlaying: false,
    selected: [0],
    currentStatus: {},
    currentPos: {},
    posRecord: {},
    timeData: {
      time: 0,
      controlFrame: 0,
      posFrame: 0,
    },
  },
  reducers: {
    playPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    updateTimeData: (state, action) => {
      let {
        time: newTime,
        controlFrame: newControlFrame,
        posFram: newPosFrame,
      } = action.payload;

      if (!newControlFrame || !newPosFrame) {
        const { posFrame, controlFrame } = state.timeData;
        newControlFrame = updateFrameByTime(control, controlFrame, newTime);
        newPosFrame = updateFrameByTime(position, posFrame, newTime);
      }
      state.timeData.controlFrame = newControlFrame;
      state.timeData.posFrame = newPosFrame;
      state.timeData.time = newTime;
    },
    setControlFrame: (state, action) => {
      state.timeData.controlFrame = action.payload;
    },
    setPosFrame: (state, action) => {
      state.timeData.posFrame = action.payload;
    },
    setSeletected: (state, action) => {
      state.selected = action.payload;
    },
    setCurrentStatus: (state, action) => {
      state.currentStatus = action.payload;
    },
    setCurrentPos: (state, action) => {
      const { id, x, y, z } = action.payload;
      state.currentPos[`player${id}`] = { x, y, z };
    },
    setNewPosRecord: (state) => {
      const curTime = state.timeData.time;
      Object.keys(state.currentPos).forEach((curName) => {
        const posData = state.currentPos[curName];
        let { x, y, z } = posData;
        [x, y, z] = [x, y, z].map((ele) => Math.round(ele * 1000) / 1000);
        const newPosFrame = { Start: curTime, x, y, z };
        if (state.posRecord[curName]) {
          state.posRecord[curName].push(newPosFrame);
        } else {
          state.posRecord[curName] = [newPosFrame];
        }
      });
    },
  },
});

export const {
  playPause,
  updateTimeData,
  setControlFrame,
  setPosFrame,
  setSeletected,
  setCurrentStatus,
  setCurrentPos,
  setNewPosRecord,
} = globalSlice.actions;

export const selectGlobal = (state) => state.global;

export default globalSlice.reducer;
