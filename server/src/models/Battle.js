const mongoose = require("mongoose");

const battleSchema = new mongoose.Schema(
{
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },

    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },

    participants: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            solved: {
                type: Boolean,
                default: false
            },
            submittedAt: {
                type: Date
            },
            ratingChange: {
                type: Number,
                default: 0
            }
        }
    ],

    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    startTime: {
        type: Date,
        default: Date.now
    },

    endTime: {
        type: Date
    },

    status: {
        type: String,
        enum: ["active", "completed"],
        default: "active"
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Battle", battleSchema);