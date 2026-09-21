import api from "./api.js";

export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getUsers: () => api.get("/admin/users"),
  getBoards: () => api.get("/admin/boards"),
  getBoardDetails: (boardId) => api.get(`/admin/boards/${boardId}`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  deleteBoard: (boardId) => api.delete(`/admin/boards/${boardId}`),
  updateUserRole: (userId, role) =>
    api.patch(`/admin/users/${userId}/role`, { role }),
};