/** @format */

import mongoose from "mongoose";
import crypto from "crypto";

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

    qrToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

registrationSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "registered" &&
    !this.qrToken
  ) {
    this.qrToken = crypto.randomBytes(32).toString("hex");
  }
  next();
});

registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model("Registration", registrationSchema);
