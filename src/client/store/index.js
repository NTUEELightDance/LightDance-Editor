import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import globalReducer from "../slices/globalSlice";
import loadReducer from "../slices/loadSlice";

export default configureStore({
  reducer: {
    global: globalReducer,
    load: loadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(logger),
});
