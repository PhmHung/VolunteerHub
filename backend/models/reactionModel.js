/** @format */

import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["like", "love", "haha", "wow", "sad", "angry"] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }
  },
  { timestamps: true }
);

export default mongoose.model("Reaction", reactionSchema);
