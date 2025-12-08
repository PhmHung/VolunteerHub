/** @format */
import connectDB from "../config/mongodb.js";
import Reaction from "../models/reactionModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import colors from "colors";

connectDB();

const seedReactions = async () => {
  try {
    await Reaction.deleteMany();

    const posts = await Post.find();
    const users = await User.find();

    if (!posts.length || !users.length) {
      console.log("❌ Need Posts & Users first".red);
      process.exit(1);
    }

    const reactionTypes = ["like", "love", "haha", "wow", "sad", "angry"];

    const data = posts.map((post, index) => ({
      type: reactionTypes[index % reactionTypes.length],
      user: users[index % users.length]._id,
      post: post._id,
    }));

    const reactions = await Reaction.insertMany(data);

    // update vào Post
    for (const r of reactions) {
      await Post.findByIdAndUpdate(r.post, {
        $push: { reactions: r._id },
      });
    }

    console.log(`✔ Reactions seeded: ${reactions.length}`.green);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedReactions();
