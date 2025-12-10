/** @format */

import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import users from "../database/user.js";
import User from "../models/userModel.js";
import connectDB from "../config/mongodb.js";

dotenv.config();
connectDB();
console.log("Đang kết nối DB:", process.env.MONGO_URI);
console.log("Số lượng user sẽ seed:", users.length);
const importData = async () => {
  try {
    await User.deleteMany();

    await User.insertMany(users);

    console.log("Data Imported!".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();

    console.log("Data Destroyed!".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
