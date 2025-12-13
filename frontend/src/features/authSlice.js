/** @format */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

// 1. ĐĂNG KÝ
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      // Backend: POST /api/auth/register
      const { data } = await api.post("/api/auth/register", userData);

      // Backend trả về: { _id, userName, ..., token }
      // Lưu token luôn để đăng ký xong là đăng nhập luôn
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đăng ký thất bại");
    }
  }
);

// 2. ĐĂNG NHẬP (Thường)
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ userEmail, password }, { rejectWithValue }) => {
    try {
      // Backend mong đợi "userEmail", không phải "email"
      const { data } = await api.post("/api/auth/login", {
        userEmail,
        password,
      });

      // Backend trả về field là 'token'
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Data chính là user info luôn, không cần .user
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Email hoặc mật khẩu sai"
      );
    }
  }
);

// 3. ĐĂNG NHẬP FIREBASE (Bổ sung cho đủ với Backend)
export const firebaseLoginUser = createAsyncThunk(
  "auth/firebaseLogin",
  async (idToken, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/auth/firebase-login", { idToken });

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi đăng nhập Google"
      );
    }
  }
);

// 4. LẤY PROFILE HIỆN TẠI (Khi F5 trang)
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue("Chưa đăng nhập");
      }
      const { data } = await api.get("/api/user/profile");

      return data;
    } catch {
      localStorage.removeItem("token");
      return rejectWithValue("Phiên đăng nhập hết hạn");
    }
  }
);

// 5. ĐĂNG XUẤT
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  // Vì Backend chưa có API logout và dùng JWT stateless -> Chỉ cần xóa ở client
  localStorage.removeItem("token");
  // localStorage.removeItem("refreshToken"); // Backend bạn chưa có refreshToken nên tạm bỏ
  return null;
});

// =============================================
// Slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // Chứa: { _id, userName, email, phoneNumber, role, biology, ... }
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
    // Action để update user info từ các nơi khác (như trang UserProfile)
    updateUserInfo: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },

  extraReducers: (builder) => {
    // --- REGISTER ---
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Đăng ký thành công!";
        // Nếu muốn đăng ký xong tự login luôn:
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- LOGIN ---
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

    // --- FIREBASE LOGIN ---
    builder
      .addCase(firebaseLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(firebaseLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(firebaseLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // --- FETCH CURRENT USER ---
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

    // --- LOGOUT ---
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.successMessage = "Đăng xuất thành công!";
    });
  },
});

export const { clearAuthMessages, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;
