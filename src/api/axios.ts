import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5057",

});

export default axiosInstance;