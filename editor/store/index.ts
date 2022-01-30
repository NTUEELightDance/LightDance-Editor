import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "../slices/globalSlice";
import loadReducer from "../slices/loadSlice";
import CommandReducer from "../slices/commandSlice";
import clipboardReducer from "../slices/clipboardSlice";
const store = configureStore({
  reducer: {
    global: globalReducer,
    load: loadReducer,
    command: CommandReducer,
    clipboard: clipboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
      // }).concat(logger),
    }),
});
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
