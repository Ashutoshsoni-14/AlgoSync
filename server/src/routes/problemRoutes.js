const express = require("express");

const {
    createProblem,
    getProblems,
    getProblemById
} = require("../controllers/problemController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, createProblem);
router.get("/", protect, getProblems);
router.get("/:id", protect, getProblemById);

module.exports = router;