import axios from "axios";

const API_URL = "http://localhost:5000/api/rooms";

const getToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user.token;
};

// Create Room
export const createRoom = async ({ difficulty, roomType, problemId }) => {
    const token = getToken();

    const response = await axios.post(
        `${API_URL}/create`,
        { difficulty, roomType, problemId },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

// Join Room
export const joinRoom = async (roomId) => {
    const token = getToken();

    const response = await axios.post(
        `${API_URL}/join`,
        { roomId },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

// Get Room details (with populated user info)
export const getRoomDetails = async (roomId) => {
    const token = getToken();

    const response = await axios.get(
        `${API_URL}/${roomId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};