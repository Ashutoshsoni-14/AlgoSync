const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true
    },

    statement: {
        type: String,
        required: true
    },

    functionName: {
        type: String,
        required: true
    },

    starterCode: {
        cpp: { type: String, default: "" },
        java: { type: String, default: "" },
        python: { type: String, default: "" },
        javascript: { type: String, default: "" }
    },

    wrappers: {
        cpp: { type: String, default: "" },
        java: { type: String, default: "" },
        python: { type: String, default: "" },
        javascript: { type: String, default: "" }
    },

    hiddenTestCases: [
        {
            input: String,
            output: String
        }
    ],

    visibleExamples: [
        {
            input: String,
            output: String,
            explanation: String
        }
    ],

    constraints: {
        type: String,
        default: ""
    },

    tags: [
        {
            type: String
        }
    ]
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Problem", problemSchema);