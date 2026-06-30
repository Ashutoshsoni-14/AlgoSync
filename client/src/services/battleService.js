import axios from "axios";

const API_URL = "http://localhost:5000/api/battles";

const getToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user.token;
};

// Start Battle
export const startBattle = async (battleData) => {
    const token = getToken();

    const response = await axios.post(
        `${API_URL}/start`,
        battleData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

// Submit Battle solution solved state
export const submitBattle = async (battleId) => {
    const token = getToken();

    const response = await axios.post(
        `${API_URL}/submit`,
        { battleId },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};