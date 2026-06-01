import api from "../api/api";

export const createGrade = (data) => api.post("/grades", data);
export const getGradesByActivity = (actividadId) => api.get(`/grades/activity/${actividadId}`);
export const getGradesBySubject = (subjectId) => api.get(`/grades?subject_id=${subjectId}`);
export const deleteGrade = (id) => api.delete(`/grades/${id}`);
export const updateGrade = (id, data) => api.patch(`/grades/${id}`, data);
export const getMyGrades = () => api.get("/grades/my-grades");
export const getMyAverage = () => api.get("/grades/my-average");
export const getMyAverageByPeriod = (periodoId) => api.get(`/grades/my-average/period/${periodoId}`);