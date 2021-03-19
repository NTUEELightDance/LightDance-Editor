/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";

export const commandSlice = createSlice({
  name: "command",
  initialState: {
    play: false,
    stop: false,

    startTime: 0,
    sysTime: 0,
  },
  reducers: {
    setPlay: (state, action) => {
      state.play = action.payload;
    },
    setStop: (state, action) => {
      state.stop = action.payload;
      state.play = false;
    },
    startPlay: (state, action) => {
      const { startTime, sysTime } = action.payload;
      state.startTime = startTime;
      state.sysTime = sysTime;
      state.stop = false;
      state.play = true;
    },
  },
});

export const { setPlay, setStop, startPlay } = commandSlice.actions;

export const selectCommand = (state) => state.command;

export default commandSlice.reducer;
