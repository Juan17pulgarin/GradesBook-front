import api from "../api/api";

export const login = (data) => {
  return api.post("/auth/login", data);
};