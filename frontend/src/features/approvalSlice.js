/** @format */

// src/features/approval/approvalSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/apiConfig";

// Lấy danh sách đơn chờ duyệt (Manager/Admin)
export const fetchPendingApprovals = createAsyncThunk(
  "approval/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/approval-requests/pending");
      return data; // mảng các registration + event + user info
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải đơn duyệt"
      );
    }
  }
);

// Duyệt / Từ chối đơn
export const approveRegistration = createAsyncThunk(
  "approval/approve",
  async ({ requestId, status, note = "" }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        `/approval-requests/${requestId}/approve`,
        {
          status, // "approved" | "rejected"
          note,
        }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Duyệt thất bại");
    }
  }
);

const approvalSlice = createSlice({
  name: "approval",
  initialState: {
    pendingList: [],
    loading: false,
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

      .addCase(approveRegistration.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
        // Xóa khỏi danh sách chờ duyệt
        state.pendingList = state.pendingList.filter(
          (item) => item._id !== action.payload.data._id
        );
      })
      .addCase(approveRegistration.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearApprovalMessages } = approvalSlice.actions;
export default approvalSlice.reducer;
