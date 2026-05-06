import api from "../api/api";

// Crear usuario (único endpoint que tienes)
export const createUser = (data) => {
  return api.post("/users", data);
};