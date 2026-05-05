import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_EDYN_API_URL || "http://localhost:5057",

});

export default axiosInstance;