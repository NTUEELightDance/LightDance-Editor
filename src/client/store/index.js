import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "../slices/globalSlice";
import loadReducer from "../slices/loadSlice";
import CommandReducer from "../slices/commandSlice";

export default configureStore({
  reducer: {
    global: globalReducer,
    load: loadReducer,
    command: CommandReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
      // }).concat(logger),
    }),
});
