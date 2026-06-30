const express = require("express");

const {
    getLeaderboard,
    getProfile,
    updateRating
} = require("../controllers/leaderboardController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getLeaderboard);
router.get("/profile", protect, getProfile);
router.patch("/update-rating", protect, updateRating);

module.exports = router;