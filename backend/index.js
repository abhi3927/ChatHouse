// Must be the first import so process.env is filled before any other module runs.
import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import userRoute from "./routes/userRoute.js";
import messageRoute from "./routes/messageRoute.js";
import { initSocket } from "./socket/socket.js";

// Validate required environment variables at startup.
const REQUIRED_ENV = ["PORT", "MONGO_URI", "JWT_SECRET_KEY", "FRONTEND_URL"];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(", ")}. ` +
      "Copy .env.example to .env and fill it in."
  );
  process.exit(1);
}
if (
  process.env.NODE_ENV === "production" &&
  process.env.JWT_SECRET_KEY === "change_me"
) {
  console.error("JWT_SECRET_KEY must be changed before running in production.");
  process.exit(1);
}

const PORT = process.env.PORT;

// FRONTEND_URL may be a comma-separated list of allowed origins.
const allowedOrigins = process.env.FRONTEND_URL.split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Catches anything not handled in controllers (e.g. malformed JSON bodies).
// The 4 arguments are required for Express to treat it as an error handler.
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error("Unhandled error:", err.message);
  res.status(status).json({
    message: status >= 500 ? "Internal server error" : err.message,
  });
});

initSocket(server, allowedOrigins);

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(
      `Could not start the server: ${error.message}\n` +
        "Is MongoDB running locally and is MONGO_URI correct?"
    );
    process.exit(1);
  }
};

start();
