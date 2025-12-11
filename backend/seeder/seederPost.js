/** @format */
import connectDB from "../config/mongodb.js";
import Post from "../models/postModel.js";
import Channel from "../models/channelModel.js";
import User from "../models/userModel.js";
import colors from "colors";

connectDB();

const seedPosts = async () => {
  try {
    await Post.deleteMany();

    const users = await User.find();
    const channels = await Channel.find();

    if (!users.length || !channels.length) {
      console.log("❌ Need Users & Channels first".red);
      process.exit(1);
    }

    const sample = channels.map((ch, index) => ({
      content: `Demo post #${index + 1}`,
      author: users[index % users.length]._id, //???
      channel: ch._id,
      comments: [],
      reactions: [],
    }));

    const posts = await Post.insertMany(sample);

    // Update vào Channel
    for (const p of posts) {
      await Channel.findByIdAndUpdate(p.channel, {
        $push: { posts: p._id },
      });
    }

    console.log(`✔ Posts seeded: ${posts.length}`.green);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedPosts();
