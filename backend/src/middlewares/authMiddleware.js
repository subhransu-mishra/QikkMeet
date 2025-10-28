import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Auth middleware error:", error);

    // Check if error is JWT related
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired, please login again" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Check if it's a MongoDB connection error
    if (
      error.name === "MongoServerSelectionError" ||
      error.name === "MongoNetworkError"
    ) {
      return res
        .status(503)
        .json({
          message:
            "Database connection failed. Please check your MongoDB connection.",
        });
    }

    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
