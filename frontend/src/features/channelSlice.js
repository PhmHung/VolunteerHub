// src/redux/slices/channelSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ===============================
// GET ALL CHANNELS (ADMIN ONLY)
// ===============================
export const fetchAllChannels = createAsyncThunk(
  "channels/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/channels"); // GET /
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error fetching channels");
    }
  }
);

// ===================================
// GET CHANNEL BY ID (Admin / Member)
// ===================================
export const fetchChannelById = createAsyncThunk(
  "channels/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/channels/${id}`); // GET /:id
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error fetching channel");
    }
  }
);

const channelSlice = createSlice({
  name: "channels",
  initialState: {
    channels: [],        // admin xem tất cả
    currentChannel: null, // xem chi tiết 1 channel
    loading: false,
    error: null,
  },

  reducers: {
    clearChannel(state) {
      state.currentChannel = null;
    }
  },

  extraReducers: (builder) => {
    builder
      // ======================================
      // FETCH ALL CHANNELS
      // ======================================
      .addCase(fetchAllChannels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllChannels.fulfilled, (state, action) => {
        state.loading = false;
        state.channels = action.payload;
      })
      .addCase(fetchAllChannels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ======================================
      // FETCH CHANNEL BY ID
      // ======================================
      .addCase(fetchChannelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannelById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChannel = action.payload;
      })
      .addCase(fetchChannelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentChannel = null;
      });
  },
});

export const { clearChannel } = channelSlice.actions;
export default channelSlice.reducer;
