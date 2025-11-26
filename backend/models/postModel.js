/** @format */

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: { type: String },
    image: { type: String }, // URL ảnh
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" }, 
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reaction" }],

    isHidden: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
