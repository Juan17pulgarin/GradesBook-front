import api from "../api/api";

<<<<<<< HEAD
// ── Usuarios ──
export const createUser = (data) => api.post("/users", data);
export const getUsers = (tipo) => api.get(`/users?tipo=${tipo}`);
export const deactivateUser = (id) => api.patch(`/users/${id}`);

// ── Cargas académicas ──
export const getAcademicLoads = () => api.get("/academic-loads");
export const createAcademicLoad = (data) => api.post("/academic-loads", data);
export const updateAcademicLoad = (id, data) => api.put(`/academic-loads/${id}`, data);

// ── Matrículas ──
export const getEnrollments = () => api.get("/enrollments");
export const createEnrollment = (data) => api.post("/enrollments", data);

// ── Periodos ──
export const getPeriods = () => api.get("/periods");
export const createPeriod = (data) => api.post("/periods", data);

// ── Materias ──
export const getSubjects = () => api.get("/subjects");

// ── Cursos ──
export const getCourses = () => api.get("/courses");

// ── Actividades (DOCENTE) ──
export const getActivities = () => api.get("/activities");
export const createActivity = (data) => api.post("/activities", data);

// ── Actividades (ESTUDIANTE) ──
export const getMyActivities = () => api.get("/activities/my-activities");

// ── Notas (DOCENTE) ──
export const createGrade = (data) => api.post("/grades", data);
export const getGradesByActivity = (actividadId) => api.get(`/grades/activity/${actividadId}`);
export const deleteGrade = (id) => api.delete(`/grades/${id}`);

// ── Notas (ESTUDIANTE) ──
export const getMyGrades = () => api.get("/grades/my-grades");
=======
// Crear usuario (único endpoint que tienes)
export const createUser = (data) => {
  return api.post("/users", data);
};
>>>>>>> courses-subject
