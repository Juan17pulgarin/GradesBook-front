import api from "../api/api";

export const createUser = (data) => api.post("/users", data);
export const getUsers = (tipo) => api.get(`/users?tipo=${tipo}`);
export const deactivateUser = (id, activo) => api.patch(`/users/${id}`, { activo });
export const updateUser = (id, data) => api.put(`/users/${id}`, data);