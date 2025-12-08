/** @format */

import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "../features/event/eventSlice";
import userReducer from "../features/user/userSlice";
import registrationReducer from "../features/registration/registrationSlice";
import authReducer from "../features/auth/authSlice";

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
