import { createSlice } from "@reduxjs/toolkit";

export const wavesurferSlice = createSlice({
  name: "wavesurfer",
  initialState: {
    status: false,
  },
  reducers: {
    playPause: (state) => {
      state.status = !state.status;
    },
  },
});

export const { playPause } = wavesurferSlice.actions;

export const selectWavesurfer = (state) => state.wavesurfer;

export default wavesurferSlice.reducer;
