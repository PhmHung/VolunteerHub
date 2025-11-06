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

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
