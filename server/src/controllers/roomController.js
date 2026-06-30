const Room = require("../models/Room");
const Problem = require("../models/Problem");

// Generate random room code
const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create Room
const createRoom = async (req, res) => {
    try {
        const { difficulty, roomType, problemId } = req.body;
        const roomId = generateRoomId();

        let assignedProblem = null;

        if (roomType === "collab" && problemId) {
            assignedProblem = problemId;
        } else {
            // Assign a random problem matching the difficulty filter
            let query = {};
            if (difficulty && difficulty !== "Random") {
                query.difficulty = { $regex: new RegExp("^" + difficulty + "$", "i") };
            }
            
            const problems = await Problem.find(query);
            if (problems.length > 0) {
                const randomIndex = Math.floor(Math.random() * problems.length);
                assignedProblem = problems[randomIndex]._id;
            }
        }

        const room = await Room.create({
            roomId,
            users: [req.user._id],
            createdBy: req.user._id,
            difficultyFilter: difficulty || "Random",
            roomType: roomType || "battle",
            currentProblem: assignedProblem
        });

        res.status(201).json(room);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Join Room
const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.body;

        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        const userExists = room.users.some(u => u.toString() === req.user._id.toString());
        if (!userExists) {
            room.users.push(req.user._id);
            await room.save();
        }

        res.status(200).json(room);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Leave Room
const leaveRoom = async (req, res) => {
    try {
        const { roomId } = req.body;

        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        room.users = room.users.filter(
            (user) => user.toString() !== req.user._id.toString()
        );

        await room.save();

        res.status(200).json({
            message: "Left room successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Room Details
const getRoom = async (req, res) => {
    try {
        let room = await Room.findOne({
            roomId: req.params.roomId
        })
        .populate("users", "name email rating")
        .populate("currentProblem");

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        // Backfill currentProblem if not set yet
        if (!room.currentProblem) {
            let query = {};
            if (room.difficultyFilter && room.difficultyFilter !== "Random") {
                query.difficulty = { $regex: new RegExp("^" + room.difficultyFilter + "$", "i") };
            }
            const problems = await Problem.find(query);
            if (problems.length > 0) {
                const randomIndex = Math.floor(Math.random() * problems.length);
                room.currentProblem = problems[randomIndex]._id;
                await room.save();
                room = await Room.findOne({ roomId: req.params.roomId })
                    .populate("users", "name email rating")
                    .populate("currentProblem");
            }
        }

        res.status(200).json(room);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRoom,
    joinRoom,
    leaveRoom,
    getRoom
};