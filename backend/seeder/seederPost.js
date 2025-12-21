/** @format */
import connectDB from "../config/mongodb.js";
import colors from "colors";
import Event from "../models/eventModel.js";
import Channel from "../models/channelModel.js";
import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import Reaction from "../models/reactionModel.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
import User from "../models/userModel.js";

connectDB();

/* =========================
   DATA CONTENT GENERATORS
========================= */

const imageSamples = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1500534314209-a26db0f5b2a3",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
  "https://images.unsplash.com/photo-1506784983877-45594efa4cbe",
];

const postTemplates = (event) => [
  `Mọi người cho mình hỏi tên "${event.title}" có ý nghĩa gì đặc biệt không?`,
  `Lần đầu mình tham gia "${event.title}", mọi người có kinh nghiệm gì chia sẻ không?`,
  `Địa điểm ${event.location} có dễ tìm không ạ?`,
  `Thời gian diễn ra sự kiện có cần đến sớm không mọi người?`,
  `Ai đã từng tham gia các hoạt động tương tự như "${event.title}" chưa?`,
];

const commentReplies = [
  "Mình thấy tên sự kiện mang ý nghĩa cộng đồng rất rõ.",
  "Địa điểm này mình từng đi rồi, khá dễ tìm nhé.",
  "Mình nghĩ nên đến sớm khoảng 15–20 phút.",
  "Hoạt động khá vui, nhưng nhớ mang nước uống.",
  "Thời tiết khu vực này buổi sáng khá mát.",
];

const reactionTypes = ["like"];

/* =========================
   HELPER
========================= */
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/* =========================
   MAIN SEEDER
========================= */
const seedPostsCommentsReactions = async () => {
  try {
    console.log("🚀 Seeding Posts, Comments & Reactions...\n".cyan.bold);

    console.log("🧹 Clearing old data...");
    await Reaction.deleteMany();
    await Comment.deleteMany();
    await Post.deleteMany();
    console.log("✔ Old data cleared\n".green);

    const events = await Event.find().populate("volunteers managers");
    const channels = await Channel.find();

    for (const event of events) {
      const channel = channels.find(
        (c) => c.event.toString() === event._id.toString()
      );
      if (!channel) continue;

      const users = [...event.volunteers, ...event.managers];
      if (users.length === 0) continue;

      console.log(
        `📌 Event: ${event.title} | Users: ${users.length}`.yellow
      );

      const postCount = randomInt(3, 6);

      for (let i = 0; i < postCount; i++) {
        const author = randomItem(users);

        const post = await Post.create({
          content: randomItem(postTemplates(event)),
          image: Math.random() > 0.5 ? randomItem(imageSamples) : null,
          author: author._id,
          channel: channel._id,
        });

        channel.posts.push(post._id);

        /* ===== COMMENTS ===== */
        const commentCount = randomInt(2, 5);
        const createdComments = [];

        for (let j = 0; j < commentCount; j++) {
          const commenter = randomItem(users);

          const comment = await Comment.create({
            content: randomItem(commentReplies),
            author: commenter._id,
            post: post._id,
          });

          createdComments.push(comment);

          /* ===== REPLY ===== */
          if (Math.random() > 0.5) {
            await Comment.create({
              content: randomItem(commentReplies),
              author: randomItem(users)._id,
              parentComment: comment._id,
            });
          }
        }

        /* ===== REACTIONS FOR POST ===== */
        const postReactionCount = randomInt(1, users.length);
        const reactedUsers = new Set();

        for (let r = 0; r < postReactionCount; r++) {
          const u = randomItem(users);
          if (reactedUsers.has(u._id.toString())) continue;
          reactedUsers.add(u._id.toString());

          await Reaction.create({
            type: randomItem(reactionTypes),
            user: u._id,
            post: post._id,
          });
        }

        /* ===== REACTIONS FOR COMMENTS ===== */
        for (const c of createdComments) {
          if (Math.random() > 0.6) {
            await Reaction.create({
              type: randomItem(reactionTypes),
              user: randomItem(users)._id,
              comment: c._id,
            });
          }
        }
      }

      await channel.save();
    }

    console.log("\n✅ Seeder completed successfully!".green.bold);
    process.exit();
  } catch (err) {
    console.error("\n❌ Seeder failed".red.bold);
    console.error(err);
    process.exit(1);
  }
};

seedPostsCommentsReactions();
