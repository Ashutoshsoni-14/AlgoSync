const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
{
    roomId: {
        type: String,
        required: true,
        unique: true
    },

    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    isBattleActive: {
        type: Boolean,
        default: false
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    difficultyFilter: {
        type: String,
        enum: ["Easy", "Medium", "Hard", "Random"],
        default: "Random"
    },

    roomType: {
        type: String,
        enum: ["battle", "collab"],
        default: "battle"
    },

    currentProblem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem"
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Room", roomSchema);