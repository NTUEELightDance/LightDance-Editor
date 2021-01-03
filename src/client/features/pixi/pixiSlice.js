import { createSlice } from "@reduxjs/toolkit";

export const pixiSlice = createSlice({
  name: "pixi",
  initialState: {
    selected: [0],
    currentStatus: {},
    currentPos: {},
  },
  reducers: {
    setSeletected: (state, action) => {
      state.selected = action.payload;
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
  setSeletected,
  setCurrentStatus,
  setCurrentPos,
} = pixiSlice.actions;

export const selectPixi = (state) => state.pixi;

export default pixiSlice.reducer;
