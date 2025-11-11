/** @format */

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: {
        type: String,
        maxlength: [2000, "Post cannot exceed 2000 characters"] 
    },
    image: { type: String }, // URL ảnh
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" }, 
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reaction" }],

    // Thêm cho báo cáo & xóa
    isDeleted: { type: Boolean, default: false }, // đánh dấu đã xóa
    deletedAt: { type: Date }, // thời điểm xóa
    reason: {
        type: String,
        required: [true, "Reason is required"],
        maxlength: [300, "Reason cannot exceed 300 characters"]
    },
    reportStatus: {
        type: String,
        enum: ["pending", "reviewed", "resolved"],
        default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
