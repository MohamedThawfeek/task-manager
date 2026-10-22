const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const routes = require("./routes");
const { connectMongo } = require("./config");

const PORT = process.env.PORT || 5001;
const app = express();

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
  if (req.path === "/health") {
    return next();
  }
  try {
    await connectMongo();
    next();
  } catch (err) {
    console.error("Database connection error on request:", err.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// Root endpoint
app.get("/", async (req, res) => {
  try {
    res.json({
      message: "Welcome to the SanasInvite backend API",
      version: process.env.npm_package_version,
    });
  } catch (error) {
    console.error("Failed to retrieve deployment data:", error);
    res.status(500).json({
      success: false,
      resultCode: -1,
      message: "Internal server error",
    });
  }
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

module.exports = app;

