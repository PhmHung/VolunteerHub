/** @format */

// src/features/registration/registrationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api"; // axios instance đã có token

// 1. ĐĂNG KÝ THAM GIA SỰ KIỆN
export const registerForEvent = createAsyncThunk(
  "registration/register",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/registrations", { eventId });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return rejectWithValue(message);
    }
  }
);

// 2. HỦY ĐĂNG KÝ (User tự hủy)
export const cancelRegistration = createAsyncThunk(
  "registration/cancel",
  async (registrationId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/api/registrations/${registrationId}`);
      return { registrationId, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return rejectWithValue(message);
    }
  }
);

// 3. LẤY DANH SÁCH ĐĂNG KÝ CỦA USER (My Registrations)
export const fetchMyRegistrations = createAsyncThunk(
  "registration/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/registrations/my-registrations");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 4. (Dành cho Admin/Manager) Lấy tất cả đăng ký của 1 sự kiện
export const fetchEventRegistrations = createAsyncThunk(
  "registration/fetchByEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/events/${eventId}/registrations`);
      return { eventId, registrations: data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 5. (Dành cho Admin/Manager) Chấp nhận đăng ký
export const acceptRegistration = createAsyncThunk(
  "registration/accept",
  async (registrationId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/api/registrations/${registrationId}/accept`
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 6. (Dành cho Admin/Manager) Từ chối đăng ký
export const rejectRegistration = createAsyncThunk(
  "registration/reject",
  async ({ registrationId, reason }, { rejectWithValue }) => {
    try {
      // --- SỬA LỖI Ở ĐÂY: PATCH -> PUT ---
      const { data } = await api.put(
        `/api/registrations/${registrationId}/reject`,
        { reason }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 7. (Dành cho Admin/Manager) Lấy tất cả đăng ký pending
export const fetchPendingRegistrations = createAsyncThunk(
  "registration/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/registrations/pending");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const registrationSlice = createSlice({
  name: "registration",
  initialState: {
    myRegistrations: [],
    myLoading: false,
    myError: null,
    eventRegistrations: {},
    eventLoading: false,
    pendingRegistrations: [],
    pendingLoading: false,
    successMessage: null,
    error: null,
  },

  reducers: {
    clearRegistrationMessages: (state) => {
      state.successMessage = null;
      state.error = null;
      state.myError = null;
    },
  },

  extraReducers: (builder) => {
    // ĐĂNG KÝ
    builder.addCase(registerForEvent.fulfilled, (state, action) => {
      state.successMessage = action.payload.message;
      if (action.payload.data)
        state.myRegistrations.unshift(action.payload.data);
    });

    // HỦY ĐĂNG KÝ
    builder.addCase(cancelRegistration.fulfilled, (state, action) => {
      const { registrationId } = action.payload;
      state.successMessage = action.payload.message;
      state.myRegistrations = state.myRegistrations.filter(
        (reg) => reg._id !== registrationId
      );
    });

    // FETCH MY
    builder.addCase(fetchMyRegistrations.fulfilled, (state, action) => {
      state.myRegistrations = action.payload.data || action.payload;
    });

    // FETCH EVENT REGS
    builder.addCase(fetchEventRegistrations.fulfilled, (state, action) => {
      const { eventId, registrations } = action.payload;
      state.eventRegistrations[eventId] = registrations;
    });

    // ACCEPT
    builder.addCase(acceptRegistration.fulfilled, (state, action) => {
      state.successMessage = "Đã chấp nhận tình nguyện viên!";
      const idToRemove = action.meta.arg;

      if (Array.isArray(state.pendingRegistrations)) {
        state.pendingRegistrations = state.pendingRegistrations.filter(
          (reg) => reg._id !== idToRemove
        );
      }
    });
    // REJECT
    builder.addCase(rejectRegistration.fulfilled, (state, action) => {
      state.successMessage = "Đã từ chối tình nguyện viên.";
      const idToRemove = action.meta.arg.registrationId;
      if (Array.isArray(state.pendingRegistrations)) {
        state.pendingRegistrations = state.pendingRegistrations.filter(
          (reg) => reg._id !== idToRemove
        );
      }
    });

    // FETCH PENDING
    builder.addCase(fetchPendingRegistrations.fulfilled, (state, action) => {
      const data = action.payload.data || action.payload;

      if (Array.isArray(data)) {
        state.pendingRegistrations = data;
      } else {
        console.warn("Dữ liệu pending không phải mảng:", data);
        state.pendingRegistrations = [];
      }
    });
  },
});

export const { clearRegistrationMessages } = registrationSlice.actions;
export default registrationSlice.reducer;
