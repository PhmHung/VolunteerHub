/** @format */

// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/apiConfig";

// 1. Async Thunks
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/users/profile");
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

      const { data } = await api.put("/users/profile", formData, config);
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
      const { data } = await api.put("/users/profile/change-password", {
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
      const { data } = await api.get("/users");
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
      await api.delete(`/users/${userId}`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "user/updateRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role });
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

    message: null, // thông báo thành công
    error: null, // lỗi chung
  },
  reducers: {
    clearMessages: (state) => {
      state.message = null;
      state.error = null;
      state.profileError = null;
      state.usersError = null;
    },
    userLogout: (state) => {
      state.profile = null;
      state.users = [];
      state.message = null;
      state.error = null;
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
      });
  },
});

export const { clearMessages, userLogout } = userSlice.actions;
export default userSlice.reducer;
