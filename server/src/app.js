const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const problemRoutes = require("./routes/problemRoutes");
const battleRoutes = require("./routes/battleRoutes");
const codeRoutes = require("./routes/codeRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    res.send("AlgoSync Backend Running...");
});

// Auth Routes
app.use("/api/auth", authRoutes);
// Room Routes
app.use("/api/rooms", roomRoutes);
// Problem Routes
app.use("/api/problems", problemRoutes);
// Battle Routes
app.use("/api/battles", battleRoutes);
// code routes
app.use("/api/code" , codeRoutes);
// leaderboard routes
app.use("/api/leaderboard", leaderboardRoutes);

module.exports = app;