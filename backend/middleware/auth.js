import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import User from "../models/User.js";

export const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No Token Provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid Token Format" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    // ⚠️ IMPORTANT: match what you stored in token
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User Not Found" });
    }

    // Attach full user
    req.user = user;

    next();
  } catch (err) {
    console.log("Verification Error:", err.message);
    return res.status(401).json({ success: false, error: err.message });
  }
};

export default verifyUser;
