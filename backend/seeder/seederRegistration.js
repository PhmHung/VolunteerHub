/** @format */
import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import registrations from "../database/registrations.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import Registration from "../models/registrationModel.js";
import connectDB from "../config/mongodb.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    const volunteers = await User.find({ role: "volunteer" }).limit(3);
    const approvedEvent = await Event.findOne({ status: "approved" });
    if (volunteers.length < 3 || !approvedEvent)
      throw new Error("Need users + approved event!");

    await Registration.deleteMany({});

    const created = [];
    for (let i = 0; i < 3; i++) {
      const reg = await Registration.create({
        userId: volunteers[i]._id,
        eventId: approvedEvent._id,
        ...registrations[i],
      });
      created.push(reg);
    }

    approvedEvent.currentParticipants = created.length;
    await approvedEvent.save();

    console.log(`Registrations imported: ${created.length}`.green.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Registration.deleteMany({});
    await Event.updateMany({}, { currentParticipants: 0 });
    console.log("Registrations destroyed!".red.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") destroyData();
else importData();
