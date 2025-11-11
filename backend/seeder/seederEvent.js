/** @format */
import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import events from "../database/events.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import ApprovalRequest from "../models/approvalRequestModel.js";
import connectDB from "../config/mongodb.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    const manager = await User.findOne({ role: "manager" });
    const admin = await User.findOne({ role: "admin" });
    if (!manager) throw new Error("Manager not found! Run userSeeder.js first");

    await Event.deleteMany({});
    await ApprovalRequest.deleteMany({});

    const createdEvents = [];
    for (const e of events) {
      const event = await Event.create({
        ...e,
        createdBy: manager._id,
      });

      const approval = await ApprovalRequest.create({
        event: event._id,
        requestedBy: manager._id,
        status: e.status,
        reviewedBy: e.status === "approved" ? admin?._id : null,
        reviewedAt: e.status === "approved" ? new Date() : null,
        adminNote: e.status === "approved" ? "Duyệt tự động" : null,
      });

      event.approvalRequest = approval._id;
      await event.save();
      createdEvents.push(event);
    }

    console.log(
      `Events + ApprovalRequests imported: ${createdEvents.length}`.green
        .inverse
    );
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Event.deleteMany({});
    await ApprovalRequest.deleteMany({});
    console.log("Events & ApprovalRequests destroyed!".red.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") destroyData();
else importData();
