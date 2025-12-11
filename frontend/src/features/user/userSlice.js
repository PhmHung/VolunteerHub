/** @format */

// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/apiConfig";

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
      // formData có thể là object thường hoặc FormData (khi có ảnh)
      const config =
        formData instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {};

      const { data } = await api.put("/api/user/profile", formData, config);
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
      //API: GET /api/users/:id
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

//lock
export const updateUserStatus = createAsyncThunk(
  "user/updateStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/user/${userId}/status`, { status });
      return data; // { message, user: { ... } }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể thay đổi trạng thái tài khoản"
      );
    }
  }
);
//role
export const updateUserRole = createAsyncThunk(
  "user/updateRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/user/${userId}/role`, { role });
      return data;
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

    selectedUser: null, // Lưu thông tin chi tiết user
    selectedUserLoading: false,
    selectedUserError: null,

    message: null, // thông báo thành công
    error: null, // lỗi chung
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
    // Profile
    builder
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
        state.profile = action.payload;
        state.message = "Cập nhật hồ sơ thành công!";
      })

      // Change Password
      .addCase(changeUserPassword.fulfilled, (state, action) => {
        state.message = action.payload;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.error = action.payload;
      })

      // All Users (Admin/Manager)
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
        const updated = action.payload;
        state.users = state.users.map((u) =>
          u._id === updated._id ? { ...u, role: updated.role } : u
        );
        if (state.profile?._id === updated._id) {
          state.profile.role = updated.role;
        }
        state.message = "Cập nhật vai trò thành công";
      })

      .addCase(updateUserStatus.fulfilled, (state, action) => {
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

      // 3. Selected User by ID
      .addCase(fetchUserById.pending, (state) => {
        state.selectedUserLoading = true;
        state.selectedUserError = null;
        state.selectedUser = null; // Xóa data cũ để tránh hiển thị nhầm
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
