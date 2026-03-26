import express from "express";
import multer from "multer";
import File from "../models/File.js";
import verifyUser from "../middleware/auth.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), verifyUser, async (req, res) => {
  try {
    // console.log("USER:", req.user);
    // console.log("FILE:", req.file);

    // if (!req.file) {
    //   return res.status(400).json({ error: "No file uploaded" });
    // }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const file = new File({
      filename: req.file.filename,
      size: req.file.size,
      user: req.user._id,
      shareToken: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 1000), //30 sec
    });

    await file.save();

    res.json({
      message: "File uploaded Sucessfully",
      file,
      shareLink: `http://localhost:5000/api/share/${rawToken}`,
    });
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// Share aRoute
router.get("/share/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const file = await File.findOne({ shareToken: hashedToken });

    if (!file) {
      return res.status(404).json({ error: "File Not found" });
    }

    if (file.expiresAt && new Date() > file.expiresAt) {
      const filePath = path.join("uploads", file.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await file.deleteOne();
      return res.status(410).json({ error: "File Expired" });
    }

    const filePath = path.join("uploads", file.filename);

    res.download(filePath);
  } catch {
    res.status(500).json({ error: "Download Failed" });
  }
});

router.get("/my-files", verifyUser, async (req, res) => {
  try {
    const files = await File.find({ user: req.user._id });

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

    if (file.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You Don't have access" });
    }

    const filePath = path.join("uploads", file.filename);

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
