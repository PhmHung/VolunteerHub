/** @format */

// src/features/attendance/attendanceSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/apiConfig";

// Điểm danh (QR code hoặc Manager bấm tay)
export const checkinAttendance = createAsyncThunk(
  "attendance/checkin",
  async ({ eventId, userId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/attendances/${eventId}/checkin`, {
        userId,
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Điểm danh thất bại"
      );
    }
  }
);

// Lấy danh sách đã điểm danh của 1 sự kiện
export const fetchEventAttendances = createAsyncThunk(
  "attendance/fetchByEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/attendances/event/${eventId}`);
      return { eventId, attendances: data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải danh sách điểm danh"
      );
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    byEvent: {}, // { eventId: [...] }
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearAttendanceMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkinAttendance.fulfilled, (state, action) => {
        state.successMessage = "Điểm danh thành công!";
      })
      .addCase(checkinAttendance.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchEventAttendances.fulfilled, (state, action) => {
        const { eventId, attendances } = action.payload;
        state.byEvent[eventId] = attendances;
      });
  },
});

export const { clearAttendanceMessages } = attendanceSlice.actions;
export default attendanceSlice.reducer;
