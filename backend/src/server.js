import express from 'express';
import cors from 'cors';
const app = express();
import dotenv from 'dotenv';
import authRoutes from './routes/authRoute.js';
import { connectDB } from './lib/db.js';
app.use(cors());
const PORT = process.env.PORT || 5001;

dotenv.config();
// app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});