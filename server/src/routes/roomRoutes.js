const express = require("express");
const {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom
} = require("../controllers/roomController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoom);
router.post("/leave", protect, leaveRoom);
router.get("/:roomId", protect, getRoom);

module.exports = router;