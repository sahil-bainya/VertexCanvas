import axios from "axios";

const API_URL = "https://vertexcanvas.onrender.com";
// const API_URL = "http://localhost:5000";
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export default api;
