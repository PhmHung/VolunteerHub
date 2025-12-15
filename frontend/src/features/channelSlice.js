/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

/* ======================================================
   THUNKS
====================================================== */

// Lấy channel theo eventId (discussion của event)
export const fetchChannelByEventId = createAsyncThunk(
  "channel/fetchByEventId",
  async (eventId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/channel/event/${eventId}`);
      console.log("🟢 CHANNEL DATA:", res.data);
      return res.data; // ✅ CHÍNH XÁC
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Không thể tải kênh thảo luận"
      );
    }
  }
);



/* ======================================================
   SLICE
====================================================== */

const channelSlice = createSlice({
  name: "channel",
  initialState: {
    current: null, // channel hiện tại (theo event)
    loading: false,
    error: null,
  },

  reducers: {
    // ✅ FIX: clearChannel tồn tại thật
    clearChannel: (state) => {
      state.current = null;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchChannelByEventId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannelByEventId.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchChannelByEventId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* ======================================================
   EXPORTS
====================================================== */

export const { clearChannel } = channelSlice.actions;

export const createPost = createAsyncThunk(
  "channel/createPost",
  async ({ channelId, content, attachment }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("channel", channelId);
      formData.append("content", content);

      if (attachment) {
        formData.append("picture", attachment.fileObject);
        formData.append("pictureType", attachment.type);
      } 

      console.log("🟠 Sending request to /api/post");

      const { data } = await api.post(
        "/api/post",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("🟢 API SUCCESS");
      console.log("👉 response data:", data);

      return data.data;
    } catch (err) {
      console.error("🔴 [createPost] ERROR");
      console.error("👉 error:", err);
      console.error("👉 response:", err.response);
      console.error("👉 response data:", err.response?.data);

      return rejectWithValue(
        err.response?.data?.message || "Tạo bài viết thất bại"
      );
    }
  }
);



// 3️⃣ Tạo comment
export const createComment = createAsyncThunk(
  "channel/createComment",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/comments`, {
        postId,
        content,
      });
      return data.data; // comment mới
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Tạo bình luận thất bại"
      );
    }
  }
);

// 4️⃣ Like / reaction
export const toggleReaction = createAsyncThunk(
  "channel/toggleReaction",
  async ({ postId, type = "like" }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/reactions/toggle`, {
        postId,
        type,
      });
      return data.data; // post đã update reaction
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Reaction thất bại"
      );
    }
  }
);



export default channelSlice.reducer;
