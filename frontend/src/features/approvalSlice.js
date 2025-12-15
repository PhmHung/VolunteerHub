/** @format */

// src/features/approval/approvalSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api"; // <-- SỬ DỤNG INSTANCE API CHUNG

// =============================================
// 1. ADMIN: Lấy danh sách yêu cầu chờ duyệt
// =============================================
export const fetchPendingApprovals = createAsyncThunk(
  "approval/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      // Route: /api/approval-requests/pending
      const { data } = await api.get("/api/approval-requests/pending");
      // Backend trả về { message, count, data: [] } -> Lấy data
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải đơn duyệt Admin"
      );
    }
  }
);

// =============================================
// 2. MANAGER/VOLUNTEER: Lấy danh sách yêu cầu đã gửi (MỚI)
// =============================================
export const fetchMyRequests = createAsyncThunk(
  "approval/fetchMyRequests",
  async (_, { rejectWithValue }) => {
    try {
      // Route: /api/approval-requests/my-request (Theo file approvalRequest.routes.js mới)
      const { data } = await api.get("/api/approval-requests/my-requests");
      // Backend trả về { message, count, data: [] }
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải lịch sử yêu cầu của bạn"
      );
    }
  }
);

// =============================================
// 3. ADMIN: Duyệt / Từ chối Đa hình
// =============================================
export const processApprovalRequest = createAsyncThunk(
  "approval/processRequest",
  async ({ requestId, actionType, adminNote = "" }, { rejectWithValue }) => {
    // actionType là 'approve' hoặc 'reject'
    try {
      // Route: /api/approval-requests/:id/approve | /reject (Dùng PATCH)
      const { data } = await api.patch(
        `/api/approval-requests/${requestId}/${actionType}`,
        {
          adminNote,
        }
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || `Thao tác ${actionType} thất bại`
      );
    }
  }
);

// =============================================
// Slice
// =============================================
const approvalSlice = createSlice({
  name: "approval",
  initialState: {
    pendingList: [], // Danh sách chờ duyệt (Admin)
    myRequestsList: [], // Danh sách yêu cầu đã gửi (Manager/Volunteer)
    loading: false,
    myRequestsLoading: false, // Loading riêng cho requests của User
    error: null,
    successMessage: null,
  },
  reducers: {
    clearApprovalMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // --- 1. FETCH PENDING (ADMIN) ---
    builder
      .addCase(fetchPendingApprovals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingList = action.payload;
      })
      .addCase(fetchPendingApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- 2. FETCH MY REQUESTS (USER) ---
      .addCase(fetchMyRequests.pending, (state) => {
        state.myRequestsLoading = true;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.myRequestsLoading = false;
        state.myRequestsList = action.payload;
      })
      .addCase(fetchMyRequests.rejected, (state, action) => {
        state.myRequestsLoading = false;
        state.error = action.payload;
        state.myRequestsList = [];
      })

      // --- 3. PROCESS APPROVAL (ADMIN) ---
      .addCase(processApprovalRequest.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
        const processedId = action.payload.data._id;

        // Xóa khỏi danh sách chờ duyệt
        state.pendingList = state.pendingList.filter(
          (item) => item._id !== processedId
        );

        // Cập nhật trạng thái trong danh sách của User (nếu đang hiển thị)
        state.myRequestsList = state.myRequestsList.map((item) =>
          item._id === processedId ? action.payload.data : item
        );
      })
      .addCase(processApprovalRequest.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearApprovalMessages } = approvalSlice.actions;
export default approvalSlice.reducer;
