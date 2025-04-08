import { configureStore } from "@reduxjs/toolkit";

import socketReducer from "./reducers/socketReducer";
import userReducer from "./reducers/userReducer";

export const store = configureStore({
  reducer: {
    user: userReducer,
    socket: socketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
