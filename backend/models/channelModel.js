/** @format */

import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // 1–1
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], // 1–N
  },
  { timestamps: true }
);

export default mongoose.model("Channel", channelSchema);
