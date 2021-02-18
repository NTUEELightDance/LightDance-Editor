import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";
import globalReducer from "../slices/globalSlice";

export default configureStore({
  reducer: {
    global: globalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});
