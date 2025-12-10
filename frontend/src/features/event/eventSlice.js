/** @format */

// src/features/event/eventSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/apiConfig"; // axios instance đã gắn token

// =============================================
// 1. PUBLIC: Lấy danh sách sự kiện đã duyệt (có filter, phân trang, search, tag)
export const fetchEvents = createAsyncThunk(
  "event/fetchAll",
  async (
    { page = 1, limit = 12, search = "", tag = "", status = "approved" } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/api/events", {
        params: { page, limit, search, tag, status },
      });
      return data; // { data: [...], pagination: {...}, message }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải danh sách sự kiện"
      );
    }
  }
);

// 2. Lấy chi tiết 1 sự kiện (public nếu approved, private nếu pending + có quyền)
export const fetchEventById = createAsyncThunk(
  "event/fetchById",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/events/${eventId}`);
      return data.data; // backend trả { message, data }
    } catch (err) {
      const msg = err.response?.data?.message || "Không tìm thấy sự kiện";
      return rejectWithValue(msg);
    }
  }
);

// 3. Manager: Tạo sự kiện mới (tự động gửi yêu cầu duyệt)
export const createEvent = createAsyncThunk(
  "event/create",
  async (eventData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/events", eventData);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Tạo sự kiện thất bại"
      );
    }
  }
);

// 4. Manager: Cập nhật sự kiện (chỉ được sửa nếu chưa duyệt)
export const updateEvent = createAsyncThunk(
  "event/update",
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/events/${eventId}`, eventData);
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Cập nhật thất bại"
      );
    }
  }
);

// 5. Admin: Duyệt / Từ chối sự kiện
export const approveEvent = createAsyncThunk(
  "event/approve",
  async ({ eventId, status, adminNote = "" }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/events/${eventId}/approve`, {
        status,
        adminNote,
      });
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Duyệt sự kiện thất bại"
      );
    }
  }
);

//6. Manager: Lấy danh sách đăng ký của sự kiện
// Gọi API: /api/events/:eventId/registrations
export const fetchEventRegistrations = createAsyncThunk(
  "event/fetchRegistrations",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/events/${eventId}/registrations`);
      return data; // Backend trả về mảng registrations trực tiếp
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải danh sách đăng ký"
      );
    }
  }
);
// =============================================
// Slice
const eventSlice = createSlice({
  name: "event",
  initialState: {
    // Danh sách sự kiện (public + phân trang)
    list: [],
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      pages: 0,
    },
    loading: false,
    error: null,

    // Sự kiện đang xem chi tiết
    current: null,
    currentLoading: false,

    //Danh sách đăng ký cho sự kiện hiện tại
    registrations: [],
    registrationsLoading: false,

    // Thông báo thành công
    successMessage: null,
  },

  reducers: {
    clearEventMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
    clearCurrentEvent: (state) => {
      state.current = null;
    },
    clearEventError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // === FETCH ALL ===
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // === FETCH BY ID ===
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.currentLoading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.currentLoading = false;
        state.current = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.currentLoading = false;
        state.error = action.payload;
      });

    // === CREATE ===
    builder
      .addCase(createEvent.fulfilled, (state) => {
        state.successMessage = "Tạo sự kiện thành công! Đang chờ duyệt.";
        // Có thể push vào danh sách nếu muốn hiển thị luôn (pending)
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.error = action.payload;
      });

    // === UPDATE ===
    builder
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.successMessage = "Cập nhật sự kiện thành công!";
        if (state.current?._id === action.payload._id) {
          state.current = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.error = action.payload;
      });

    // === APPROVE / REJECT ===
    builder
      .addCase(approveEvent.fulfilled, (state, action) => {
        const updatedEvent = action.payload;
        state.successMessage =
          updatedEvent.status === "approved"
            ? "Sự kiện đã được duyệt!"
            : "Đã từ chối sự kiện.";

        // Cập nhật trong danh sách nếu có
        state.list = state.list.map((e) =>
          e._id === updatedEvent._id ? updatedEvent : e
        );

        // Cập nhật current nếu đang xem
        if (state.current?._id === updatedEvent._id) {
          state.current = updatedEvent;
        }
      })
      .addCase(approveEvent.rejected, (state, action) => {
        state.error = action.payload;
      });

    // === FETCH EVENT REGISTRATIONS ===
    builder
      .addCase(fetchEventRegistrations.pending, (state) => {
        state.registrationsLoading = true;
        // Không xóa error chung để tránh nháy lỗi UI
      })
      .addCase(fetchEventRegistrations.fulfilled, (state, action) => {
        state.registrationsLoading = false;
        state.registrations = action.payload;
      })
      .addCase(fetchEventRegistrations.rejected, (state, action) => {
        state.registrationsLoading = false;
        // Nếu lỗi là do "Không tìm thấy danh sách đăng ký" (trống) -> set mảng rỗng
        // Nếu lỗi server -> set error
        state.error = action.payload;
        state.registrations = [];
      });
  },
});

export const {
  clearEventMessages,
  clearCurrentEvent,
  clearEventError,
  clearRegistrations,
} = eventSlice.actions;

export default eventSlice.reducer;
