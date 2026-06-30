const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const app = require("./app");
const socketHandler = require("./sockets/socketHandler");

// Load env
dotenv.config();

// Connect database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Attach socket.io
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// Socket
socketHandler(io);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});