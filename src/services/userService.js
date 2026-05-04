import api from "./api";

// Obtener todos los usuarios
export const getUsers = () => {
  return api.get("/users");
};

// Obtener un usuario por ID
export const getUserById = (id) => {
  return api.get(`/users/${id}`);
};

// Crear usuario
export const createUser = (data) => {
  return api.post("/users", data);
};

// Actualizar usuario
export const updateUser = (id, data) => {
  return api.put(`/users/${id}`, data);
};

// Eliminar usuario
export const deleteUser = (id) => {
  return api.delete(`/users/${id}`);
};