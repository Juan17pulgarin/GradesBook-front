import { useState, useEffect } from "react";
import {
  FaBookOpen,
  FaFlask,
  FaLandmark,
  FaCalendarAlt,
  FaFileUpload,
  FaPlus,
  FaFileExcel,
  FaArrowRight,
  FaEllipsisV,
} from "react-icons/fa";
import api from "../../api/api";
import "./TeachersMain.css";

/* ================= MODAL ================= */
function StudentModal({
  student,
  activityId, setActivityId,
  nota, setNota,
  observacion, setObservacion,
  onClose,
  onSave,
}) {
  if (!student) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Registrar Nota</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="student-data">
          <p><strong>Estudiante:</strong> {student.nombre}</p>
          <p><strong>ID:</strong> #{student.id}</p>
        </div>
        <form className="grade-form" onSubmit={onSave}>
          <div className="form-group">
            <label>Actividad ID</label>
            <input
              type="number"
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              placeholder="Ej: 13"
            />
          </div>
          <div className="form-group">
            <label>Nota</label>
            <input
              type="number"
              step="0.1"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: 2.0"
            />
          </div>
          <div className="form-group">
            <label>Observación</label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Mejorar trabajo"
            />
          </div>
          <button type="submit" className="submit-btn">Guardar Nota</button>
        </form>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */
const RISK_THRESHOLD = 6.0;
const STUDENTS_PER_PAGE = 5;

function computeStats(students) {
  const graded = students.filter((s) => s.nota !== "--" && s.nota !== null);
  const avg =
    graded.length > 0
      ? graded.reduce((acc, s) => acc + parseFloat(s.nota), 0) / graded.length
      : 0;
  const pctCalificados =
    students.length > 0
      ? Math.round((graded.length / students.length) * 100)
      : 0;
  const atRisk = graded.filter((s) => parseFloat(s.nota) < RISK_THRESHOLD).length;

  return {
    avg: avg.toFixed(2),
    pctCalificados,
    atRisk,
  };
}

/* ================= SUBJECT ICON ================= */
function SubjectIcon({ index }) {
  if (index === 0) return <FaBookOpen />;
  if (index === 1) return <FaFlask />;
  return <FaLandmark />;
}

/* ================= MAIN ================= */
function TeachersMain() {
  const [subjects, setSubjects] = useState([]);
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);
  // Map: subjectId -> estudiantes[]
  const [studentsBySubject, setStudentsBySubject] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activityId, setActivityId] = useState("");
  const [nota, setNota] = useState("");
  const [observacion, setObservacion] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // ── Load subjects once ──
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const subjectsRes = await api.get("/subjects");
      const user = JSON.parse(localStorage.getItem("user"));

      let teacherSubjects = [];
      if (user?.id === 3) {
        teacherSubjects = subjectsRes.data.filter((s) =>
          [1, 2, 3].includes(s.id)
        );
      } else if (user?.id === 4) {
        teacherSubjects = subjectsRes.data.filter((s) =>
          [4, 5].includes(s.id)
        );
      } else {
        teacherSubjects = subjectsRes.data.slice(0, 3);
      }

      setSubjects(teacherSubjects);

      // Load students for the first subject immediately
      if (teacherSubjects.length > 0) {
        await loadStudentsForSubject(teacherSubjects[0].id);
      }
    } catch (error) {
      console.error("Error cargando materias:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Load students for a subject (with lazy cache) ──
  const loadStudentsForSubject = async (subjectId) => {
    // Already cached? Skip API call
    if (studentsBySubject[subjectId]) return;

    try {
      setLoadingStudents(true);

      // Option A: endpoint by subject → /subjects/:id/students
      // Option B: filter from /users + /grades
      // Using Option B for compatibility with your existing API shape:
      const [usersRes, gradesRes] = await Promise.all([
        api.get("/users"),
        api.get(`/grades?subject_id=${subjectId}`).catch(() => ({ data: [] })),
      ]);

      const onlyStudents = usersRes.data.filter(
        (u) => u.tipo === "ESTUDIANTE"
      );

      // Build a quick grade lookup: estudiante_id -> nota
      const gradeMap = {};
      (gradesRes.data || []).forEach((g) => {
        gradeMap[g.estudiante_id] = g.nota;
      });

      const formatted = onlyStudents.map((student) => ({
        id: student.id,
        nombre: `${student.apellidos}, ${student.nombres}`,
        nota: gradeMap[student.id] ?? "--",
        asistencia: student.asistencia ?? "100%",
      }));

      setStudentsBySubject((prev) => ({
        ...prev,
        [subjectId]: formatted,
      }));
    } catch (error) {
      console.error("Error cargando estudiantes:", error);
      setStudentsBySubject((prev) => ({
        ...prev,
        [subjectId]: [],
      }));
    } finally {
      setLoadingStudents(false);
    }
  };

  // ── Switch subject ──
  const handleSelectSubject = async (index) => {
    setActiveSubjectIndex(index);
    setCurrentPage(1);
    const subject = subjects[index];
    if (subject) {
      await loadStudentsForSubject(subject.id);
    }
  };

  // ── Save grade ──
  const handleSaveGrade = async (e) => {
    e.preventDefault();
    try {
      await api.post("/grades", {
        actividad_id: parseInt(activityId),
        estudiante_id: selectedStudent.id,
        nota: parseFloat(nota),
        observacion,
      });

      // Update nota in local cache
      const subjectId = subjects[activeSubjectIndex]?.id;
      if (subjectId) {
        setStudentsBySubject((prev) => ({
          ...prev,
          [subjectId]: (prev[subjectId] || []).map((s) =>
            s.id === selectedStudent.id
              ? { ...s, nota: parseFloat(nota) }
              : s
          ),
        }));
      }

      alert("Nota guardada correctamente");
      setSelectedStudent(null);
      setActivityId("");
      setNota("");
      setObservacion("");
    } catch (error) {
      console.error(error);
      alert("Error guardando nota");
    }
  };

  // ── Derived data ──
  const activeSubject = subjects[activeSubjectIndex] ?? null;
  const currentStudents = activeSubject
    ? studentsBySubject[activeSubject.id] ?? []
    : [];
  const stats = computeStats(currentStudents);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(currentStudents.length / STUDENTS_PER_PAGE));
  const paginatedStudents = currentStudents.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );

  const handleExportExcel = () => {
    alert("Exportando planilla Excel...");
  };

  return (
    <div className="dashboard-layout">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div>
          <div className="logo-box">
            <div className="logo-text">
              <h2>Virtual Campus</h2>
              <p>Gestión Académica</p>
            </div>
          </div>

          <button className="sidebar-btn active-btn">
            <FaFileUpload />
            <span>Cargar Notas</span>
          </button>
        </div>

        <div className="sidebar-links">
          <p>↪ Cerrar Sesión</p>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-wrapper">

        {/* TOPBAR */}
        <div className="topbar">
          <h2 className="brand">GradesBook</h2>
          <div className="topbar-right">
            <input
              type="text"
              placeholder="Buscar alumnos..."
              className="search-input"
            />
            <div className="profile-avatar">A</div>
          </div>
        </div>

        <div className="TeachersMain-page">

          {/* PAGE HEADER */}
          <div className="main-header">
            <div>
              <span className="top-text">GESTIÓN DE CALIFICACIONES</span>
              <h1>Cargar Notas</h1>
              <p>Selecciona una materia para actualizar los registros académicos.</p>
            </div>
            <div className="period-box">
              <FaCalendarAlt />
              <span>Ciclo Lectivo 2026</span>
            </div>
          </div>

          {/* CONTENT */}
          <div className="main-content">

            {/* LEFT: SUBJECTS */}
            <div className="subjects-section scroll-box">
              <h2>Mis Clases Activas</h2>

              {loading ? (
                <p style={{ color: "#888", padding: "1rem 0" }}>Cargando materias...</p>
              ) : (
                subjects.map((subject, index) => (
                  <div
                    className={`subject-card ${index === activeSubjectIndex ? "active" : ""}`}
                    key={subject.id}
                    onClick={() => handleSelectSubject(index)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="subject-icon">
                      <SubjectIcon index={index} />
                    </div>

                    <div className="subject-info">
                      <div className="subject-badge">
                        {index === activeSubjectIndex ? "EN CURSO" : "PENDIENTE"}
                      </div>
                      <h3>{subject.nombre}</h3>
                      <p>{subject.curso ?? "Curso Asignado"}</p>
                      <small>
                        {studentsBySubject[subject.id]?.length ?? "--"} Alumnos
                      </small>
                    </div>

                    <FaArrowRight className="subject-arrow" />
                  </div>
                ))
              )}
            </div>

            {/* RIGHT: STUDENTS */}
            <div className="right-side">
              <div className="students-section scroll-box">

                <div className="students-header">
                  <div>
                    <h2>Listado de Alumnos</h2>
                    {activeSubject && (
                      <p>
                        {activeSubject.unidad ?? `Materia #${activeSubject.id}`}
                      </p>
                    )}
                  </div>

                  <div className="students-header-actions">
                    <button className="excel-btn" onClick={handleExportExcel}>
                      <FaFileExcel />
                      <span>Planilla Excel</span>
                    </button>
                    <button className="save-btn">Guardar Cambios</button>
                  </div>
                </div>

                <div className="students-table">
                  <div className="table-header">
                    <span>ALUMNO</span>
                    <span>NOTA PARCIAL</span>
                    <span>ASISTENCIA</span>
                    <span>ACCIONES</span>
                  </div>

                  {loadingStudents ? (
                    <div className="table-loading">Cargando alumnos...</div>
                  ) : paginatedStudents.length === 0 ? (
                    <div className="table-loading">Sin alumnos registrados.</div>
                  ) : (
                    paginatedStudents.map((student) => {
                      const notaNum =
                        student.nota !== "--" ? parseFloat(student.nota) : null;
                      const isRisk = notaNum !== null && notaNum < RISK_THRESHOLD;

                      return (
                        <div className="table-row" key={student.id}>
                          <div className="student-cell">
                            <div className={`avatar ${isRisk ? "avatar-risk" : ""}`}>
                              {student.nombre.charAt(0)}
                            </div>
                            <div>
                              <h4>{student.nombre}</h4>
                              <p>ID: #{student.id}</p>
                            </div>
                          </div>

                          <div className={`grade-box ${isRisk ? "grade-risk" : ""}`}>
                            {student.nota !== "--"
                              ? parseFloat(student.nota).toFixed(2)
                              : "--"}
                          </div>

                          <div
                            className={`attendance ${
                              parseInt(student.asistencia) < 85
                                ? "attendance-low"
                                : "attendance-ok"
                            }`}
                          >
                            {student.asistencia}
                          </div>

                          <div className="actions">
                            <button
                              className="plus-btn"
                              onClick={() => setSelectedStudent(student)}
                              title="Registrar nota"
                            >
                              <FaPlus />
                            </button>
                            <button className="menu-btn" title="Más opciones">
                              <FaEllipsisV />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* FOOTER: autosave + paginación */}
                <div className="table-footer">
                  <span className="autosave-text">
                    Cambios guardados automáticamente hace 2 minutos.
                  </span>
                  <div className="pagination">
                    <span>
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      className="page-btn"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    >
                      &rsaquo;
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── STATS BAR ── */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-icon stat-blue">↗</span>
              <span>Promedio General:</span>
              <strong className="stat-blue">{stats.avg}</strong>
            </div>

            <div className="stat-item">
              <span className="stat-icon stat-green">✔</span>
              <span className="stat-pill stat-green">
                {stats.pctCalificados}% Calificado
              </span>
            </div>

            <div className="stat-item">
              <span className="stat-icon stat-amber">⚠</span>
              <span>{stats.atRisk} Alumnos en Riesgo</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── MODAL ── */}
      <StudentModal
        student={selectedStudent}
        activityId={activityId}
        setActivityId={setActivityId}
        nota={nota}
        setNota={setNota}
        observacion={observacion}
        setObservacion={setObservacion}
        onClose={() => setSelectedStudent(null)}
        onSave={handleSaveGrade}
      />
    </div>
  );
}

export default TeachersMain;