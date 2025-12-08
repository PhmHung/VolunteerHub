/** @format */
import connectDB from "../config/mongodb.js";
import Channel from "../models/channelModel.js";
import Event from "../models/eventModel.js";
import colors from "colors";

connectDB();

const seedChannels = async () => {
  try {
    console.log("🚀 Starting Channel Seeder...\n".cyan.bold);

    console.log("🧹 Deleting old Channels...");
    await Channel.deleteMany();
    console.log("✔ Old channels deleted".green);

    console.log("\n📌 Fetching Events...");
    const events = await Event.find();

    console.log(`➡ Found ${events.length} events`);
    if (events.length === 0) {
      console.log("❌ Need Event data first!".red);
      process.exit(1);
    }

    console.log("\n--- EVENT LIST DEBUG ---");
    events.forEach((e, i) => {
      console.log(`${i + 1}. Event ID: ${e._id.toString()}  | Name: ${e.name}`);
    });
    console.log("------------------------\n");

    // Tạo channel cho từng event
    const channels = events.map((e) => {
      console.log(
        `🛠  Creating channel for Event ${e._id.toString()} (name: ${e.name})`
      );
      return {
        event: e._id,
        posts: [],
      };
    });

    console.log("\n📥 Inserting channels into DB...");
    const created = await Channel.insertMany(channels);

    console.log(`\n✔ Channel seeded successfully: ${created.length}`.green);

    console.log("\n--- CHANNELS CREATED DEBUG ---");
    created.forEach((c, i) => {
      console.log(`${i + 1}. Channel ID: ${c._id.toString()}  | Event: ${c.event}`);
    });
    console.log("-------------------------------\n");

    // kiểm tra thật sự DB có bao nhiêu channel
    const finalCount = await Channel.countDocuments();
    console.log(`📊 FINAL CHANNEL COUNT IN DB: ${finalCount}`.yellow.bold);

    process.exit();
  } catch (error) {
    console.error("\n❌ ERROR SEEDING CHANNEL".red);
    console.error(error);
    process.exit(1);
  }
};

seedChannels();
