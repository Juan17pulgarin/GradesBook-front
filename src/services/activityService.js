import api from "../api/api";

export const getActivities = () => api.get("/activities");
export const createActivity = (data) => api.post("/activities", data);
export const getMyActivities = () => api.get("/activities/my-activities");