/** @format */

// src/features/registration/registrationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/apiConfig"; // axios instance đã có token

// 1. ĐĂNG KÝ THAM GIA SỰ KIỆN
export const registerForEvent = createAsyncThunk(
  "registration/register",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/registrations", { eventId });
      return data; // { message: "Đăng ký thành công", data: registration }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      return rejectWithValue(message);
    }
  }
);

// 2. HỦY ĐĂNG KÝ
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
      return data; // mảng các registration của user hiện tại
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
      const { data } = await api.patch(`/api/registrations/${registrationId}/accept`);
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
      const { data } = await api.patch(`/api/registrations/${registrationId}/reject`, { reason });
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
    // Danh sách đăng ký của user hiện tại
    myRegistrations: [],
    myLoading: false,
    myError: null,

    // Danh sách đăng ký theo sự kiện (dùng cho trang quản lý)
    eventRegistrations: {},
    eventLoading: false,

    // Danh sách đăng ký pending (admin)
    pendingRegistrations: [],
    pendingLoading: false,

    // Thông báo thành công & lỗi chung
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
    builder
      .addCase(registerForEvent.pending, (state) => {
        state.error = null;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
        // Thêm vào danh sách nếu đang xem "My Registrations"
        if (action.payload.data) {
          state.myRegistrations.unshift(action.payload.data);
        }
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.error = action.payload;
      });

    // HỦY ĐĂNG KÝ
    builder
      .addCase(cancelRegistration.fulfilled, (state, action) => {
        const { registrationId } = action.payload;
        state.successMessage = action.payload.message;

        // Xóa khỏi myRegistrations
        state.myRegistrations = state.myRegistrations.filter(
          (reg) => reg._id !== registrationId
        );

        // Xóa khỏi eventRegistrations nếu đang xem
        Object.keys(state.eventRegistrations).forEach((eventId) => {
          state.eventRegistrations[eventId] = state.eventRegistrations[
            eventId
          ]?.filter((reg) => reg._id !== registrationId);
        });
      })
      .addCase(cancelRegistration.rejected, (state, action) => {
        state.error = action.payload;
      });

    // LẤY ĐĂNG KÝ CỦA TÔI
    builder
      .addCase(fetchMyRegistrations.pending, (state) => {
        state.myLoading = true;
        state.myError = null;
      })
      .addCase(fetchMyRegistrations.fulfilled, (state, action) => {
        state.myLoading = false;
        state.myRegistrations = action.payload;
      })
      .addCase(fetchMyRegistrations.rejected, (state, action) => {
        state.myLoading = false;
        state.myError = action.payload;
      });

    // LẤY ĐĂNG KÝ THEO SỰ KIỆN
    builder
      .addCase(fetchEventRegistrations.pending, (state) => {
        state.eventLoading = true;
      })
      .addCase(fetchEventRegistrations.fulfilled, (state, action) => {
        state.eventLoading = false;
        const { eventId, registrations } = action.payload;
        state.eventRegistrations[eventId] = registrations;
      })
      .addCase(fetchEventRegistrations.rejected, (state, action) => {
        state.eventLoading = false;
        state.error = action.payload;
      });

    // CHẤP NHẬN ĐĂNG KÝ
    builder
      .addCase(acceptRegistration.fulfilled, (state, action) => {
        state.successMessage = "Đã chấp nhận tình nguyện viên!";
        // Xóa khỏi pending list
        state.pendingRegistrations = state.pendingRegistrations.filter(
          (reg) => reg._id !== action.payload.data?._id
        );
      })
      .addCase(acceptRegistration.rejected, (state, action) => {
        state.error = action.payload;
      });

    // TỪ CHỐI ĐĂNG KÝ
    builder
      .addCase(rejectRegistration.fulfilled, (state, action) => {
        state.successMessage = "Đã từ chối tình nguyện viên.";
        // Xóa khỏi pending list
        state.pendingRegistrations = state.pendingRegistrations.filter(
          (reg) => reg._id !== action.payload.data?._id
        );
      })
      .addCase(rejectRegistration.rejected, (state, action) => {
        state.error = action.payload;
      });

    // LẤY ĐĂNG KÝ PENDING
    builder
      .addCase(fetchPendingRegistrations.pending, (state) => {
        state.pendingLoading = true;
      })
      .addCase(fetchPendingRegistrations.fulfilled, (state, action) => {
        state.pendingLoading = false;
        state.pendingRegistrations = action.payload;
      })
      .addCase(fetchPendingRegistrations.rejected, (state, action) => {
        state.pendingLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRegistrationMessages } = registrationSlice.actions;
export default registrationSlice.reducer;
