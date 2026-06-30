const express = require("express");

const {
    startBattle,
    submitBattle,
    getBattleByRoom
} = require("../controllers/battleController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/start", protect, startBattle);
router.post("/submit", protect, submitBattle);
router.get("/:roomId", protect, getBattleByRoom);

module.exports = router;