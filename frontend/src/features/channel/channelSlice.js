import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

// 1. Lấy thông tin channel của sự kiện
export const fetchChannelByEventId = createAsyncThunk(
  "channel/fetchByEventId",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data: channel } = await api.get(`/api/channel/event/${eventId}`);
      
      // Fetch comments and reactions for each post manually since backend populate was reverted
      if (channel && channel.posts) {
        const postsWithDetails = await Promise.all(channel.posts.map(async (post) => {
          try {
            // Fetch comments
            const commentsRes = await api.get(`/api/comment/${post._id || post.id}`);
            // Fetch reactions
            const reactionsRes = await api.get(`/api/reaction?post=${post._id || post.id}`);
            
            return {
              ...post,
              comments: commentsRes.data || [],
              reactions: reactionsRes.data || []
            };
          } catch (e) {
            console.error("Error fetching details for post", post._id, e);
            return post;
          }
        }));
        channel.posts = postsWithDetails;
      }
      
      return channel;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi tải kênh thảo luận");
    }
  }
);

// 2. Đăng bài viết mới
export const createPost = createAsyncThunk(
  "channel/createPost",
  async ({ channelId, content, image }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("channel", channelId);
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const { data } = await api.post("/api/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi đăng bài");
    }
  }
);

// 3. Bình luận bài viết
export const createComment = createAsyncThunk(
  "channel/createComment",
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/api/comment", { post: postId, content });
      return { postId, comment: data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi bình luận");
    }
  }
);

// 4. Thả cảm xúc (Like)
export const toggleReaction = createAsyncThunk(
  "channel/toggleReaction",
  async ({ targetId, type = "like", targetType = "post" }, { rejectWithValue }) => {
    try {
      // Kiểm tra xem đã like chưa để quyết định add hay remove (logic này nên ở backend hoặc check state)
      // Tạm thời gọi API add reaction, nếu backend trả về lỗi "đã like" thì gọi remove (hoặc backend tự handle toggle)
      // Ở đây giả sử backend có API toggle hoặc ta gọi add/remove dựa trên state hiện tại
      
      // Cách đơn giản: Gọi API add, nếu lỗi 400 (đã tồn tại) thì gọi remove?
      // Tuy nhiên tốt nhất là backend nên hỗ trợ toggle hoặc frontend check state.
      // Giả sử ta luôn gọi addReaction, backend sẽ xử lý.
      
      const payload = { type };
      if (targetType === "post") payload.post = targetId;
      else payload.comment = targetId;

      const { data } = await api.post("/api/reaction", payload);
      return { targetId, targetType, reaction: data };
    } catch (err) {
        // Nếu lỗi duplicate, thử remove (giả lập toggle)
        // Cần logic phức tạp hơn nếu backend không hỗ trợ toggle
      return rejectWithValue(err.response?.data?.message || "Lỗi thả cảm xúc");
    }
  }
);

const channelSlice = createSlice({
  name: "channel",
  initialState: {
    currentChannel: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearChannelError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Channel
    builder
      .addCase(fetchChannelByEventId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannelByEventId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChannel = action.payload;
      })
      .addCase(fetchChannelByEventId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Post
    builder.addCase(createPost.fulfilled, (state, action) => {
      if (state.currentChannel) {
        state.currentChannel.posts.unshift(action.payload);
      }
    });

    // Create Comment
    builder.addCase(createComment.fulfilled, (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.currentChannel?.posts.find(p => p._id === postId);
      if (post) {
        if (!post.comments) post.comments = [];
        post.comments.push(comment);
      }
    });
    
    // Reaction (Optimistic update could be better)
    // ...
  },
});

export const { clearChannelError } = channelSlice.actions;
export default channelSlice.reducer;
