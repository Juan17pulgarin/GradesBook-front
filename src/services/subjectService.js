import api from "../api/api";

export const getSubjects = () => api.get("/subjects");
export const getMySubjects = () => api.get("/subjects/my-subjects");
export const createSubject = (data) => api.post("/subjects", data);