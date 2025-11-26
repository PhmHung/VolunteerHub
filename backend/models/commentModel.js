/** @format */

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: { type: String },
    image: { type: String }, // URL ảnh
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    //Chỉ 1 trong 2 sẽ tồn tại
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },

    isHidden: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
