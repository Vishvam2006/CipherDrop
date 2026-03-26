import express from "express";
import mongoose from "mongoose";
import { ENV } from "./lib/env.js";
import uploadRoute from "./routes/upload.js";
import cors from "cors"
import connectToDatabase from "./db/db.js";
import authRoutes from "./routes/auth.js"
import "./utils/cron.js"

connectToDatabase();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));


const allowedOrigins = [
  "http://localhost:5173",
  "https://cipher-drop-txrv.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use("/api", uploadRoute);
app.use("/api/auth", authRoutes);

app.listen(ENV.PORT, () => {
  console.log(`Serve is running on ${ENV.PORT}`);
});
