import axios from "axios";

const API_URL = "http://localhost:5000/api/problems";

const getToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user.token;
};

// Get all problems
export const getProblems = async () => {
    const token = getToken();

    const response = await axios.get(API_URL, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};