import api from "../api/api";

export const getAcademicLoads = () => api.get("/academic-loads");
export const createAcademicLoad = (data) => api.post("/academic-loads", data);
export const updateAcademicLoad = (id, data) => api.patch(`/academic-loads/${id}`, data);