/** @format */

import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxParticipants: { type: Number, min: 5, max: 100, required: true },
    currentParticipants: { type: Number, default: 0 },

    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" }, // 1–1
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvalRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApprovalRequest",
    },
    tags: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1 && v.length <= 5,
        message: "Tags must be 1-5 items",
      },
    },
    image: { type: String }, // URL ảnh
  },
  { timestamps: true }
);

// Virtual: kiểm tra đã đủ người chưa
eventSchema.virtual("isFull").get(function () {
  return this.currentParticipants >= this.maxParticipants;
});

export default mongoose.model("Event", eventSchema);
