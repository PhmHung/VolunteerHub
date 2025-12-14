/** @format */

import mongoose from "mongoose";

const approvalRequestSchema = new mongoose.Schema(
  {
    // 1. TRƯỜNG LOẠI YÊU CẦU (BẮT BUỘC)
    type: {
      type: String,
      enum: ["event_approval", "manager_promotion", "event_cancellation"],
      required: true,
      default: "event_approval",
    },

    // 2. TRƯỜNG EVENT (CHỈ BẮT BUỘC NẾU LÀ DUYỆT SỰ KIỆN)
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: function () {
        return this.type === "event_approval";
      },
    },
    reason: {
      type: String,
      required: function () {
        return this.type === "event_cancellation";
      },
    },
    promotionData: {
      eventsCompleted: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalAttendanceHours: { type: Number, default: 0 },
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("ApprovalRequest", approvalRequestSchema);
