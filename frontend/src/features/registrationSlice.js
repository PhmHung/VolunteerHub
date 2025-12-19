/** @format */

// src/features/registration/registrationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api"; // axios instance đã có token

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

// 7. (Dành cho Admin/Manager) Lấy TẤT CẢ đăng ký (Pending + Approved + Rejected)
// Đã đổi tên từ fetchPending -> fetchAll
export const fetchAllRegistrations = createAsyncThunk(
  "registration/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      // Gọi API mà bạn đã sửa ở Controller (lấy tất cả không lọc status)
      const { data } = await api.get("/api/registrations/pending");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 8. LẤY QR CODE CỦA USER THEO EVENT
export const fetchMyQRCode = createAsyncThunk(
  "registration/fetchMyQRCode",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/api/registrations/${eventId}/my-qr`
      );
      return data.qrToken;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không lấy được mã QR"
      );
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

    // Vẫn giữ tên biến là pendingRegistrations để đỡ phải sửa AdminDashboard
    // Nhưng thực tế nó chứa TẤT CẢ các loại đăng ký
    pendingRegistrations: [],
    pendingLoading: false,

    myQrToken: null,
    qrLoading: false,
    qrError: null,


    successMessage: null,
    error: null,
  },

  reducers: {
    clearRegistrationMessages: (state) => {
      state.successMessage = null;
      state.error = null;
      state.myError = null;
    },
    clearMyQr: (state) => {
      state.myQrToken = null;
      state.qrLoading = false;
      state.qrError = null;
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

    // ACCEPT (DUYỆT) - SỬA LOGIC: CẬP NHẬT STATUS
    builder.addCase(acceptRegistration.fulfilled, (state, action) => {
      state.successMessage = "Đã chấp nhận tình nguyện viên!";
      const idToUpdate = action.meta.arg;

      // Tìm và cập nhật status thay vì xóa
      const index = state.pendingRegistrations.findIndex(
        (reg) => reg._id === idToUpdate
      );
      if (index !== -1) {
        state.pendingRegistrations[index].status = "registered"; // Hoặc "approved" tùy Enum bạn dùng
      }
    });

    // REJECT (TỪ CHỐI) - SỬA LOGIC: CẬP NHẬT STATUS
    builder.addCase(rejectRegistration.fulfilled, (state, action) => {
      state.successMessage = "Đã từ chối tình nguyện viên.";
      const idToUpdate = action.meta.arg.registrationId;

      // Tìm và cập nhật status thay vì xóa
      const index = state.pendingRegistrations.findIndex(
        (reg) => reg._id === idToUpdate
      );
      if (index !== -1) {
        state.pendingRegistrations[index].status = "cancelled"; // Hoặc "rejected" tùy Enum bạn dùng
      }
    });

    // FETCH ALL (Thay cho Fetch Pending)
    builder.addCase(fetchAllRegistrations.pending, (state) => {
      state.pendingLoading = true;
    });
    builder.addCase(fetchAllRegistrations.fulfilled, (state, action) => {
      state.pendingLoading = false;
      const data = action.payload.data || action.payload;

      if (Array.isArray(data)) {
        state.pendingRegistrations = data;
      } else {
        console.warn("Dữ liệu không phải mảng:", data);
        state.pendingRegistrations = [];
      }
    });
    builder.addCase(fetchAllRegistrations.rejected, (state, action) => {
      state.pendingLoading = false;
      state.error = action.payload;
    });

    builder
    .addCase(fetchMyQRCode.pending, (state) => {
      state.qrLoading = true;
      state.qrError = null;
    })
    .addCase(fetchMyQRCode.fulfilled, (state, action) => {
      state.qrLoading = false;
      state.myQrToken = action.payload;
    })
    .addCase(fetchMyQRCode.rejected, (state, action) => {
      state.qrLoading = false;
      state.qrError = action.payload;
    });

  },
});

export const checkOutByQr = createAsyncThunk(
  "registration/checkInByQr",
  async ({ qrToken }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        `/api/registrations/check-out`,
        { qrToken }
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Check-out thất bại"
      );
    }
  }
);

export const { clearRegistrationMessages, clearMyQr } = registrationSlice.actions;
export default registrationSlice.reducer;
