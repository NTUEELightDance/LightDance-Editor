import { configureStore } from "@reduxjs/toolkit";
import { getDefaultMiddleware } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import wavesurferReducer from "../features/wavesurfer/wavesurferSlice";
import pixiReducer from "../features/pixi/pixiSlice";
import globalReducer from "../features/globalSlice";

export default configureStore({
  reducer: {
    counter: counterReducer,
    wavesurfer: wavesurferReducer,
    pixi: pixiReducer,
    global: globalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }),
});
