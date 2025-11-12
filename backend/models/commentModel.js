/** @format */

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
        type: String,
        maxlength: [2000, "Comment cannot exceed 2000 characters"]
    },
    image: { type: String }, // URL ảnh
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
