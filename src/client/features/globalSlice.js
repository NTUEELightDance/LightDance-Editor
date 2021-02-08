/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import updateFrameByTime from "./utils";
// import control from "../../../data/control.json";
// import position from "../../../data/position.json";

export const globalSlice = createSlice({
  name: "global",
  initialState: {
    dancerNum: 0,
    isPlaying: false,
    selected: [0],
    currentStatus: {},
    currentPos: {},
    controlRecord: {},
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
    controlInit: (state, action) => {
      state.controlRecord = action.payload;
      state.dancerNum = Object.keys(state.controlRecord).length;
    },
    posInit: (state, action) => {
      state.posRecord = action.payload;
    },
    updateTimeData: (state, action) => {
      const { time: newTime } = action.payload;
      let {
        controlFrame: newControlFrame,
        posFram: newPosFrame,
      } = action.payload;

      if (!newControlFrame || !newPosFrame) {
        const { posFrame, controlFrame } = state.timeData;
        newControlFrame = updateFrameByTime(
          state.controlRecord,
          controlFrame,
          newTime
        );
        newPosFrame = updateFrameByTime(state.posRecord, posFrame, newTime);
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
      const { id, status } = action.payload;
      state.currentStatus[`player${id}`] = status;
    },
    setCurrentPos: (state, action) => {
      const { id, x, y, z } = action.payload;
      state.currentPos[`player${id}`] = { x, y, z };
    },
    setNewPosRecord: (state) => {
      // can't save while playing
      if (state.isPlaying) return;

      const { time: curTime, posFrame } = state.timeData;

      Object.keys(state.currentPos).forEach((curName) => {
        const posData = state.currentPos[curName];
        let { x, y, z } = posData;
        [x, y, z] = [x, y, z].map((ele) => Math.round(ele * 1000) / 1000);
        const newPosFrame = { Start: curTime, x, y, z };
        const cloestPosFrame = updateFrameByTime(
          state.posRecord,
          posFrame,
          curTime
        );
        state.timeData.posFrame = cloestPosFrame;
        if (state.posRecord[curName]) {
          if (state.posRecord["player0"][cloestPosFrame].Start === curTime) {
            state.posRecord[curName][cloestPosFrame] = newPosFrame;
          } else {
            state.posRecord[curName].splice(cloestPosFrame + 1, 0, newPosFrame);
          }
        } else {
          state.posRecord[curName] = [newPosFrame];
        }
      });
    },
  },
});

export const {
  playPause,
  posInit,
  controlInit,
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
