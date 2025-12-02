/** @format */

// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/apiConfig"; // axios instance có interceptor

// =============================================
// 1. ĐĂNG KÝ (nếu bạn cho user tự đăng ký)
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/register", userData);
      return data; // { message, user }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đăng ký thất bại");
    }
  }
);

// 2. ĐĂNG NHẬP
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      // Lưu token vào localStorage (hoặc httpOnly cookie nếu backend dùng)
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
      }
      return data.user; // { _id, name, email, role, ... }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Email hoặc mật khẩu sai"
      );
    }
  }
);

// 3. LẤY PROFILE HIỆN TẠI (khi reload trang)
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/auth/me");
      return data.user;
    } catch (err) {
      // Token hết hạn hoặc không hợp lệ → xóa
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return rejectWithValue("Phiên đăng nhập hết hạn");
    }
  }
);

// 4. ĐĂNG XUẤT
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/api/auth/logout"); // gọi backend để blacklist refresh token (nếu có)
    } catch (err) {
      // Không care lỗi logout
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }
  }
);

// =============================================
// Slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    successMessage: null,
  },

  reducers: {
    clearAuthMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    // Dùng khi interceptor tự động refresh token thành công
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },

  extraReducers: (builder) => {
    // REGISTER
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Đăng ký thành công! Vui lòng đăng nhập.";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // LOGIN
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // FETCH CURRENT USER (reload trang)
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // LOGOUT
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.successMessage = "Đăng xuất thành công!";
    });
  },
});

export const { clearAuthMessages, setCredentials } = authSlice.actions;
export default authSlice.reducer;
