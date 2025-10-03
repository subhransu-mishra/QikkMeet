import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoute.js";
import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoute.js";

const app = express();
app.use(cors());
app.use(cookieParser());
const PORT = process.env.PORT || 5001;

dotenv.config();
// app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Home Route");
});

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
