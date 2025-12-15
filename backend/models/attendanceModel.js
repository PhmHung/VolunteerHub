/** @format */

import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      required: [true, "Rating is required"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [300, "Comment cannot exceed 300 characters"],
      select: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
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
    feedback: {
      type: feedbackSchema,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

attendanceSchema.index({ regId: 1 }, { unique: true });
attendanceSchema.index({ "feedback.rating": 1 });
attendanceSchema.index({ status: 1, checkOut: -1 });
attendanceSchema.virtual("totalHours").get(function () {
  if (this.checkIn && this.checkOut) {
    const diff = this.checkOut - this.checkIn;
    const hours = diff / (1000 * 60 * 60);
    return parseFloat(hours.toFixed(1));
  }
  return 0;
});
export default mongoose.model("Attendance", attendanceSchema);
