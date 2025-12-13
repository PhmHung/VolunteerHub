/** @format */

import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "../features/eventSlice";
import userReducer from "../features/userSlice";
import registrationReducer from "../features/registrationSlice";
import authReducer from "../features/authSlice";

export const store = configureStore({
  reducer: {
    event: eventReducer,
    user: userReducer,
    registration: registrationReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});

export default store;
