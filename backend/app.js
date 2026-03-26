import express from "express";
import mongoose from "mongoose";
import { ENV } from "./lib/env.js";
import uploadRoute from "./routes/upload.js";
import cors from "cors";
import connectToDatabase from "./db/db.js";
import authRoutes from "./routes/auth.js";
import "./utils/cron.js";
import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
  "https://cipher-drop-file-share.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDatabase();

app.use("/api", uploadRoute);
app.use("/api/auth", authRoutes);

app.listen(ENV.PORT, () => {
  console.log(`Serve is running on ${ENV.PORT}`);
});
