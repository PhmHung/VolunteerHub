/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

// 1. Async Thunks
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/user/profile");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (formData, { rejectWithValue }) => {
    try {
      // --- ĐÃ SỬA: Bỏ config set header thủ công ---
      // Axios sẽ tự động phát hiện FormData và thêm header 'Content-Type: multipart/form-data; boundary=...'
      // Nếu set thủ công sẽ làm mất boundary -> Backend không nhận được file.

      const { data } = await api.put("/api/user/profile", formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  "user/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/api/user/profile/change-password", {
        currentPassword,
        newPassword,
      });
      return data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Admin & Manager
export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/user");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "user/fetchById",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/user/${userId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/user/${userId}`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Lock Account
export const updateUserStatus = createAsyncThunk(
  "user/updateStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/user/${userId}/status`, { status });
      return data; // Mong đợi: { message, user: { ... } }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể thay đổi trạng thái tài khoản"
      );
    }
  }
);

// Update Role
export const updateUserRole = createAsyncThunk(
  "user/updateRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/user/${userId}/role`, { role });
      return data; // ⚠️ Cần đảm bảo Backend trả về { user: ... } hoặc { message, user: ... }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

//Suggested Managers
export const fetchSuggestedManagers = createAsyncThunk(
  "user/fetchSuggestedManagers",
  async (_, { rejectWithValue }) => {
    try {
      // Gọi đúng route bạn đã khai báo trong user.routes.js
      const { data } = await api.get("/api/user/suggested-managers");
      return data.data; // Backend trả về { count, data: [...] }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 2. Slice
const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    profileLoading: false,
    profileError: null,

    users: [],
    usersLoading: false,
    usersError: null,

    selectedUser: null,
    selectedUserLoading: false,
    selectedUserError: null,

    suggestedManagers: [],
    suggestedLoading: false,
    suggestedError: null,

    message: null,
    error: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.message = null;
      state.error = null;
      state.profileError = null;
      state.usersError = null;
      state.selectedUserError = null;
    },
    userLogout: (state) => {
      state.profile = null;
      state.users = [];
      state.message = null;
      state.error = null;
      state.selectedUser = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
      state.selectedUserError = null;
      state.selectedUserLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })

      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        // Cần đảm bảo API trả về object user đã update, hoặc wrapper { user: ... }
        // Nếu API trả về { message, user }, cần sửa thành action.payload.user
        state.profile = action.payload.user || action.payload;
        state.message = "Cập nhật hồ sơ thành công!";
      })

      // Change Password
      .addCase(changeUserPassword.fulfilled, (state, action) => {
        state.message = action.payload;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.error = action.payload;
      })

      // All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })

      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
        state.message = "Xóa người dùng thành công";
      })

      // Update Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        // --- ĐÃ SỬA: Kiểm tra cấu trúc trả về ---
        // Giả sử API trả về { message, user } giống updateStatus
        const updatedUser = action.payload.user || action.payload;

        state.users = state.users.map((u) =>
          u._id === updatedUser._id ? { ...u, role: updatedUser.role } : u
        );
        if (state.profile?._id === updatedUser._id) {
          state.profile.role = updatedUser.role;
        }
        state.message = action.payload.message || "Cập nhật vai trò thành công";
      })

      // Update Status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        // Giả sử API trả về { message, user }
        const { user: updatedUser, message } = action.payload;
        state.users = state.users.map((u) =>
          u._id === updatedUser._id ? { ...u, status: updatedUser.status } : u
        );
        if (state.selectedUser?._id === updatedUser._id) {
          state.selectedUser.status = updatedUser.status;
        }
        state.message = message;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Fetch By ID
      .addCase(fetchUserById.pending, (state) => {
        state.selectedUserLoading = true;
        state.selectedUserError = null;
        state.selectedUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUserLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.selectedUserLoading = false;
        state.selectedUserError = action.payload;
      });
  },
});

export const { clearMessages, userLogout, clearSelectedUser } =
  userSlice.actions;
export default userSlice.reducer;
