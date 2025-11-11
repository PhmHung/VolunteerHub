/** @format */
import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import attendances from "../database/attendances.js";
import Registration from "../models/registrationModel.js";
import Attendance from "../models/attendanceModel.js";
import connectDB from "../config/mongodb.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    const regs = await Registration.find().sort({ createdAt: 1 }).limit(3);
    if (regs.length < 3) throw new Error("Run registrationSeeder.js first!");

    await Attendance.deleteMany({});

    const checkIn = new Date("2025-11-15T08:05:00+07:00");
    const checkOut = new Date("2025-11-15T11:45:00+07:00");

    for (let i = 0; i < 3; i++) {
      await Attendance.create({
        regId: regs[i]._id,
        checkIn: attendances[i].status === "completed" ? checkIn : checkIn,
        checkOut: attendances[i].status === "completed" ? checkOut : null,
        status: attendances[i].status,
        feedback: attendances[i].feedback || null,
      });
    }

    console.log("Attendances imported: 3".green.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Attendance.deleteMany({});
    console.log("Attendances destroyed!".red.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") destroyData();
else importData();
