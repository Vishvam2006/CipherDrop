import cron from "node-cron";
import File from "../models/File.js";
import fs from "fs";
import path from "path";

cron.schedule("* * * * *", async () => {
  console.log("Running Cleaning Job...");

  try {
    const expiredFiles = await File.find({
      expiresAt: { $lt: new Date() },
    });

    for (let file of expiredFiles) {
      const filePath = path.join(process.cwd(), "uploads", file.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await file.deleteOne();

      console.log(`Deleted : ${filePath}`);
    }
  } catch (err) {
    console.log("Cleaning Error : ", err.message);
  }
});
