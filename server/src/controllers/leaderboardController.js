const User = require("../models/User");

// Get Leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const users = await User.find()
            .select("name rating wins losses")
            .sort({ rating: -1 });

        res.status(200).json(users);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get Profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("battleHistory");

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Update Rating
const updateRating = async (req, res) => {
    try {
        const { winnerId, loserId, battleId } = req.body;

        const winner = await User.findById(winnerId);
        const loser = await User.findById(loserId);

        winner.rating += 25;
        winner.wins += 1;
        winner.battleHistory.push(battleId);

        loser.rating -= 15;
        loser.losses += 1;
        loser.battleHistory.push(battleId);

        await winner.save();
        await loser.save();

        res.status(200).json({
            message: "Ratings updated"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getLeaderboard,
    getProfile,
    updateRating
};