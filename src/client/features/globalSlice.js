import { createSlice } from "@reduxjs/toolkit";
import control from "../data/control.json";

export const globalSlice = createSlice({
  name: "global",
  initialState: {
    status: false,
    time: 0,
    frame: 0,
    selected: [0],
    currentStatus: {},
    currentPos: {},
  },
  reducers: {
    playPause: (state) => {
      state.status = !state.status;
    },
    udpateTime: (state, action) => {
      state.time = action.payload;
    },
    setFrame: (state, action) => {
      state.frame = action.payload;
    },
    setSeletected: (state, action) => {
      state.selected = action.payload;
    },
    findCurrentFrame: (state, action) => {
      const time = action.payload;
      // binary search timeInd with this.time
      let l = 0;
      let r = control[0].length - 1;
      let m = Math.floor((l + r + 1) / 2);
      while (l < r) {
        if (control[0][m].Start <= time) l = m;
        else r = m - 1;
        m = Math.floor((l + r + 1) / 2);
      }
      state.frame = m;
    },
    setCurrentStatus: (state, action) => {
      state.currentStatus = action.payload;
    },
    setCurrentPos: (state, action) => {
      let id = action.payload[0];
      if (id === -1) {
        id = state.selected[0];
      }
      const x = action.payload[1][0];
      const y = action.payload[1][1];
      state.currentPos[id] = {
        x: x,
        y: y,
      };
    },
  },
});

export const {
  playPause,
  udpateTime,
  setFrame,
  findCurrentFrame,
  setSeletected,
  setCurrentStatus,
  setCurrentPos,
} = globalSlice.actions;

export const selectGlobal = (state) => state.global;

export default globalSlice.reducer;
