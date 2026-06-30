import axios from "axios";

const API_URL = "http://localhost:5000/api/code";

const getToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user.token;
};

// Run Code
export const runCode = async (codeData) => {
    const token = getToken();

    const response = await axios.post(
        `${API_URL}/run`,
        codeData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

// Submit Code
export const submitCode = async (codeData) => {
    const token = getToken();

    const response = await axios.post(
        `${API_URL}/submit`,
        codeData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};