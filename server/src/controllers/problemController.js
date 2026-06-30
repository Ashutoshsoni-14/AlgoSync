const Problem = require("../models/Problem");

// Create Problem
const createProblem = async (req, res) => {
    try {
        const problem = await Problem.create(req.body);

        res.status(201).json(problem);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get All Problems
const getProblems = async (req, res) => {
    try {
        const problems = await Problem.find();

        res.status(200).json(problems);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get Single Problem
const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({
                message: "Problem not found"
            });
        }

        res.status(200).json(problem);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createProblem,
    getProblems,
    getProblemById
};