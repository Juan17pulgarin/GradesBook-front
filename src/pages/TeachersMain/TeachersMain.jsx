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
import "./TeachersMain.css";

const STUDENTS_PER_PAGE = 5;

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#2563eb" },
  { bg: "#fce7f3", color: "#db2777" },
  { bg: "#d1fae5", color: "#059669" },
  { bg: "#fef3c7", color: "#d97706" },
  { bg: "#ede9fe", color: "#7c3aed" },
  { bg: "#fee2e2", color: "#dc2626" },
  { bg: "#e0f2fe", color: "#0284c7" },
  { bg: "#f0fdf4", color: "#16a34a" },
];

// Color basado en la primera letra del nombre para consistencia
function getColorFromName(nombre) {
  if (!nombre) return AVATAR_COLORS[0];
  const idx = nombre.trim().toUpperCase().charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// Iniciales de dos letras a partir de "Apellido, Nombre"
function getInitials(nombre) {
  if (!nombre) return "?";
  const clean = nombre.replace(",", "").trim().split(/\s+/);
  if (clean.length >= 2) return (clean[0][0] + clean[1][0]).toUpperCase();
  return clean[0]?.slice(0, 2).toUpperCase() || "?";
}

// Primera inicial del primer nombre para el topbar
function getPrimerInicial() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const nombre = u.nombres || u.nombre || "";
    return nombre.trim()[0]?.toUpperCase() || "U";
  } catch { return "U"; }
}

function computeStats(students) {
  const graded = students.filter((s) => s.promedio !== null);
  const avg = graded.length > 0
    ? graded.reduce((acc, s) => acc + s.promedio, 0) / graded.length
    : 0;
  const pct = students.length > 0
    ? Math.round((graded.length / students.length) * 100)
    : 0;
  return { avg: avg.toFixed(2), pct };
}

function SubjectIcon({ index }) {
  if (index === 0) return <FaBookOpen />;
  if (index === 1) return <FaFlask />;
  return <FaLandmark />;
}

function getPeriodoActivo(periods) {
  if (!periods || periods.length === 0) return null;
  const hoy = new Date();
  return (
    periods.find((p) =>
      hoy >= new Date(p.fecha_inicio) && hoy <= new Date(p.fecha_fin)
    ) || periods[periods.length - 1]
  );
}

/* ── MODAL CARGAR NOTAS ── */
function GradePanelModal({ loads, activities, onClose, onSave }) {
  const [selectedLoadId, setSelectedLoadId] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const activitiesForLoad = selectedLoadId
    ? activities.filter((a) => a.carga_academica_id === parseInt(selectedLoadId))
    : [];

  const handleSelectLoad = async (loadId) => {
    setSelectedLoadId(loadId);
    setSelectedActivity("");
    setGrades({});
    setError(""); setSuccessMsg("");
    if (!loadId) { setStudents([]); return; }
    try {
      setLoadingStudents(true);
      const res = await getStudentsByLoad(loadId);
      setStudents(res.data.map((m) => ({
        id: m.usuarios.id,
        nombre: `${m.usuarios.apellidos}, ${m.usuarios.nombres}`,
      })));
    } catch {
      setError("Error cargando estudiantes.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedActivity) { setError("Selecciona una actividad."); return; }
    const entries = Object.entries(grades).filter(([, v]) => v !== "");
    if (entries.length === 0) { setError("Ingresa al menos una nota."); return; }
    setSaving(true); setError(""); setSuccessMsg("");
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
      setError("No se guardaron (ya existen o hubo un error).");
    } else if (fail > 0) {
      setSuccessMsg(`${ok} guardadas.`);
      setError(`${fail} ya existían o fallaron.`);
      onSave();
    } else {
      onSave(); onClose();
    }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-container modal-container--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Cargar Notas</h2>
            <p>REGISTRO DE CALIFICACIONES</p>
          </div>
          <button className="close-btn" onClick={onClose}><IoClose /></button>
        </div>
        <div className="modal-body">
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
              <label>Actividad</label>
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                disabled={!selectedLoadId || activitiesForLoad.length === 0}
              >
                <option value="">
                  {activitiesForLoad.length === 0 && selectedLoadId
                    ? "Sin actividades en esta materia"
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

          {selectedLoadId && (
            <div className="grade-panel-table">
              <div className="grade-panel-thead">
                <span>Estudiante</span>
                <span>Nota (1.0 – 5.0)</span>
              </div>
              {loadingStudents ? (
                <p className="grade-panel-empty">Cargando estudiantes...</p>
              ) : students.length === 0 ? (
                <p className="grade-panel-empty">No hay estudiantes matriculados.</p>
              ) : students.map((s) => {
                const colors = getColorFromName(s.nombre);
                return (
                  <div className="grade-panel-row" key={s.id}>
                    <div className="grade-panel-student">
                      <div className="gp-avatar" style={{ background: colors.bg, color: colors.color }}>
                        {getInitials(s.nombre)}
                      </div>
                      <span>{s.nombre}</span>
                    </div>
                    <input
                      type="number" step="0.1" min="1" max="5"
                      placeholder="—"
                      value={grades[s.id] || ""}
                      onChange={(e) => setGrades((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {error && <p className="modal-error">{error}</p>}
          {successMsg && <p className="grade-panel-success">{successMsg}</p>}
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancelar</button>
          <button className="submit-btn" onClick={handleSaveAll}
            disabled={saving || !selectedLoadId || !selectedActivity}>
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
    nombre: "", carga_academica_id: "", periodo_id: "", porcentaje: "", fecha: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.nombre || !form.carga_academica_id || !form.periodo_id || !form.porcentaje || !form.fecha) {
      setError("Todos los campos son obligatorios."); return;
    }
    setSaving(true); setError("");
    try {
      await api.post("/activities", {
        nombre: form.nombre,
        carga_academica_id: parseInt(form.carga_academica_id),
        periodo_id: parseInt(form.periodo_id),
        porcentaje: parseFloat(form.porcentaje),
        fecha: form.fecha,
      });
      onSave(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear la actividad.");
    } finally { setSaving(false); }
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2>Nueva Actividad</h2><p>REGISTRO DE ACTIVIDAD ACADÉMICA</p></div>
          <button className="close-btn" onClick={onClose}><IoClose /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre de la actividad *</label>
              <input name="nombre" placeholder="Ej: Parcial 1, Taller..."
                value={form.nombre} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Materia – Curso *</label>
              <select name="carga_academica_id" value={form.carga_academica_id} onChange={handleChange}>
                <option value="">Seleccione materia</option>
                {loads.map((l) => (
                  <option key={l.id} value={l.id}>{l.materias?.nombre} — {l.cursos?.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Periodo *</label>
              <select name="periodo_id" value={form.periodo_id} onChange={handleChange}>
                <option value="">Seleccione periodo</option>
                {periods.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Porcentaje (%) *</label>
              <input name="porcentaje" type="number" min="1" max="100" step="1"
                placeholder="Ej: 20" value={form.porcentaje} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Fecha *</label>
              <input name="fecha" type="date" value={form.fecha} onChange={handleChange} />
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
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [openGradePanel, setOpenGradePanel] = useState(false);
  const [openActivityModal, setOpenActivityModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setStudentsByLoad({});

      const [loadsRes, activitiesRes, periodsRes] = await Promise.all([
        getMyLoads(),
        api.get("/activities"),
        getPeriods(),
      ]);

      const allLoads      = loadsRes.data;
      const allActivities = activitiesRes.data;
      const allPeriods    = periodsRes.data;

      setLoads(allLoads);
      setActivities(allActivities);
      setPeriods(allPeriods);

      if (allLoads.length > 0) {
        await cargarEstudiantesConPromedios(allLoads[0].id, allActivities, allPeriods);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carga estudiantes y calcula promedios simples usando /grades/average normalizado
  const cargarEstudiantesConPromedios = async (loadId, allActivities, allPeriods) => {
    try {
      setLoadingStudents(true);

      const studRes = await getStudentsByLoad(loadId);
      const formatted = studRes.data.map((m) => ({
        id: m.usuarios.id,
        nombre: `${m.usuarios.apellidos}, ${m.usuarios.nombres}`,
        promedio: null,
      }));

      // Mostrar estudiantes de inmediato
      setStudentsByLoad((prev) => ({ ...prev, [loadId]: formatted }));

      const periodoActivo = getPeriodoActivo(allPeriods);
      if (!periodoActivo || formatted.length === 0) return;

      // Actividades de esta carga en el periodo activo y su suma de porcentajes
      const actividadesCarga = allActivities.filter(
        (a) => a.carga_academica_id === parseInt(loadId) &&
               a.periodo_id === periodoActivo.id
      );
      const sumaPorcentajes = actividadesCarga.reduce(
        (acc, a) => acc + parseFloat(a.porcentaje || 0), 0
      );
      if (actividadesCarga.length === 0) return;

      // Promedios ponderados del back, normalizados por suma real de porcentajes
      const promedios = await Promise.all(
        formatted.map(async (s) => {
          try {
            const r = await api.get(
              `/grades/average/${s.id}/${loadId}/${periodoActivo.id}`
            );
            const pw = parseFloat(r.data.promedio ?? 0);
            // Normalizar: dividir entre (sumaPorcentajes/100) para obtener nota real
            const promedio = sumaPorcentajes > 0
              ? Math.min(5, pw / (sumaPorcentajes / 100))
              : null;
            return { id: s.id, promedio };
          } catch {
            return { id: s.id, promedio: null };
          }
        })
      );

      const promedioMap = Object.fromEntries(promedios.map((p) => [p.id, p.promedio]));

      setStudentsByLoad((prev) => ({
        ...prev,
        [loadId]: formatted.map((s) => ({
          ...s,
          promedio: promedioMap[s.id] !== undefined ? promedioMap[s.id] : null,
        })),
      }));
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
      setStudentsByLoad((prev) => ({ ...prev, [loadId]: [] }));
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSelectLoad = async (index) => {
    setActiveLoadIndex(index);
    setCurrentPage(1);
    setSaveMsg("");
    const load = loads[index];
    if (load) await cargarEstudiantesConPromedios(load.id, activities, periods);
  };

  // Refresca los promedios de la tabla con los datos actuales del back
  const handleRefreshPromedios = async () => {
    if (!activeLoad) return;
    await cargarEstudiantesConPromedios(activeLoad.id, activities, periods);
    setSaveMsg("✅ Vista actualizada correctamente.");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const activeLoad       = loads[activeLoadIndex] ?? null;
  const currentStudents  = activeLoad ? (studentsByLoad[activeLoad.id] ?? []) : [];
  const stats            = computeStats(currentStudents);
  const totalPages       = Math.max(1, Math.ceil(currentStudents.length / STUDENTS_PER_PAGE));
  const paginatedStudents = currentStudents.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );
  const periodoActivo    = getPeriodoActivo(periods);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo-box">
            <h2>Virtual Campus</h2>
            <p>Gestión Académica</p>
          </div>
          <button className="sidebar-btn active-btn" onClick={() => setOpenGradePanel(true)}>
            <FaFileUpload /><span>Cargar Notas</span>
          </button>
        </div>
        <div className="sidebar-links">
          <p onClick={handleLogout}>Cerrar Sesión <FiLogOut /></p>
        </div>
      </aside>

      <div className="main-wrapper">
        <div className="topbar">
          <h2 className="brand">GradesBook</h2>
          <div className="topbar-right">
            <input type="text" placeholder="Buscar alumnos..." className="search-input" />
            <div className="profile-avatar">{getPrimerInicial()}</div>
          </div>
        </div>

        <div className="TeachersMain-page">
          <div className="main-header">
            <div>
              <span className="top-text">GESTIÓN DE CALIFICACIONES</span>
              <h1>Cargar Notas</h1>
              <p>Selecciona una materia y actividad para registrar las calificaciones.</p>
            </div>
            <div className="period-box">
              <FaCalendarAlt />
              <span>{periodoActivo ? periodoActivo.nombre : "Sin periodo activo"}</span>
            </div>
          </div>

          <div className="main-content">
            {/* MATERIAS */}
            <div className="subjects-section scroll-box">
              <h2>Mis Clases Activas</h2>
              {loading ? (
                <p className="tm-empty-msg">Cargando materias...</p>
              ) : loads.length === 0 ? (
                <p className="tm-empty-msg">No tienes materias asignadas.</p>
              ) : loads.map((load, index) => (
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
              ))}
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
                    <button
                      className="save-btn save-btn--secondary"
                      onClick={() => setOpenActivityModal(true)}
                    >
                      <FaPlus /> Nueva Actividad
                    </button>
                    <button
                      className="save-btn"
                      onClick={handleRefreshPromedios}
                      disabled={loadingStudents}
                    >
                      {loadingStudents ? "Actualizando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </div>


                {/* TABLA */}
                <div className="students-table">
                  <div className="tm-table-head">
                    <span>ALUMNO</span>
                    <span>NOTA PARCIAL</span>
                  </div>

                  {loadingStudents ? (
                    <div className="table-loading">Cargando alumnos...</div>
                  ) : paginatedStudents.length === 0 ? (
                    <div className="table-loading">
                      {loading ? "Cargando..." : "Sin alumnos matriculados."}
                    </div>
                  ) : paginatedStudents.map((student) => {
                    const colors = getColorFromName(student.nombre);
                    const nota = student.promedio;
                    return (
                      <div className="tm-table-row" key={student.id}>
                        <div className="tm-student-cell">
                          <div
                            className="tm-avatar"
                            style={{ background: colors.bg, color: colors.color }}
                          >
                            {getInitials(student.nombre)}
                          </div>
                          <div className="tm-student-info">
                            <span className="tm-student-apellido">
                              {student.nombre.split(",")[0]?.trim()}
                            </span>
                            <span className="tm-student-nombre">
                              {student.nombre.split(",")[1]?.trim()}
                            </span>
                          </div>
                        </div>
                        <div className={`tm-grade-pill ${
                          nota !== null && nota < 3.0
                            ? "tm-grade-pill--low"
                            : nota !== null
                              ? "tm-grade-pill--ok"
                              : "tm-grade-pill--empty"
                        }`}>
                          {nota !== null ? nota.toFixed(2) : "--"}
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* FOOTER */}
                <div className="table-footer">
                  <div className="footer-left">
                    <span>
                      {currentStudents.length} alumno{currentStudents.length !== 1 ? "s" : ""}
                    </span>
                    {saveMsg && <span className="save-msg">{saveMsg}</span>}
                  </div>
                  <div className="footer-right">
                    <div className="pagination">
                      <button
                        className="page-btn"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >‹</button>
                      <span>Pág. {currentPage}/{totalPages}</span>
                      <button
                        className="page-btn"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >›</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-blue">↗</span>
              <span>Promedio General:</span>
              <strong className="stat-blue">{stats.avg}</strong>
            </div>
            <div className="stat-item">
              <span className="stat-green">✔</span>
              <span>{stats.pct}% Calificado</span>
            </div>
          </div>
        </div>
      </div>

      {openActivityModal && (
        <ActivityModal
          loads={loads}
          periods={periods}
          onClose={() => setOpenActivityModal(false)}
          onSave={loadData}
        />
      )}
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