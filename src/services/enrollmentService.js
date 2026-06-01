import api from "../api/api";

export const getEnrollments = () => api.get("/enrollments");
export const createEnrollment = (data) => api.post("/enrollments", data);