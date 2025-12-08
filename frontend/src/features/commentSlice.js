/** @format */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ================================
// CREATE COMMENT
// ================================
export const createComment = createAsyncThunk(
  "comments/createComment",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/comment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating comment");
    }
  }
);

// ================================
// GET COMMENTS BY POST
// ================================
export const getCommentsByPost = createAsyncThunk(
  "comments/getCommentsByPost",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/comment/${postId}`);
      return { postId, comments: res.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching comments");
    }
  }
);

// ================================
// UPDATE COMMENT
// ================================
export const updateComment = createAsyncThunk(
  "comments/updateComment",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/comment/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error updating comment");
    }
  }
);

// ================================
// DELETE COMMENT
// ================================
export const deleteComment = createAsyncThunk(
  "comments/deleteComment",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/comment/${id}`);
      return { id, message: res.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error deleting comment");
    }
  }
);

// ================================
// SLICE
// ================================
const commentSlice = createSlice({
  name: "comments",
  initialState: {
    commentsByPost: {}, // { postId: [comments] }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // CREATE COMMENT
      .addCase(createComment.fulfilled, (state, action) => {
        const postId = action.payload.post;
        if (!state.commentsByPost[postId]) state.commentsByPost[postId] = [];
        state.commentsByPost[postId].unshift(action.payload);
      })

      // GET COMMENTS
      .addCase(getCommentsByPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCommentsByPost.fulfilled, (state, action) => {
        state.loading = false;
        state.commentsByPost[action.payload.postId] = action.payload.comments;
      })
      .addCase(getCommentsByPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UPDATE COMMENT
      .addCase(updateComment.fulfilled, (state, action) => {
        const updated = action.payload;
        const postId = updated.post;

        if (state.commentsByPost[postId]) {
          state.commentsByPost[postId] = state.commentsByPost[postId].map((c) =>
            c._id === updated._id ? updated : c
          );
        }
      })

      // DELETE COMMENT
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { id } = action.payload;

        for (const postId in state.commentsByPost) {
          state.commentsByPost[postId] = state.commentsByPost[postId].filter(
            (c) => c._id !== id
          );
        }
      });
  },
});

export default commentSlice.reducer;
