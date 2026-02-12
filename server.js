// ============================================
// Recruiter Mail Automation — Main Server
// ============================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

// Import routes
const emailRoutes = require("./routes/email");
const multiRoutes = require("./routes/multi");

// Create app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Rate limiter: max 10 requests per 15 min per IP
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please wait 15 minutes before trying again.",
  },
});

app.use("/api/send", emailLimiter);
app.use("/api/multi-send", emailLimiter);

// Routes
app.use("/api", emailRoutes);
app.use("/api", multiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server (only when running locally, not on Vercel)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log("");
    console.log("Recruiter Mail Automation is running!");
    console.log("Local:  http://localhost:" + PORT);
    console.log("Press Ctrl+C to stop.");
    console.log("");
  });
}

// Export for Vercel serverless
module.exports = app;
