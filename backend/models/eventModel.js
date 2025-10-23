/** @format */

import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId },
    eventTitle: { type: String, required: true },
    eventDescription: { type: String, required: true },
    eventLocation: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    quantity: { type: Number, min: 5, max: 100, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApprovalRequest",
    },
    tags: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1 && v.length <= 5,
      },
    },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
