import express from "express";
import mongoose from "mongoose";
import { ENV } from "./lib/env.js";
import uploadRoute from "./routes/upload.js";
import cors from "cors";
import connectToDatabase from "./db/db.js";
import authRoutes from "./routes/auth.js";
import "./utils/cron.js";

import http from "http";
import { Server } from "socket.io";
import friendRoutes from "./routes/friend.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://cipher-drop-file-share.vercel.app",
];

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

export const activeUsers = new Map();

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, []);
    }

    activeUsers.get(userId).push(socket.id);
  });

  socket.on("disconnect", () => {
    for (let [userId, sockets] of activeUsers.entries()) {
      const updated = sockets.filter((id) => id !== socket.id);

      if (updated.length === 0) {
        activeUsers.delete(userId);
      } else {
        activeUsers.set(userId, updated);
      }
    }
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDatabase();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cipher-drop-file-share.vercel.app",
    ],
    credentials: true,
  }),
);

app.use("/api", uploadRoute);
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendRoutes);

server.listen(ENV.PORT, () => {
  console.log(`Server is running on ${ENV.PORT}`);
});
