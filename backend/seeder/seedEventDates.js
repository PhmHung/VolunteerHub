/** @format */

import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/eventModel.js";
import connectDB from "../config/mongodb.js";

dotenv.config();
connectDB();

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const seedEventDates = async () => {
  try {
    const events = await Event.find();
    const now = new Date();

    let updated = 0;

    for (const event of events) {
      const caseType = randomPick([
        "past",     // endDate < now
        "ongoing",  // startDate < now < endDate
        "future",   // now < startDate
      ]);

      let startDate;
      let endDate;

      if (caseType === "past") {
        // Kết thúc trước hiện tại 1–10 ngày
        endDate = new Date(
          now.getTime() - randomInt(1, 10) * 24 * 60 * 60 * 1000
        );
        startDate = new Date(
          endDate.getTime() - randomInt(1, 3) * 24 * 60 * 60 * 1000
        );
      }

      if (caseType === "ongoing") {
        // Bắt đầu trước 1–3 ngày, kết thúc sau 1–3 ngày
        startDate = new Date(
          now.getTime() - randomInt(1, 3) * 24 * 60 * 60 * 1000
        );
        endDate = new Date(
          now.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000
        );
      }

      if (caseType === "future") {
        // Bắt đầu sau 1–10 ngày
        startDate = new Date(
          now.getTime() + randomInt(1, 10) * 24 * 60 * 60 * 1000
        );
        endDate = new Date(
          startDate.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000
        );
      }

      event.startDate = startDate;
      event.endDate = endDate;
      await event.save();

      updated++;
      console.log(
        `✔ Event "${event.title}" → ${caseType}`,
        startDate.toISOString(),
        "→",
        endDate.toISOString()
      );
    }

    console.log("====== DONE ======");
    console.log("Events updated:", updated);
    process.exit();
  } catch (error) {
    console.error("Seeder error:", error);
    process.exit(1);
  }
};

seedEventDates();
