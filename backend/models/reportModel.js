/** @format */

import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ai báo cáo
    targetType: { 
        type: String, 
        enum: ["Post", "Comment"], 
        required: true 
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // id của post hoặc comment bị báo
    reason: {
        type: String,
        required: [true, "Reason is required"],
        maxlength: [300, "Reason cannot exceed 300 characters"]
    },
    status: { 
        type: String, 
        enum: ["pending", "reviewed", "resolved", "rejected"], 
        default: "pending" 
    },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true }, // thuộc event nào
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // user xử lý (chính là createdBy của event)
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
