import axios from "axios";

// const API_URL = import.meta.env.DEV
//   ? "http://localhost:3000"
//   : "https://vertexcanvas.onrender.com";
const API_URL = "http://localhost:3000";
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export default api;
