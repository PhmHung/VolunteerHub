/** @format */
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Chỉ 1 trong 2 sẽ tồn tại
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },

    reason: { type: String, required: true },
    detail: { type: String },

    // Gửi đến channel xử lý báo cáo
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },

    status: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending",
    },

    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Manager xử lý
    action: {
      type: String,
      enum: ["removed", "kept", null],
      default: null,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
