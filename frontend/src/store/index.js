/** @format */

import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "../features/eventSlice";
import userReducer from "../features/userSlice";
import registrationReducer from "../features/registrationSlice";
import authReducer from "../features/authSlice";
import approvalReducer from "../features/approvalSlice";
import channelReducer from "../features/channelSlice";

export const store = configureStore({
  reducer: {
    event: eventReducer,
    user: userReducer,
    registration: registrationReducer,
    auth: authReducer,
    approval: approvalReducer,
    channel: channelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});

export default store;
