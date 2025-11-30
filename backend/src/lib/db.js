import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not set. Skipping DB connection.");
    return { connected: false };
  }

  const mongoOptions = {
    // Timeouts for robust connections
    serverSelectionTimeoutMS: 20000, // 20s to find a server
    socketTimeoutMS: 30000, // 30s before a socket times out

    // Connection Pooling
    maxPoolSize: 10, // Maintain up to 10 socket connections

    // Buffering
    bufferCommands: false, // Correctly disable Mongoose's buffering

    // Retry writes are enabled by default with modern drivers and SRV strings
  };

  const maxAttempts = 5;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const conn = await mongoose.connect(mongoUri, mongoOptions);
      console.log(` MongoDB connected: ${conn.connection.host}`);

      // Handle connection events after initial connection
      mongoose.connection.on("error", (err) => {
        console.error(" MongoDB connection error:", err?.message || err);
      });
      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
      });

      return { connected: true };
    } catch (error) {
      const code = error?.code || "";
      const msg = error?.message || "";
      // Common Atlas/DNS errors: ESERVFAIL, ETIMEDOUT, ENOTFOUND
      console.error(
        ` MongoDB attempt ${attempt}/${maxAttempts} failed:`,
        code,
        msg
      );

      // Backoff before retrying
      const delayMs = Math.min(5000 * attempt, 20000);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  console.warn(
    "⚠️ Could not connect to MongoDB after retries. Continuing without DB."
  );
  // Do NOT exit the process; allow app to run without DB for non-DB endpoints
  return { connected: false };
};
