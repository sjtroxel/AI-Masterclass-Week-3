import "dotenv/config";
import app from "./app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT ?? "3000";
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/strawberry-star";

async function startServer(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    app.listen(Number(PORT), () => {
      console.log(`strawberry-star-server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
