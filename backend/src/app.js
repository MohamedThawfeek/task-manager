const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const routes = require("./routes");
const { connectMongo } = require("./config");

const app = express();
const publicPaths = new Set(["/", "/health"]);

app.use(cors());
app.use(express.json({ limit: "50kb" }));
app.use(
  fileUpload({
    abortOnLimit: true,
    limits: { fileSize: 1.5 * 1024 * 1024 },
  }),
);

// app.use(
//   "/api/auth/register-admin",
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     limit: 5,
//     standardHeaders: "draft-7",
//     legacyHeaders: false,
//   }),
// );

// Ensure Mongo connection for incoming requests (vital for Vercel Serverless cold starts)
app.use(async (req, res, next) => {
  if (publicPaths.has(req.path)) {
    return next();
  }

  try {
    await connectMongo();
    return next();
  } catch (err) {
    console.error("Database connection error on request:", err.message);
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Task Manager API is running",
    version: process.env.npm_package_version || "1.0.0",
  });
});

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/", routes);

// 404 handler
app.all("*", (req, res) => {
  res.status(404).json({
    success: false,
    resultCode: -1021,
    message: "API end point is not available.",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled request error:", err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;
