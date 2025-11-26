/** @format */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./models/userModel.js";
import Event from "./models/eventModel.js";
import Channel from "./models/channelModel.js";
import connectDB from "./config/mongodb.js";

const seed = async () => {
  try {
    await connectDB();

    console.log("🔥 Connected to MongoDB");

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Event.deleteMany({});
    await Channel.deleteMany({});

    console.log("🧹 Cleared old data");

    // ===========================
    // 1️⃣ Tạo USERS
    // ===========================
    const [vol1, vol2, manager] = await User.insertMany([
      {
        userName: "Volunteer One",
        userEmail: "vol1@example.com",
        password: "123456",
        role: "volunteer",
        phoneNumber: "0912345678",
      },
      {
        userName: "Volunteer Two",
        userEmail: "vol2@example.com",
        password: "123456",
        role: "volunteer",
        phoneNumber: "0987654321",
      },
      {
        userName: "Manager User",
        userEmail: "manager@example.com",
        password: "123456",
        role: "manager",
        phoneNumber: "0901112233",
      },
      {
        userName: "Admin User",
        userEmail: "admin@example.com",
        password: "123456",
        role: "admin",
        phoneNumber: "0901119233",
      },
      {
        userName: "Volunteer Three",
        userEmail: "vol3@example.com",
        password: "123456",
        role: "volunteer",
        phoneNumber: "0987654301",
      },
    ]);

    console.log("👥 Users created");

    // ===========================
    // 2️⃣ Tạo EVENT với volunteers + managers
    // ===========================
    const event = await Event.create({
      title: "Beach Cleanup Campaign",
      description: "A volunteer event to clean the beach area.",
      location: "Da Nang Beach",
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-01-15"),
      maxParticipants: 50,
      currentParticipants: 2,
      createdBy: manager._id,
      status: "approved",
      tags: ["environment", "community"],

      // 🔥 thêm volunteer & manager vào event
      volunteers: [vol1._id, vol2._id],
      managers: [manager._id],
    });

    console.log("📅 Event created:", event.title);

    // ===========================
    // 3️⃣ Tạo CHANNEL liên kết event
    // ===========================
    const channel = await Channel.create({
      event: event._id,
      posts: [],
    });

    event.channel = channel._id;
    await event.save();

    console.log("🔗 Event linked to channel");

    console.log("✅ DONE — Seed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seed();
