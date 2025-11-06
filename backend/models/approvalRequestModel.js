/** @format */

import mongoose from "mongoose";

const approvalRequestSchema = new mongoose.Schema(
  {
    aprId: { type: mongoose.Schema.Types.ObjectId },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    submittedAt: { type: Date },
    approvedAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ApprovalRequest", approvalRequestSchema);
