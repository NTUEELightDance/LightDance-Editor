/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DancerStatus, El, Fiber, LED } from "../types/globalSlice";
import { RootState, AppDispatch } from "../store/index";
import { CheckTypeOfEl } from "utils/math";

const initialState = {
  copyStatus: {} as DancerStatus,
};
export const clipboardSlice = createSlice({
  name: "clipboard",
  initialState,
  reducers: {
    setClipBoard: (state, action: PayloadAction<DancerStatus>) => {
      state.copyStatus = action.payload;
    },
  },
});

export const selectClipboard = (state: RootState) => state.clipboard;

export const { setClipBoard } = clipboardSlice.actions;

export default clipboardSlice.reducer;
