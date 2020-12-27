import { createSlice } from "@reduxjs/toolkit";

export const pixiSlice = createSlice({
  name: "pixi",
  initialState: {
    selected: [],
    currentStatus: {},
  },
  reducers: {
    setSeletected: (state, action) => {
      state.selected = action.payload;
      console.log(action.payload);
    },
    setCurrentStatus: (state, action) => {
      state.currentStatus = action.payload;
      console.log(action.payload);
    },
  },
});

export const { setSeletected } = pixiSlice.actions;
export const { setCurrentStatus } = pixiSlice.actions;

export const selectPixi = (state) => state.pixi;

export default pixiSlice.reducer;
