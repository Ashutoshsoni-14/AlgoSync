import axios from "axios";

const API_URL = "http://localhost:5000/api/leaderboard";

const getToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user.token;
};

// Get Leaderboard
export const getLeaderboard = async () => {
    const token = getToken();

    const response = await axios.get(API_URL, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};

// Get Profile
export const getProfile = async () => {
    const token = getToken();

    const response = await axios.get(`${API_URL}/profile`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};