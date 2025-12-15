/** @format */

// src/features/event/eventSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api"; // axios instance đã gắn token

// =============================================
// 1. PUBLIC: Lấy danh sách sự kiện (Đã thêm sort và minRating)
export const fetchEvents = createAsyncThunk(
  "event/fetchAll",
  async (
    {
      page = 1,
      limit = 12,
      search = "",
      tag = "",
      status = "approved",
      sort = "upcoming",
      minRating = 0,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/api/events", {
        params: {
          page,
          limit,
          search,
          tag,
          status,
          sort,
          minRating,
        },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải danh sách sự kiện"
      );
    }
  }
);
// 1b. MANAGER/ADMIN: Lấy danh sách sự kiện của mình
export const fetchManagementEvents = createAsyncThunk(
  "event/fetchManagement",
  async (
    { page = 1, limit = 10, search = "", status = "" } = {}, // status rỗng = lấy tất cả
    { rejectWithValue }
  ) => {
    try {
      // Gọi đúng endpoint /management đã khai báo trong route
      const { data } = await api.get("/api/events/management", {
        params: { page, limit, search, status },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải danh sách quản lý"
      );
    }
  }
);

// 1c. VOLUNTEER / MANAGER: Lấy danh sách event mình tham gia (approved)
export const fetchMyEvents = createAsyncThunk(
  "event/fetchMyEvents",
  async (
    { page = 1, limit = 10 } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/api/events/me", {
        params: { page, limit },
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải sự kiện của tôi"
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
//7.
// Thêm action xóa sự kiện
export const deleteEvent = createAsyncThunk(
  "event/deleteEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/events/${eventId}`);
      return eventId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xóa thất bại");
    }
  }
);

export const cancelEvent = createAsyncThunk(
  "event/cancel",
  async ({ eventId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/events/${eventId}/cancel`, {
        reason,
      });
      return data.data; // Trả về sự kiện đã được cập nhật
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Hủy sự kiện thất bại"
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

    // 👇 [MỚI] State quản lý bộ lọc & sắp xếp
    filters: {
      search: "",
      tag: "",
      status: "approved",
      sort: "upcoming", // Mặc định: Sắp diễn ra
      minRating: 0, // Mặc định: Lấy tất cả
      page: 1,
    },

    loading: false,
    error: null,

    // Sự kiện đang xem chi tiết
    current: null,
    currentLoading: false,

    // Danh sách đăng ký cho sự kiện hiện tại
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
    clearRegistrations: (state) => {
      state.registrations = [];
      state.registrationsLoading = false;
    },

    // 👇 [MỚI] Action cập nhật bộ lọc
    setFilters: (state, action) => {
      // Gộp filter cũ với filter mới (VD: chỉ đổi page, giữ nguyên search)
      state.filters = { ...state.filters, ...action.payload };
    },
    // 👇 [MỚI] Reset bộ lọc về mặc định
    resetFilters: (state) => {
      state.filters = {
        search: "",
        tag: "",
        status: "approved",
        sort: "upcoming",
        minRating: 0,
        page: 1,
      };
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

    // === FETCH MANAGEMENT EVENTS ===
    builder
      .addCase(fetchManagementEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagementEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchManagementEvents.rejected, (state, action) => {
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
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.error = action.payload;
      });

    // === UPDATE ===
    builder
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.successMessage = "Cập nhật sự kiện thành công!";
        // Cập nhật vào current nếu đang xem
        if (state.current?._id === action.payload._id) {
          state.current = action.payload;
        }
        // 👇 [FIX] Cập nhật luôn vào list để danh sách hiển thị đúng mà không cần reload
        state.list = state.list.map((e) =>
          e._id === action.payload._id ? action.payload : e
        );
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

        // Cập nhật trong danh sách
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
      })
      .addCase(fetchEventRegistrations.fulfilled, (state, action) => {
        state.registrationsLoading = false;
        state.registrations = action.payload;
      })
      .addCase(fetchEventRegistrations.rejected, (state, action) => {
        state.registrationsLoading = false;
        state.error = action.payload;
        state.registrations = [];
      });

    // === DELETE ===
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        // Xóa khỏi danh sách
        state.list = state.list.filter((event) => event._id !== action.payload);

        // 👇 [FIX] Nếu đang xem chi tiết sự kiện vừa xóa -> Clear luôn để tránh lỗi UI
        if (state.current?._id === action.payload) {
          state.current = null;
        }

        state.successMessage = "Đã xóa sự kiện thành công!";
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // CANCELED
    builder
      .addCase(cancelEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelEvent.fulfilled, (state, action) => {
        state.loading = false;
        const cancelledEvent = action.payload;
        state.successMessage = "Đã hủy sự kiện thành công!";

        // Cập nhật trong danh sách
        state.list = state.list.map((e) =>
          e._id === cancelledEvent._id ? cancelledEvent : e
        );

        // Cập nhật current nếu đang xem
        if (state.current?._id === cancelledEvent._id) {
          state.current = cancelledEvent;
        }
      })
      .addCase(cancelEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearEventMessages,
  clearCurrentEvent,
  clearEventError,
  clearRegistrations,
  setFilters, // <--- Nhớ export action này
  resetFilters, // <--- Nhớ export action này
} = eventSlice.actions;

export default eventSlice.reducer;
