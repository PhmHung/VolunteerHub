/** @format */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ================================
// ADD OR UPDATE REACTION
// ================================
export const addReaction = createAsyncThunk(
  "reaction/addReaction",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.post("/reaction", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to add reaction");
    }
  }
);

// ================================
// REMOVE REACTION
// ================================
export const removeReaction = createAsyncThunk(
  "reaction/removeReaction",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`/reaction/${id}`);
      return { id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to remove reaction");
    }
  }
);

// ================================
// GET REACTIONS (POST OR COMMENT)
// ================================
export const getReactions = createAsyncThunk(
  "reaction/getReactions",
  async (query, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(query).toString();
      const res = await axios.get(`/reaction?${params}`);
      return {
        query,
        reactions: res.data.reactions,
        summary: res.data.summary,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch reactions");
    }
  }
);

// ================================
// SLICE
// ================================
const reactionSlice = createSlice({
  name: "reaction",
  initialState: {
    reactionsByTarget: {}, // { post: {postId: []}, comment: {commentId: []} }
    summaryByTarget: {},   // { post: {...}, comment: {...} }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET REACTION
      .addCase(getReactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReactions.fulfilled, (state, action) => {
        state.loading = false;

        const { query, reactions, summary } = action.payload;

        if (query.post) {
          state.reactionsByTarget[`post-${query.post}`] = reactions;
          state.summaryByTarget[`post-${query.post}`] = summary;
        }
        if (query.comment) {
          state.reactionsByTarget[`comment-${query.comment}`] = reactions;
          state.summaryByTarget[`comment-${query.comment}`] = summary;
        }
      })
      .addCase(getReactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD REACTION
      .addCase(addReaction.fulfilled, (state, action) => {
        const r = action.payload;

        const key = r.post
          ? `post-${r.post}`
          : `comment-${r.comment}`;

        // Nếu chưa có gì thì tạo mảng
        if (!state.reactionsByTarget[key]) {
          state.reactionsByTarget[key] = [];
        }

        // Xóa reaction cũ của user nếu có (vì backend update reaction)
        state.reactionsByTarget[key] = state.reactionsByTarget[key].filter(
          react => react.user !== r.user
        );

        // Thêm reaction mới
        state.reactionsByTarget[key].push(r);
      })

      // REMOVE REACTION
      .addCase(removeReaction.fulfilled, (state, action) => {
        const { id } = action.payload;

        for (const key in state.reactionsByTarget) {
          state.reactionsByTarget[key] = state.reactionsByTarget[key].filter(
            r => r._id !== id
          );
        }
      });
  },
});

export default reactionSlice.reducer;
