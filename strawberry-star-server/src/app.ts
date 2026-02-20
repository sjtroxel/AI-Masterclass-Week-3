import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { statusRouter } from "./routes/status.js";
import { errorHandler } from "./middleware/errorHandler.js";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:5173";

const app = express();

// --- Middleware ---
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// --- Routes ---
app.use("/health", healthRouter);
app.use("/api/status", statusRouter);

// --- Global error handler (must be last) ---
app.use(errorHandler);

export default app;
