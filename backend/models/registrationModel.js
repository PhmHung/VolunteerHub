/** @format */

import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
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
      default: "waitlisted",
    },
  },
  { timestamps: true }
);
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
export default mongoose.model("Registration", registrationSchema);
