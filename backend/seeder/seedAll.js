/** @format */

import { execSync } from "child_process";
import colors from "colors";
import dotenv from "dotenv";
import connectDB from "../config/mongodb.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import Registration from "../models/registrationModel.js";
import Attendance from "../models/attendanceModel.js";
import Channel from "../models/channelModel.js";
import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import Reaction from "../models/reactionModel.js";


dotenv.config();
connectDB();

await User.deleteMany();
await Event.deleteMany();
await Registration.deleteMany();
await Attendance.deleteMany();
await Channel.deleteMany();
await Post.deleteMany();
await Comment.deleteMany();
await Reaction.deleteMany();


// Hàm chạy seeder nếu collection rỗng
const runSeederIfEmpty = async (scriptName, Model, collectionName) => {
  try {
    const count = await Model.countDocuments();
    if (count === 0) {
      console.log(`\nSeeding ${collectionName}...`.cyan.bold);
      execSync(`npm run seed:${scriptName}`, { stdio: "inherit" });
      console.log(`${collectionName} seeded successfully!`.green);
    } else {
      console.log(
        `${collectionName} already has ${count} record(s) → SKIPPED`.yellow
      );
    }
  } catch (err) {
    console.error(`Error seeding ${collectionName}:`.red, err.message);
    throw err;
  }
};

(async () => {
  console.log("\nSTARTING FULL SEEDING PROCESS".bgBlue.white.bold);
  console.log(
    `Time: ${new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    })}`.gray
  );
  console.log(`Country: VN`.gray);

  try {
    // 1. User (luôn chạy nếu chưa có)
    await runSeederIfEmpty("user", User, "Users");

    // 2. Event + ApprovalRequest
    await runSeederIfEmpty("event", Event, "Events + ApprovalRequests");

    // 3. Registration
    await runSeederIfEmpty("registration", Registration, "Registrations");

    // 4. Attendance + Feedback
    await runSeederIfEmpty("attendance", Attendance, "Attendances");

    await runSeederIfEmpty("channel", Channel, "Channels");

    await runSeederIfEmpty("post", Post, "Posts");

    await runSeederIfEmpty("comment", Comment, "Comments");

    await runSeederIfEmpty("reaction", Reaction, "Reactions");


    console.log("\nALL DATA SEEDED SUCCESSFULLY!".bgGreen.black.bold);
    console.log("You can now test APIs, frontend, or reports.\n".gray);
    process.exit(0);
  } catch (error) {
    console.error("\nSEEDING FAILED!".bgRed.white.bold);
    console.error("Fix the error and run again.\n".gray);
    process.exit(1);
  }
})();
