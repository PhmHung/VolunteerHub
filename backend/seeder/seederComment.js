/** @format */
import connectDB from "../config/mongodb.js";
import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import colors from "colors";

connectDB();

const seedComments = async () => {
  try {
    await Comment.deleteMany();

    const posts = await Post.find();
    const users = await User.find();

    if (!posts.length || !users.length) {
      console.log("❌ Need Posts & Users first".red);
      process.exit(1);
    }

    const commentsData = posts.map((post, index) => ({
      content: `Comment for post ${index + 1}`,
      author: users[index % users.length]._id,
      post: post._id,
    }));

    const comments = await Comment.insertMany(commentsData);

    // update comments vào post
    for (const c of comments) {
      await Post.findByIdAndUpdate(c.post, {
        $push: { comments: c._id },
      });
    }

    console.log(`✔ Comments seeded: ${comments.length}`.green);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedComments();
