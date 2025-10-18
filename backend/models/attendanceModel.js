/** @format */

import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5, // thang điểm 1–5
  },
  comment: {
    type: String,
    trim: true,
  },
});

const attendanceSchema = new mongoose.Schema(
  {
    attId: { type: mongoose.Schema.Types.ObjectId },
    regId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ["in-progress", "completed", "absent"],
      default: "in-progress",
    },
    feedback: feedbackSchema,
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
