/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import control from "../../../data/control.json";
import position from "../../../data/position.json";

const binarySearchFrame = (data, time) => {
  let l = 0;
  let r = data["player0"].length - 1;
  let m = Math.floor((l + r + 1) / 2);
  while (l < r) {
    if (data["player0"][m].Start <= time) l = m;
    else r = m - 1;
    m = Math.floor((l + r + 1) / 2);
  }
  return m;
};

export const globalSlice = createSlice({
  name: "global",
  initialState: {
    dancerNum: Object.keys(control).length,
    isPlaying: false,
    // time: 0,
    // controlFrame: 0,
    // posFrame: 0,
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
    updateTime: (state, action) => {
      const time = action.payload;

      if (
        control["player0"][state.timeData.controlFrame + 2] &&
        time >= control["player0"][state.timeData.controlFrame + 1].Start &&
        time <= control["player0"][state.timeData.controlFrame + 2].Start
      ) {
        state.timeData.controlFrame += 1;
      } else {
        state.timeData.controlFrame = binarySearchFrame(control, time);
      }

      if (
        position["player0"][state.timeData.posFrame + 2] &&
        time >= position["player0"][state.timeData.posFrame + 1].Start &&
        time <= position["player0"][state.timeData.posFrame + 2].Start
      ) {
        state.timeData.posFrame += 1;
      } else {
        state.timeData.posFrame = binarySearchFrame(position, time);
      }
      state.timeData.time = action.payload;
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
  updateTime,
  setControlFrame,
  setPosFrame,
  findCurrentControlFrame,
  findCurrentPosFrame,
  setSeletected,
  setCurrentStatus,
  setCurrentPos,
  setNewPosRecord,
} = globalSlice.actions;

export const selectGlobal = (state) => state.global;

export default globalSlice.reducer;
