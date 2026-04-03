import express from "express";
import verifyUser from "../middleware/auth.js";
import User from "../models/User.js";
import { activeUsers } from "../app.js";
import Friend from "../models/Friend.js";

const router = express.Router();

router.post("/post", verifyUser, async (req, res) => {
  try {
    const { email } = req.body;
    const recipient = await User.findOne({ email });

    if (!recipient) {
      return res.status(404).json({ error: "User not found" });
    }

    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot add yourself" });
    }

    const existing = await Friend.findOne({
      $or: [
        { requestor: req.user._id, recipient: recipient._id },
        { requestor: recipient._id, recipient: req.user._id },
      ],
    });

    if (existing) {
      return res.status(400).json({ error: "Request already exists" });
    }

    const friend = await Friend.create({
      requestor: req.user._id,
      recipient: recipient._id,
    });

    res.json({ message: "Request sent", friend });
  } catch (err) {
    res.status(500).json({ error: "Failed to send request" });
  }
});

router.post("/accept/:id", verifyUser, async (req, res) => {
  try {
    const request = await Friend.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    request.status = "approved";
    await request.save();

    res.json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to accept request" });
  }
});

router.get("/requests", verifyUser, async (req, res) => {
  try {
    const requests = await Friend.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("requestor", "email");

    res.json({ requests });
  } catch {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

router.get("/", verifyUser, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { requestor: req.user._id },
        { recipient: req.user._id },
      ],
      status: "approved",
    }).populate("requestor recipient", "email");

    const formatted = friends.map((f) => {
      return f.requestor._id.toString() === req.user._id.toString()
        ? f.recipient
        : f.requestor;
    });

    res.json({ friends: formatted });
  } catch {
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

router.get("/active", verifyUser, async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { requestor: req.user._id },
        { recipient: req.user._id },
      ],
      status: "approved",
    });

    const active = friends
      .map((f) =>
        f.requestor.toString() === req.user._id.toString()
          ? f.recipient.toString()
          : f.requestor.toString()
      )
      .filter((id) => activeUsers.has(id));

    res.json({ activeFriends: active });
  } catch {
    res.status(500).json({ error: "Failed to fetch active friends" });
  }
});

export default router;
