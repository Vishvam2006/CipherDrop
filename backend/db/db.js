import mongoose from "mongoose";
import { ENV } from "../lib/env.js";

const connectToDatabase = async () => {
  try {
    await mongoose
      .connect(ENV.MONGO_URL)
      .then(() => {
        console.log("MongoDB Connected");
      })
      .catch((err) => console.log(err));
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    if (error.message.includes("bad auth")) {
      console.error(
        "⚠️  Please check your MONGODB_URL in the .env file. Your Atlas credentials might be incorrect.",
      );
    }
  }
};

export default connectToDatabase;
