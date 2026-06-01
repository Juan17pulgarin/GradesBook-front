import api from "../api/api";

export const getPeriods = () => api.get("/periods");
export const createPeriod = (data) => api.post("/periods", data);