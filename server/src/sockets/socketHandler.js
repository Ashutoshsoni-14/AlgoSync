const roomSpectators = {};

const getSpectatorCount = (roomId) => {
    return roomSpectators[roomId] ? roomSpectators[roomId].length : 0;
};

const getSpectatorList = (roomId) => {
    return roomSpectators[roomId] || [];
};

const socketHandler = (io) => {

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Join Room
        socket.on("join-room", ({ roomId, isSpectator, user }) => {
            socket.join(roomId);
            socket.roomId = roomId;
            socket.isSpectator = isSpectator;
            socket.user = user;

            console.log(`${socket.id} joined room ${roomId} (Spectator: ${!!isSpectator})`);

            if (isSpectator) {
                if (!roomSpectators[roomId]) {
                    roomSpectators[roomId] = [];
                }
                if (!roomSpectators[roomId].some(s => s.socketId === socket.id)) {
                    roomSpectators[roomId].push({
                        socketId: socket.id,
                        name: user?.name || "Spectator",
                        email: user?.email || "",
                        rating: user?.rating || 1200
                    });
                }

                io.to(roomId).emit("spectators-sync", {
                    count: getSpectatorCount(roomId),
                    list: getSpectatorList(roomId)
                });
            } else {
                socket.to(roomId).emit("user-joined", {
                    socketId: socket.id,
                    user
                });
            }

            // Always sync spectators list to the socket
            socket.emit("spectators-sync", {
                count: getSpectatorCount(roomId),
                list: getSpectatorList(roomId)
            });
        });

        // Code Change
        socket.on("code-change", ({ roomId, code }) => {
            socket.to(roomId).emit("sync-code", {
                code
            });
        });

        // Battle Started
        socket.on("battle-start", ({ roomId, problem, battleId, timer }) => {
            socket.to(roomId).emit("battle-start-sync", {
                problem,
                battleId,
                timer
            });
        });

        // Battle Ended / Winner Declared (with ELO rating changes)
        socket.on("battle-end", ({ roomId, winner, ratingChanges }) => {
            io.to(roomId).emit("battle-end-sync", {
                winner,
                ratingChanges
            });
        });

        // Next Round Triggered
        socket.on("next-round", ({ roomId, problem, timer }) => {
            socket.to(roomId).emit("next-round-sync", {
                problem,
                timer
            });
        });

        // Live Chat Message
        socket.on("send-message", ({ roomId, message }) => {
            io.to(roomId).emit("receive-message", message);
        });

        // Live code execution status (for Spectators)
        socket.on("submission-status", ({ roomId, user, status }) => {
            socket.to(roomId).emit("submission-status-sync", {
                userId: user?._id,
                status
            });
        });

        // Helper to leave room
        const handleLeave = (roomId) => {
            if (socket.isSpectator && roomSpectators[roomId]) {
                roomSpectators[roomId] = roomSpectators[roomId].filter(
                    (s) => s.socketId !== socket.id
                );
                io.to(roomId).emit("spectators-sync", {
                    count: getSpectatorCount(roomId),
                    list: getSpectatorList(roomId)
                });
            } else if (roomId) {
                socket.to(roomId).emit("user-left", {
                    socketId: socket.id
                });
            }
        };

        // Leave Room
        socket.on("leave-room", ({ roomId }) => {
            socket.leave(roomId);
            handleLeave(roomId);
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            if (socket.roomId) {
                handleLeave(socket.roomId);
            }
        });

    });

};

module.exports = socketHandler;