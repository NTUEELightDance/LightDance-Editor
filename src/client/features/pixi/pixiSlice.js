import { createSlice } from "@reduxjs/toolkit";

export const pixiSlice = createSlice({
  name: "pixi",
  initialState: {
    status: false,
  },
  reducers: {
    playPause: (state) => {
      state.status = !state.status;
    },
  },
});

export const { playPause } = pixiSlice.actions;

export const selectPixi = (state) => state.pixi;

export default pixiSlice.reducer;
