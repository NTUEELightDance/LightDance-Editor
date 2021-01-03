import { createSlice } from "@reduxjs/toolkit";

export const wavesurferSlice = createSlice({
  name: "wavesurfer",
  initialState: {
    status: false,
    time: 0,
  },
  reducers: {
    playPause: (state) => {
      state.status = !state.status;
    },
    udpateTime: (state, action) => {
      state.time = action.payload;
    },
  },
});

export const { playPause, udpateTime } = wavesurferSlice.actions;

export const selectWavesurfer = (state) => state.wavesurfer;

export default wavesurferSlice.reducer;
