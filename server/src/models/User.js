const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    rating: {
        type: Number,
        default: 1200
    },
    
    wins: {
    type: Number,
    default: 0
},

losses: {
    type: Number,
    default: 0
},

battleHistory: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Battle"
    }
]
},
{
    timestamps: true
}

);

module.exports = mongoose.model("User", userSchema);