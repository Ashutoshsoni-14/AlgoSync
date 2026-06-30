const Battle = require("../models/Battle");
const Room = require("../models/Room");
const User = require("../models/User");

// Start Battle
const startBattle = async (req, res) => {
    try {
        const { roomId, problemId } = req.body;

        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        const participants = room.users.map((user) => ({
            user
        }));

        const battle = await Battle.create({
            room: room._id,
            problem: problemId,
            participants
        });

        room.isBattleActive = true;
        room.currentProblem = problemId;
        await room.save();

        res.status(201).json(battle);

    } catch (error) {
        console.error("Start battle failed:", error);
        res.status(500).json({
            message: error.message
        });
    }
};

// Helper to calculate Elo rating
const calculateElo = (ratingA, ratingB, outcomeA) => {
    const K = 32;
    const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    return Math.round(ratingA + K * (outcomeA - expectedA));
};

// Submit Solution
const submitBattle = async (req, res) => {
    try {
        const { battleId } = req.body;

        const battle = await Battle.findById(battleId);

        if (!battle) {
            return res.status(404).json({
                message: "Battle not found"
            });
        }

        const participant = battle.participants.find(
            (p) => p.user.toString() === req.user._id.toString()
        );

        if (participant && !participant.solved) {
            participant.solved = true;
            participant.submittedAt = new Date();
        }

        const solvedUsers = battle.participants.filter(
            (p) => p.solved
        );

        if (solvedUsers.length === 1) {
            battle.winner = req.user._id;
            battle.status = "completed";
            battle.endTime = new Date();

            // Perform ELO update
            const winnerId = req.user._id;
            const winnerUser = await User.findById(winnerId);
            const otherParticipants = battle.participants.filter(p => p.user.toString() !== winnerId.toString());

            if (winnerUser && otherParticipants.length > 0) {
                winnerUser.wins += 1;
                winnerUser.battleHistory.push(battle._id);

                // Fetch other users
                const losers = [];
                let totalLoserRating = 0;
                for (const p of otherParticipants) {
                    const lUser = await User.findById(p.user);
                    if (lUser) {
                        losers.push(lUser);
                        totalLoserRating += lUser.rating;
                    }
                }

                if (losers.length > 0) {
                    const avgLoserRating = totalLoserRating / losers.length;
                    const oldWinnerRating = winnerUser.rating;
                    const newWinnerRating = calculateElo(oldWinnerRating, avgLoserRating, 1);
                    winnerUser.rating = newWinnerRating;
                    const winnerChange = newWinnerRating - oldWinnerRating;

                    // Save ratingChange to winner participant
                    const winPart = battle.participants.find(p => p.user.toString() === winnerId.toString());
                    if (winPart) winPart.ratingChange = winnerChange;

                    // Update each loser
                    for (const lUser of losers) {
                        const oldLoserRating = lUser.rating;
                        const newLoserRating = calculateElo(oldLoserRating, oldWinnerRating, 0);
                        lUser.rating = newLoserRating;
                        lUser.losses += 1;
                        lUser.battleHistory.push(battle._id);
                        await lUser.save();

                        const loserChange = newLoserRating - oldLoserRating;
                        const losePart = battle.participants.find(p => p.user.toString() === lUser._id.toString());
                        if (losePart) losePart.ratingChange = loserChange;
                    }
                }
                await winnerUser.save();
            }
        }

        await battle.save();

        res.status(200).json(battle);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get Battle by Room
const getBattleByRoom = async (req, res) => {
    try {
        const battle = await Battle.findOne({
            room: req.params.roomId
        })
        .populate("problem")
        .populate("winner", "name");

        if (!battle) {
            return res.status(404).json({
                message: "Battle not found"
            });
        }

        res.status(200).json(battle);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    startBattle,
    submitBattle,
    getBattleByRoom
};