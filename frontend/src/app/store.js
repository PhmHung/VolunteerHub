/** @format */

import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "../features/event/eventSlice";

export const store = configureStore({
  reducer: {
    event: eventReducer,
  },
});
