import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import wavesurferReducer from "../features/wavesurfer/wavesurferSlice";

export default configureStore({
  reducer: {
    counter: counterReducer,
    wavesurfer: wavesurferReducer,
  },
});
