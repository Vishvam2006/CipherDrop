import express from "express";
import mongoose from "mongoose";
import { ENV } from "./lib/env.js";
import uploadRoute from "./routes/upload.js";
import connectToDatabase from "./db/db.js";
import authRoutes from "./routes/auth.js"
import "./utils/cron.js"

connectToDatabase();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.use("/api", uploadRoute);
app.use("/api/auth", authRoutes);

app.listen(ENV.PORT, () => {
  console.log(`Serve is running on ${ENV.PORT}`);
});
