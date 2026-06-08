import api from "../api/api";

export const getAcademicLoads = () => api.get("/academic-loads");
export const createAcademicLoad = (data) => api.post("/academic-loads", data);
export const updateAcademicLoad = (id, data) => api.patch(`/academic-loads/${id}`, data);

// Nuevos endpoints para DOCENTE
export const getMyLoads = () => api.get("/academic-loads/my-loads");
export const getStudentsByLoad = (carga_academica_id) => api.get(`/academic-loads/${carga_academica_id}/students`);