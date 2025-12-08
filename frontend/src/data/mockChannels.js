// Mock data for Event Channels (Facebook-like wall)
import { MOCK_USER } from '../utils/mockUser';

// Initial mock channels
export const MOCK_CHANNELS = [
  {
    id: "channel-evt-1",
    eventId: "evt-1",
    createdAt: "2025-11-18T08:00:00.000Z",
    posts: [
      {
        id: "post-evt1-001",
        author: {
          id: "u-manager",
          name: "Người quản lý",
          avatar: ""
        },
        content: "Kênh thảo luận cho sự kiện Dọn rác bờ sông. Mọi người có câu hỏi gì không?",
        createdAt: "2025-11-18T08:05:00.000Z",
        likes: 0,
        comments: []
      }
    ]
  },
  {
    id: "channel-evt-001",
    eventId: "evt-001",
    createdAt: "2025-10-01T10:00:00Z",
    posts: [
      {
        id: "post-001",
        author: {
          id: "u-admin",
          name: "Ban Tổ Chức",
          avatar: "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"
        },
        content: "Chào mừng mọi người đến với kênh thảo luận của sự kiện! Hãy cùng chia sẻ ý kiến nhé.",
        createdAt: "2025-10-01T10:05:00Z",
        likes: 5,
        comments: [
          {
            id: "cmt-001",
            author: {
              id: "u-002",
              name: "Nguyễn Văn A",
              avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A"
            },
            content: "Rất mong chờ sự kiện này!",
            createdAt: "2025-10-01T10:10:00Z"
          }
        ]
      }
    ]
  }
];

// In-memory storage
let channelsData = [...MOCK_CHANNELS];

// Helper: Get channel by event ID
export const getChannelByEventId = (eventId) => {
  return channelsData.find(c => c.eventId === eventId);
};

// Helper: Create new channel
export const createChannel = (eventId) => {
  const existing = getChannelByEventId(eventId);
  if (existing) return existing;

  const newChannel = {
    id: `channel-${eventId}`,
    eventId,
    createdAt: new Date().toISOString(),
    posts: []
  };
  
  channelsData.push(newChannel);
  return newChannel;
};

// Helper: Add post to channel
export const addPostToChannel = (channelId, content, user = MOCK_USER, attachment = null) => {
  const channel = channelsData.find(c => c.id === channelId);
  if (!channel) return null;

  const newPost = {
    id: `post-${Date.now()}`,
    author: {
      id: user._id || user.id,
      name: user.userName || user.name,
      avatar: user.profilePicture || `https://ui-avatars.com/api/?name=${user.userName || 'User'}`
    },
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: [],
    status: (user.role === 'manager' || user.role === 'admin') ? 'approved' : 'pending'
  };

  if (attachment) {
    if (attachment.type === 'image') {
      newPost.image = attachment.url;
    } else if (attachment.type === 'file') {
      newPost.file = {
        name: attachment.name,
        url: attachment.url,
        size: parseFloat(attachment.size) * 1024 // Convert back to KB roughly or just store string
      };
    }
  }

  channel.posts.unshift(newPost); // Add to top
  return newPost;
};

// Helper: Add comment to post
export const addCommentToPost = (channelId, postId, content, user = MOCK_USER) => {
  const channel = channelsData.find(c => c.id === channelId);
  if (!channel) return null;

  const post = channel.posts.find(p => p.id === postId);
  if (!post) return null;

  const newComment = {
    id: `cmt-${Date.now()}`,
    author: {
      id: user._id || user.id,
      name: user.userName || user.name,
      avatar: user.profilePicture || `https://ui-avatars.com/api/?name=${user.userName || 'User'}`
    },
    content,
    createdAt: new Date().toISOString()
  };

  post.comments.push(newComment);
  return newComment;
};

// Helper: Toggle like post (Facebook style)
export const toggleLikePost = (channelId, postId, userId) => {
  const channel = channelsData.find(c => c.id === channelId);
  if (!channel) return null;

  const post = channel.posts.find(p => p.id === postId);
  if (post) {
    // Initialize likedBy array if not exists, preserve existing likes count
    if (!post.likedBy) {
      // If there are existing likes but no likedBy array, create fake users to preserve count
      post.likedBy = [];
      for (let i = 0; i < (post.likes || 0); i++) {
        post.likedBy.push(`fake-user-${i}`);
      }
    }
    
    const userIndex = post.likedBy.indexOf(userId);
    if (userIndex === -1) {
      // User hasn't liked - add like
      post.likedBy.push(userId);
      post.likes = post.likedBy.length;
      return { liked: true, likes: post.likes };
    } else {
      // User already liked - remove like
      post.likedBy.splice(userIndex, 1);
      post.likes = post.likedBy.length;
      return { liked: false, likes: post.likes };
    }
  }
  return null;
};

// Helper: Check if user liked post
export const hasUserLikedPost = (channelId, postId, userId) => {
  const channel = channelsData.find(c => c.id === channelId);
  if (!channel) return false;
  const post = channel.posts.find(p => p.id === postId);
  if (post && post.likedBy) {
    return post.likedBy.includes(userId);
  }
  return false;
};

// Helper: Approve post
export const approvePost = (channelId, postId) => {
  const channel = channelsData.find(c => c.id === channelId);
  if (!channel) return;
  const post = channel.posts.find(p => p.id === postId);
  if (post) post.status = 'approved';
};

// Helper: Reject post
export const rejectPost = (channelId, postId) => {
  const channel = channelsData.find(c => c.id === channelId);
  if (!channel) return;
  const index = channel.posts.findIndex(p => p.id === postId);
  if (index !== -1) {
      channel.posts.splice(index, 1);
  }
};

// Helper: Delete post
export const deletePost = (channelId, postId) => {
  const channel = channelsData.find(c => c.id === channelId);
  if (!channel) return;
  const index = channel.posts.findIndex(p => p.id === postId);
  if (index !== -1) {
      channel.posts.splice(index, 1);
  }
};

// Helper: Edit post
export const editPost = (channelId, postId, newContent) => {
  const channel = channelsData.find(c => c.id === channelId);
  if (!channel) return;
  const post = channel.posts.find(p => p.id === postId);
  if (post) {
      post.content = newContent;
  }
};

// Helper: Delete comment
export const deleteComment = (channelId, postId, commentId) => {
  const channel = channelsData.find(c => c.id === channelId);
  if (!channel) return;
  const post = channel.posts.find(p => p.id === postId);
  if (post) {
      const index = post.comments.findIndex(c => c.id === commentId);
      if (index !== -1) {
          post.comments.splice(index, 1);
      }
  }
};
