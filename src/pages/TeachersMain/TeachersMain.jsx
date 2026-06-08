import { useState, useEffect } from "react";
import {
  FaBookOpen, FaFlask, FaLandmark,
  FaCalendarAlt, FaFileUpload,
  FaFileExcel, FaArrowRight, FaPlus,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import api from "../../api/api";
import { getMyLoads, getStudentsByLoad } from "../../services/academicLoadService";
import { getPeriods } from "../../services/periodService";
import { getGradesByActivity } from "../../services/gradeService";
import "./TeachersMain.css";

const STUDENTS_PER_PAGE = 5;

function computeStats(students) {
  const graded = students.filter((s) => s.promedio !== null);
  const avg = graded.length > 0
    ? graded.reduce((acc, s) => acc + s.promedio, 0) / graded.length
    : 0;
  const pctCalificados = students.length > 0
    ? Math.round((graded.length / students.length) * 100)
    : 0;
  return { avg: avg.toFixed(2), pctCalificados };
}

function SubjectIcon({ index }) {
  if (index === 0) return <FaBookOpen />;
  if (index === 1) return <FaFlask />;
  return <FaLandmark />;
}

// Detectar periodo activo
function getPeriodoActivo(periods) {
  if (!periods || periods.length === 0) return null;
  const hoy = new Date();
  return periods.find((p) => {
    const ini = new Date(p.fecha_inicio);
    const fin = new Date(p.fecha_fin);
    return hoy >= ini && hoy <= fin;
  }) || periods[periods.length - 1];
}

/* ── MODAL CARGAR NOTAS ── igual estructura que UserModal ── */
function GradePanelModal({ loads, activities, onClose, onSave }) {
  const [selectedLoadId, setSelectedLoadId] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [activitiesForLoad, setActivitiesForLoad] = useState([]);
  const [checkingActivities, setCheckingActivities] = useState(false);

  const handleSelectLoad = async (loadId) => {
    setSelectedLoadId(loadId);
    setSelectedActivity("");
    setGrades({});
    setError("");
    setSuccessMsg("");
    setActivitiesForLoad([]);
    if (!loadId) { setStudents([]); return; }
    try {
      setLoadingStudents(true);
      // Cargar estudiantes
      const res = await getStudentsByLoad(loadId);
      const loadedStudents = res.data.map((m) => ({
        id: m.usuarios.id,
        nombre: `${m.usuarios.apellidos}, ${m.usuarios.nombres}`,
      }));
      setStudents(loadedStudents);

      // Filtrar actividades que aún tienen estudiantes sin nota
      setCheckingActivities(true);
      const candidatas = activities.filter((a) => a.carga_academica_id === parseInt(loadId));
      const pendientes = [];
      for (const act of candidatas) {
        try {
          const gradesRes = await getGradesByActivity(act.id);
          const estudiantesConNota = new Set(gradesRes.data.map((g) => g.estudiante_id));
          const faltanNotas = loadedStudents.some((s) => !estudiantesConNota.has(s.id));
          if (faltanNotas) pendientes.push(act);
        } catch {
          // Si falla la consulta asumir que no tiene notas
          pendientes.push(act);
        }
      }
      setActivitiesForLoad(pendientes);
    } catch {
      setError("Error cargando datos.");
    } finally {
      setLoadingStudents(false);
      setCheckingActivities(false);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedActivity) { setError("Selecciona una actividad."); return; }
    const entries = Object.entries(grades).filter(([, v]) => v !== "");
    if (entries.length === 0) { setError("Ingresa al menos una nota."); return; }
    setSaving(true);
    setError(""); setSuccessMsg("");
    let ok = 0, fail = 0;
    for (const [estudiante_id, nota] of entries) {
      try {
        await api.post("/grades", {
          actividad_id: parseInt(selectedActivity),
          estudiante_id: parseInt(estudiante_id),
          nota: parseFloat(nota),
        });
        ok++;
      } catch { fail++; }
    }
    setSaving(false);
    if (fail > 0 && ok === 0) {
      setError("No se guardaron las notas (ya existen o hubo un error).");
    } else if (fail > 0) {
      setSuccessMsg(`${ok} guardadas.`);
      setError(`${fail} ya existían o fallaron.`);
      onSave();
    } else {
      onSave();
      onClose();
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-container modal-container--wide" onClick={(e) => e.stopPropagation()}>

        {/* HEADER igual a UserModal */}
        <div className="modal-header">
          <div>
            <h2>Cargar Notas</h2>
            <p>REGISTRO DE CALIFICACIONES</p>
          </div>
          <button className="close-btn" onClick={onClose}><IoClose /></button>
        </div>

        <div className="modal-body">
          {/* FILTROS */}
          <div className="form-grid">
            <div className="form-group">
              <label>Materia – Curso</label>
              <select value={selectedLoadId} onChange={(e) => handleSelectLoad(e.target.value)}>
                <option value="">Seleccione materia</option>
                {loads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.materias?.nombre} — {l.cursos?.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Actividad con notas pendientes</label>
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                disabled={!selectedLoadId || checkingActivities || activitiesForLoad.length === 0}
              >
                <option value="">
                  {checkingActivities
                    ? "Verificando actividades..."
                    : activitiesForLoad.length === 0 && selectedLoadId
                      ? "Todas las actividades tienen notas completas"
                      : "Seleccione actividad"}
                </option>
                {activitiesForLoad.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} ({a.periodos?.nombre})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLA ESTUDIANTES */}
          {selectedLoadId && (
            <div className="grade-panel-table">
              <div className="grade-panel-thead">
                <span>Estudiante</span>
                <span>Nota (1.0 – 5.0)</span>
              </div>
              {loadingStudents ? (
                <p className="grade-panel-empty">Cargando estudiantes...</p>
              ) : students.length === 0 ? (
                <p className="grade-panel-empty">No hay estudiantes matriculados en este curso.</p>
              ) : (
                students.map((s) => (
                  <div className="grade-panel-row" key={s.id}>
                    <span>{s.nombre}</span>
                    <input
                      type="number" step="0.1" min="1" max="5"
                      placeholder="—"
                      value={grades[s.id] || ""}
                      onChange={(e) =>
                        setGrades((prev) => ({ ...prev, [s.id]: e.target.value }))
                      }
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {error && <p className="modal-error">{error}</p>}
          {successMsg && <p className="grade-panel-success">{successMsg}</p>}
        </div>

        {/* FOOTER igual a UserModal */}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancelar</button>
          <button
            className="submit-btn"
            onClick={handleSaveAll}
            disabled={saving || !selectedLoadId || !selectedActivity}
          >
            {saving ? "Guardando..." : "Guardar Notas →"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ── MODAL NUEVA ACTIVIDAD ── */
function ActivityModal({ loads, periods, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: "",
    carga_academica_id: "",
    periodo_id: "",
    porcentaje: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.nombre || !form.carga_academica_id || !form.periodo_id || !form.porcentaje) {
      setError("Todos los campos son obligatorios."); return;
    }
    setSaving(true); setError("");
    try {
      await api.post("/activities", {
        nombre: form.nombre,
        carga_academica_id: parseInt(form.carga_academica_id),
        periodo_id: parseInt(form.periodo_id),
        porcentaje: parseFloat(form.porcentaje),
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear la actividad.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Nueva Actividad</h2>
            <p>REGISTRO DE ACTIVIDAD ACADÉMICA</p>
          </div>
          <button className="close-btn" onClick={onClose}><IoClose /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre de la actividad *</label>
              <input
                name="nombre"
                placeholder="Ej: Parcial 1, Taller, Quiz..."
                value={form.nombre}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Materia – Curso *</label>
              <select name="carga_academica_id" value={form.carga_academica_id} onChange={handleChange}>
                <option value="">Seleccione materia</option>
                {loads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.materias?.nombre} — {l.cursos?.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Periodo *</label>
              <select name="periodo_id" value={form.periodo_id} onChange={handleChange}>
                <option value="">Seleccione periodo</option>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Porcentaje (%) *</label>
              <input
                name="porcentaje"
                type="number" min="1" max="100" step="1"
                placeholder="Ej: 20"
                value={form.porcentaje}
                onChange={handleChange}
              />
            </div>
          </div>
          {error && <p className="modal-error">{error}</p>}
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="submit-btn" onClick={handleSubmit} disabled={saving}>
            {saving ? "Creando..." : "Crear Actividad →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN ── */
function TeachersMain() {
  const [loads, setLoads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [activeLoadIndex, setActiveLoadIndex] = useState(0);
  const [studentsByLoad, setStudentsByLoad] = useState({});
  const [pendingGrades, setPendingGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [selectedActivity, setSelectedActivity] = useState("");
  const [openGradePanel, setOpenGradePanel] = useState(false);
  const [openActivityModal, setOpenActivityModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loadsRes, activitiesRes, periodsRes] = await Promise.all([
        getMyLoads(),
        api.get("/activities"),
        getPeriods(),
      ]);
      setLoads(loadsRes.data);
      setActivities(activitiesRes.data);
      setPeriods(periodsRes.data);
      if (loadsRes.data.length > 0) {
        await fetchStudentsForLoad(loadsRes.data[0].id);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForLoad = async (loadId) => {
    if (studentsByLoad[loadId]) return;
    try {
      setLoadingStudents(true);
      const res = await getStudentsByLoad(loadId);
      const formatted = res.data.map((m) => ({
        id: m.usuarios.id,
        nombre: `${m.usuarios.apellidos}, ${m.usuarios.nombres}`,
        promedio: null,
      }));
      setStudentsByLoad((prev) => ({ ...prev, [loadId]: formatted }));
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
      setStudentsByLoad((prev) => ({ ...prev, [loadId]: [] }));
    } finally {
      setLoadingStudents(false);
    }
  };

  // Cuando se selecciona una actividad, cargar las notas reales de esa actividad
  const handleActivityChange = async (activityId) => {
    setSelectedActivity(activityId);
    setSaveMsg("");
    const loadId = activeLoad?.id;
    if (!activityId || !loadId) return;
    try {
      const res = await getGradesByActivity(activityId);
      const gradeMap = {};
      res.data.forEach((g) => {
        gradeMap[g.estudiante_id] = parseFloat(g.nota);
      });
      setStudentsByLoad((prev) => ({
        ...prev,
        [loadId]: (prev[loadId] || []).map((s) => ({
          ...s,
          promedio: gradeMap[s.id] !== undefined ? gradeMap[s.id] : null,
        })),
      }));
    } catch {
      // No hay notas aún — dejar promedio en null
    }
  };

  const handleSelectLoad = async (index) => {
    setActiveLoadIndex(index);
    setCurrentPage(1);
    setSelectedActivity("");
    setSaveMsg("");
    const load = loads[index];
    if (load) await fetchStudentsForLoad(load.id);
  };

  const handleNoteChange = (studentId, value) => {
    const loadId = activeLoad?.id;
    if (!loadId) return;
    setPendingGrades((prev) => ({
      ...prev,
      [loadId]: { ...(prev[loadId] || {}), [studentId]: value },
    }));
  };

  const handleSaveChanges = async () => {
    const loadId = activeLoad?.id;
    if (!selectedActivity) { setSaveMsg("⚠ Selecciona una actividad antes de guardar."); return; }
    const pending = pendingGrades[loadId] || {};
    const entries = Object.entries(pending).filter(([, v]) => v !== "");
    if (entries.length === 0) { setSaveMsg("⚠ No hay notas para guardar."); return; }

    setSavingAll(true);
    setSaveMsg("");
    let ok = 0, fail = 0;

    for (const [estudiante_id, nota] of entries) {
      try {
        await api.post("/grades", {
          actividad_id: parseInt(selectedActivity),
          estudiante_id: parseInt(estudiante_id),
          nota: parseFloat(nota),
        });
        setStudentsByLoad((prev) => ({
          ...prev,
          [loadId]: (prev[loadId] || []).map((s) =>
            s.id === parseInt(estudiante_id) ? { ...s, promedio: parseFloat(nota) } : s
          ),
        }));
        ok++;
      } catch { fail++; }
    }

    setPendingGrades((prev) => ({ ...prev, [loadId]: {} }));
    setSavingAll(false);
    if (fail > 0 && ok === 0) {
      setSaveMsg("❌ No se guardaron (ya existen o hubo un error).");
    } else if (fail > 0) {
      setSaveMsg(`✅ ${ok} guardadas. ❌ ${fail} ya existían.`);
    } else {
      setSaveMsg(`✅ ${ok} nota(s) guardadas correctamente.`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const activeLoad = loads[activeLoadIndex] ?? null;
  const currentStudents = activeLoad ? (studentsByLoad[activeLoad.id] ?? []) : [];
  const stats = computeStats(currentStudents);
  const totalPages = Math.max(1, Math.ceil(currentStudents.length / STUDENTS_PER_PAGE));
  const paginatedStudents = currentStudents.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );
  const activeActivities = activeLoad
    ? activities.filter((a) => a.carga_academica_id === activeLoad.id)
    : [];
  const activePending = activeLoad ? (pendingGrades[activeLoad.id] || {}) : {};
  const periodoActivo = getPeriodoActivo(periods);

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div>
          <div className="logo-box">
            <h2>Virtual Campus</h2>
            <p>Gestión Académica</p>
          </div>
          <button className="sidebar-btn active-btn" onClick={() => setOpenGradePanel(true)}>
            <FaFileUpload />
            <span>Cargar Notas</span>
          </button>
        </div>
        <div className="sidebar-links">
          <p onClick={handleLogout}>Cerrar Sesión <FiLogOut /></p>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-wrapper">
        <div className="topbar">
          <h2 className="brand">GradesBook</h2>
          <div className="topbar-right">
            <input type="text" placeholder="Buscar alumnos..." className="search-input" />
            <div className="profile-avatar">D</div>
          </div>
        </div>

        <div className="TeachersMain-page">

          <div className="main-header">
            <div>
              <span className="top-text">GESTIÓN DE CALIFICACIONES</span>
              <h1>Cargar Notas</h1>
              <p>Selecciona una materia y actividad para registrar las calificaciones.</p>
            </div>
            {/* PERIODO ACTIVO */}
            <div className="period-box">
              <FaCalendarAlt />
              <span>
                {periodoActivo
                  ? periodoActivo.nombre
                  : "Sin periodo activo"}
              </span>
            </div>
          </div>

          <div className="main-content">

            {/* MATERIAS */}
            <div className="subjects-section scroll-box">
              <h2>Mis Clases Activas</h2>
              {loading ? (
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", padding: "1rem 0" }}>
                  Cargando materias...
                </p>
              ) : loads.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", padding: "1rem 0" }}>
                  No tienes materias asignadas.
                </p>
              ) : (
                loads.map((load, index) => (
                  <div
                    key={load.id}
                    className={`subject-card ${index === activeLoadIndex ? "active" : ""}`}
                    onClick={() => handleSelectLoad(index)}
                  >
                    <div className="subject-icon"><SubjectIcon index={index} /></div>
                    <div className="subject-info">
                      <div className="subject-badge">
                        {index === activeLoadIndex ? "EN CURSO" : "PENDIENTE"}
                      </div>
                      <h3>{load.materias?.nombre}</h3>
                      <p>{load.cursos?.nombre}</p>
                      <small>
                        {studentsByLoad[load.id]
                          ? `${studentsByLoad[load.id].length} alumnos`
                          : "—"}
                      </small>
                    </div>
                    <FaArrowRight className="subject-arrow" />
                  </div>
                ))
              )}
            </div>

            {/* ESTUDIANTES */}
            <div className="right-side">
              <div className="students-section">

                <div className="students-header">
                  <div>
                    <h2>Listado de Alumnos</h2>
                    {activeLoad && (
                      <p>{activeLoad.materias?.nombre} — {activeLoad.cursos?.nombre}</p>
                    )}
                  </div>
                  <div className="students-header-actions">
                    <button className="excel-btn">
                      <FaFileExcel /><span>Planilla Excel</span>
                    </button>
                    <button className="save-btn" onClick={() => setOpenActivityModal(true)}>
                      <FaPlus /> Nueva Actividad
                    </button>
                  </div>
                </div>

                {/* SELECTOR DE ACTIVIDAD */}
                <div className="activity-selector">
                  <label>Actividad a calificar</label>
                  <select
                    value={selectedActivity}
                    onChange={(e) => handleActivityChange(e.target.value)}
                    disabled={activeActivities.length === 0}
                  >
                    <option value="">
                      {activeActivities.length === 0
                        ? "Sin actividades en esta materia"
                        : "Seleccione actividad"}
                    </option>
                    {activeActivities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre} ({a.periodos?.nombre})
                      </option>
                    ))}
                  </select>
                </div>

                {/* TABLA */}
                <div className="students-table">
                  <div className="table-header table-header--grades">
                    <span>ALUMNO</span>
                    <span>NOTA REGISTRADA</span>
                    <span>NUEVA NOTA</span>
                  </div>

                  {loadingStudents ? (
                    <div className="table-loading">Cargando alumnos...</div>
                  ) : paginatedStudents.length === 0 ? (
                    <div className="table-loading">
                      {loading ? "Cargando..." : "Sin alumnos matriculados en este curso."}
                    </div>
                  ) : (
                    paginatedStudents.map((student) => {
                      const pendingVal = activePending[student.id] || "";
                      return (
                        <div className="table-row table-row--grades" key={student.id}>
                          <div className="student-cell">
                            <div className="avatar">
                              {student.nombre.charAt(0)}
                            </div>
                            <h4>{student.nombre}</h4>
                          </div>
                          <div className="grade-box">
                            {student.promedio !== null
                              ? student.promedio.toFixed(2)
                              : "--"}
                          </div>
                          <input
                            className="grade-input"
                            type="number" step="0.1" min="1" max="5"
                            placeholder="—"
                            value={pendingVal}
                            onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          />
                        </div>
                      );
                    })
                  )}
                </div>

                {/* FOOTER */}
                <div className="table-footer">
                  <div className="footer-left">
                    <span>
                      {currentStudents.length} alumno{currentStudents.length !== 1 ? "s" : ""} en este curso
                    </span>
                    {saveMsg && <span className="save-msg">{saveMsg}</span>}
                  </div>
                  <div className="footer-right">
                    <div className="pagination">
                      <button className="page-btn" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>‹</button>
                      <span>Pág. {currentPage}/{totalPages}</span>
                      <button className="page-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>›</button>
                    </div>
                    <button
                      className="save-btn"
                      onClick={handleSaveChanges}
                      disabled={savingAll || !selectedActivity}
                    >
                      {savingAll ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* STATS — sin alumnos en riesgo */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-blue">↗</span>
              <span>Promedio General:</span>
              <strong className="stat-blue">{stats.avg}</strong>
            </div>
            <div className="stat-item">
              <span className="stat-green">✔</span>
              <span>{stats.pctCalificados}% Calificado</span>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL NUEVA ACTIVIDAD */}
      {openActivityModal && (
        <ActivityModal
          loads={loads}
          periods={periods}
          onClose={() => setOpenActivityModal(false)}
          onSave={loadData}
        />
      )}

      {/* MODAL CARGAR NOTAS */}
      {openGradePanel && (
        <GradePanelModal
          loads={loads}
          activities={activities}
          onClose={() => setOpenGradePanel(false)}
          onSave={loadData}
        />
      )}
    </div>
  );
}

export default TeachersMain;