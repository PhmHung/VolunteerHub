// src/redux/slices/postSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ======================================================
// 1. ADMIN GET ALL POSTS
// ======================================================
export const fetchAllPosts = createAsyncThunk(
  "posts/fetchAllPosts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/post/all-posts");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error fetching posts");
    }
  }
);

// ======================================================
// 2. GET POSTS BY CHANNEL
// ======================================================
export const fetchPostsByChannel = createAsyncThunk(
  "posts/fetchPostsByChannel",
  async (channelId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/post/${channelId}/posts`);
      return { channelId, posts: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error fetching channel posts");
    }
  }
);

// ======================================================
// 3. CREATE POST  (content + optional image)
// ======================================================
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (data, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("content", data.content);
      formData.append("channel", data.channel);

      if (data.image) {
        formData.append("image", data.image);
      }

      const res = await axios.post("/api/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error creating post");
    }
  }
);

// ======================================================
// 4. UPDATE POST (owner only)
// ======================================================
export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async ({ id, content, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("content", content);

      if (image) {
        formData.append("image", image);
      }

      const res = await axios.put(`/api/post/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error updating post");
    }
  }
);

// ======================================================
// 5. DELETE POST (soft delete)
// ======================================================
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/post/${id}`);
      return id; // return deleted id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error deleting post");
    }
  }
);

// ======================================================
// SLICE
// ======================================================
const postSlice = createSlice({
  name: "posts",
  initialState: {
    allPosts: [],        // admin
    channelPosts: {},     // {channelId: [...]}
    loading: false,
    error: null,
  },

  reducers: {
    clearPosts(state) {
      state.channelPosts = {};
      state.allPosts = [];
    }
  },

  extraReducers: (builder) => {
    builder
      // =============================
      // FETCH ALL POSTS (ADMIN)
      // =============================
      .addCase(fetchAllPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.allPosts = action.payload;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =============================
      // FETCH POSTS BY CHANNEL
      // =============================
      .addCase(fetchPostsByChannel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostsByChannel.fulfilled, (state, action) => {
        state.loading = false;
        state.channelPosts[action.payload.channelId] = action.payload.posts;
      })
      .addCase(fetchPostsByChannel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // =============================
      // CREATE POST
      // =============================
      .addCase(createPost.fulfilled, (state, action) => {
        const post = action.payload;
        if (post.channel) {
          if (!state.channelPosts[post.channel]) {
            state.channelPosts[post.channel] = [];
          }
          state.channelPosts[post.channel].unshift(post);
        }
      })

      // =============================
      // UPDATE POST
      // =============================
      .addCase(updatePost.fulfilled, (state, action) => {
        const updated = action.payload;
        const channelId = updated.channel;

        if (state.channelPosts[channelId]) {
          state.channelPosts[channelId] = state.channelPosts[channelId].map(p =>
            p._id === updated._id ? updated : p
          );
        }
      })

      // =============================
      // DELETE POST
      // =============================
      .addCase(deletePost.fulfilled, (state, action) => {
        const deletedId = action.payload;

        for (const channelId in state.channelPosts) {
          state.channelPosts[channelId] = state.channelPosts[channelId].filter(
            p => p._id !== deletedId
          );
        }
      });
  },
});

export const { clearPosts } = postSlice.actions;
export default postSlice.reducer;
