import express from "express";
import multer from "multer";
import File from "../models/File.js";
import verifyUser from "../middleware/auth.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { ENV } from "../lib/env.js";

import { io, activeUsers } from "../app.js";
import Friend from "../models/Friend.js";

const router = express.Router();
const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

const isFriend = async (userA, userB) => {
  const friendship = await Friend.findOne({
    $or: [
      { requestor: userA, recipient: userB },
      { requestor: userB, recipient: userA },
    ],
    status: "approved",
  });

  return !!friendship;
};

router.post("/upload", upload.single("file"), verifyUser, async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver required" });
    }

    const allowed = await isFriend(req.user._id, receiverId);

    if (!allowed) {
      return res.status(403).json({ error: "You are not friends" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const file = new File({
      filename: req.file.filename,
      filePath: req.file.path,
      size: req.file.size,
      sender: req.user._id,
      receiver: receiverId,
      shareToken: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 1000), // 60 sec
    });

    await file.save();

    const shareLink = `${ENV.BASE_URL}/api/share/${rawToken}`;

    const receiverSockets = activeUsers.get(receiverId);

    if (receiverSockets && receiverSockets.length > 0) {
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("file-incoming", {
          from: req.user._id,
          link: shareLink,
          filename: req.file.filename,
        });
      });
    }

    res.json({
      message: "File sent to receiver",
      shareLink: shareLink, // 👈 keep old frontend working
      downloadLink: shareLink, // 👈 future-safe
      note: "Receiver-only link (valid 60 seconds)",
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// Share Route
router.get("/share/:token", verifyUser, async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const file = await File.findOne({ shareToken: hashedToken });

    if (!file) {
      return res.status(404).json({ error: "File Not found" });
    }

    if (file.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    if (new Date() > file.expiresAt) {
      const filePath = path.join(uploadDir, file.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await file.deleteOne();

      return res.status(410).json({ error: "File Expired" });
    }

    const filePath = path.join(uploadDir, file.filename);

    res.download(filePath);
  } catch {
    res.status(500).json({ error: "Download Failed" });
  }
});

router.get("/my-files", verifyUser, async (req, res) => {
  try {
    const files = await File.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    });

    res.json({
      count: files.length,
      files,
    });
  } catch (err) {
    res.status(500).json({ error: "Error in fetch files" });
  }
});

router.delete("/file/:id", verifyUser, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ error: "File Not Found" });
    }

    if (file.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const filePath = path.join(uploadDir, file.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await file.deleteOne();

    res.status(200).json({ message: "File Deleted Successful" });
  } catch (err) {
    res.status(500).json({ error: "Error in deleting files" });
  }
});

export default router;
