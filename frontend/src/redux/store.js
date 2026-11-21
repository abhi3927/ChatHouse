import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import messageReducer from "./messageSlice";
import socketReducer from "./socketSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    message: messageReducer,
    socket: socketReducer,
  },
  // The socket instance lives in the store but is not serializable/plain.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["socket/setSocket"],
        ignoredPaths: ["socket.socket"],
      },
      immutableCheck: { ignoredPaths: ["socket.socket"] },
    }),
});

export default store;
