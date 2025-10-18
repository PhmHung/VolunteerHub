/** @format */

import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    regId: { type: mongoose.Schema.Types.ObjectId },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    registeredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["registered", "cancelled", "waitlisted"],
      default: "registered",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Registration", registrationSchema);
