import PushSubscription from "../models/pushSubscriptionModel.js";
import webpush from "web-push";

export const saveSubscription = async (req, res) => {
  try {
    const { subscription, token } = req.body;
    const userId = req.user?._id; // nếu bạn có hệ thống auth

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription" });
    }

    // nếu cùng endpoint thì không tạo mới
    let existing = await PushSubscription.findOne({
      endpoint: subscription.endpoint,
    });

    if (existing) {
      return res.json({ message: "Subscription already exists" });
    }

    // tạo mới
    const newSub = await PushSubscription.create({
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: req.headers["user-agent"],
    });

    res.json({ message: "Subscription saved", data: newSub });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    const { endpoint } = req.body;

    await PushSubscription.findOneAndDelete({ endpoint });

    res.json({ message: "Subscription removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const subs = await PushSubscription.find({ userId });

    if (!subs || subs.length === 0) {
      return res.status(404).json({ message: "User has no subscriptions" });
    }

    const payload = JSON.stringify({ title, body });

    let successCount = 0;
    let failedCount = 0;

    for (const sub of subs) {
      const pushObject = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      };

      try {
        await webpush.sendNotification(pushObject, payload);
        successCount++;
      } catch (err) {
        failedCount++;

        console.error("PUSH ERROR");
        console.error("User:", userId);
        console.error("Endpoint:", sub.endpoint);

        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log("→ Subscription expired. Removing from DB...");
          await PushSubscription.deleteOne({ _id: sub._id });
        }

        console.error("Error detail:", err);
      }
    }

    res.json({
      message: "Done sending notifications",
      total: subs.length,
      success: successCount,
      failed: failedCount,
    });

  } catch (error) {
    console.error("Unexpected Error:", error);
    res.status(500).json({ message: error.message });
  }
};


