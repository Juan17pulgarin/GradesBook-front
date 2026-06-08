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

// Colores de avatar según índice
const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#2563eb" },
  { bg: "#fce7f3", color: "#db2777" },
  { bg: "#d1fae5", color: "#059669" },
  { bg: "#fef3c7", color: "#d97706" },
  { bg: "#ede9fe", color: "#7c3aed" },
  { bg: "#fee2e2", color: "#dc2626" },
];

function getAvatarColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// Iniciales a partir de "Apellido, Nombre"
function getInitials(nombre) {
  const parts = nombre.replace(",", "").trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() || "?";
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
  return periods.find((p) =>
    hoy >= new Date(p.fecha_inicio) && hoy <= new Date(p.fecha_fin)
  ) || periods[periods.length - 1];
}

/* ── MODAL CARGAR NOTAS ── */
function GradePanelModal({ loads, activities, onClose, onSave }) {
  const [selectedLoadId, setSelectedLoadId] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [checkingActivities, setCheckingActivities] = useState(false);
  const [activitiesForLoad, setActivitiesForLoad] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSelectLoad = async (loadId) => {
    setSelectedLoadId(loadId);
    setSelectedActivity("");
    setGrades({});
    setError(""); setSuccessMsg("");
    setActivitiesForLoad([]);
    if (!loadId) { setStudents([]); return; }
    try {
      setLoadingStudents(true);
      const res = await getStudentsByLoad(loadId);
      const loaded = res.data.map((m) => ({
        id: m.usuarios.id,
        nombre: `${m.usuarios.apellidos}, ${m.usuarios.nombres}`,
      }));
      setStudents(loaded);

      // Filtrar actividades con notas pendientes
      setCheckingActivities(true);
      const candidatas = activities.filter((a) => a.carga_academica_id === parseInt(loadId));
      const pendientes = [];
      for (const act of candidatas) {
        try {
          const gr = await getGradesByActivity(act.id);
          const conNota = new Set(gr.data.map((g) => g.estudiante_id));
          if (loaded.some((s) => !conNota.has(s.id))) pendientes.push(act);
        } catch {
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
                  <option key={a.id} value={a.id}>{a.nombre} ({a.periodos?.nombre})</option>
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
              ) : students.map((s, i) => {
                const colors = getAvatarColor(i);
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
  const [form, setForm] = useState({ nombre: "", carga_academica_id: "", periodo_id: "", porcentaje: "", fecha: "" });
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
              <input name="nombre" placeholder="Ej: Parcial 1, Taller..." value={form.nombre} onChange={handleChange} />
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
      // Reset cache so next load refreshes data
      setStudentsByLoad({});
      if (loadsRes.data.length > 0) {
        await fetchStudentsForLoad(loadsRes.data[0].id, {}, periodsRes.data);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForLoad = async (loadId, existingCache, allPeriods) => {
    const cache = existingCache ?? studentsByLoad;
    if (cache[loadId]) return;
    try {
      setLoadingStudents(true);
      const res = await getStudentsByLoad(loadId);
      const formatted = res.data.map((m) => ({
        id: m.usuarios.id,
        nombre: `${m.usuarios.apellidos}, ${m.usuarios.nombres}`,
        promedio: null,
      }));
      // Guardar primero sin promedios
      setStudentsByLoad((prev) => ({ ...prev, [loadId]: formatted }));

      // Cargar promedio de cada estudiante en paralelo
      const periodsToUse = allPeriods ?? periods;
      const periodoActivo = getPeriodoActivo(periodsToUse);
      if (periodoActivo && formatted.length > 0) {
        const promedios = await Promise.all(
          formatted.map(async (s) => {
            try {
              const r = await api.get(`/grades/average/${s.id}/${loadId}/${periodoActivo.id}`);
              return { id: s.id, promedio: parseFloat(r.data.promedio ?? 0) || null };
            } catch {
              return { id: s.id, promedio: null };
            }
          })
        );
        const promedioMap = Object.fromEntries(promedios.map((p) => [p.id, p.promedio]));
        setStudentsByLoad((prev) => ({
          ...prev,
          [loadId]: (prev[loadId] ?? formatted).map((s) => ({
            ...s,
            promedio: promedioMap[s.id] !== undefined ? promedioMap[s.id] : null,
          })),
        }));
      }
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
      setStudentsByLoad((prev) => ({ ...prev, [loadId]: [] }));
    } finally {
      setLoadingStudents(false);
    }
  };

  // Al seleccionar actividad: cargar nota de esa actividad Y promedio general del estudiante
  const handleActivityChange = async (activityId) => {
    setSelectedActivity(activityId);
    setSaveMsg("");
    const loadId = activeLoad?.id;
    if (!activityId || !loadId) return;

    try {
      // 1. Notas de la actividad seleccionada
      const gradesRes = await getGradesByActivity(activityId);
      const gradeMap = {};
      gradesRes.data.forEach((g) => {
        gradeMap[g.estudiante_id] = parseFloat(g.nota);
      });

      // 2. Promedio por estudiante en esta carga + periodo activo
      const periodoActivo = getPeriodoActivo(periods);
      const students = studentsByLoad[loadId] || [];

      const promedioMap = {};
      if (periodoActivo) {
        await Promise.all(students.map(async (s) => {
          try {
            const avgRes = await api.get(
              `/grades/average/${s.id}/${loadId}/${periodoActivo.id}`
            );
            promedioMap[s.id] = parseFloat(avgRes.data.promedio ?? 0);
          } catch {
            promedioMap[s.id] = null;
          }
        }));
      }

      setStudentsByLoad((prev) => ({
        ...prev,
        [loadId]: (prev[loadId] || []).map((s) => ({
          ...s,
          // nota de la actividad seleccionada para la columna "Nota Registrada"
          notaActividad: gradeMap[s.id] !== undefined ? gradeMap[s.id] : null,
          // promedio real del estudiante en la carga/periodo
          promedio: promedioMap[s.id] !== undefined ? promedioMap[s.id] : null,
        })),
      }));
    } catch {
      // silencioso
    }
  };

  const handleSelectLoad = async (index) => {
    setActiveLoadIndex(index);
    setCurrentPage(1);
    setSelectedActivity("");
    setSaveMsg("");
    const load = loads[index];
    if (load) {
      // Limpiar cache de esta carga para forzar recarga con promedios frescos
      setStudentsByLoad((prev) => {
        const next = { ...prev };
        delete next[load.id];
        return next;
      });
      await fetchStudentsForLoad(load.id, {}, undefined);
    }
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

    setSavingAll(true); setSaveMsg("");
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
    setPendingGrades((prev) => ({ ...prev, [loadId]: {} }));
    setSavingAll(false);
    // Refrescar promedios tras guardar
    if (ok > 0) {
      const periodoActivo = getPeriodoActivo(periods);
      if (periodoActivo && activeLoad) {
        const updated = await Promise.all(
          (studentsByLoad[activeLoad.id] || []).map(async (s) => {
            try {
              const r = await api.get(`/grades/average/${s.id}/${activeLoad.id}/${periodoActivo.id}`);
              return { id: s.id, promedio: parseFloat(r.data.promedio ?? 0) || null };
            } catch { return { id: s.id, promedio: null }; }
          })
        );
        const map = Object.fromEntries(updated.map((p) => [p.id, p.promedio]));
        setStudentsByLoad((prev) => ({
          ...prev,
          [activeLoad.id]: (prev[activeLoad.id] || []).map((s) => ({
            ...s,
            promedio: map[s.id] !== undefined ? map[s.id] : s.promedio,
          })),
        }));
      }
    }
    if (fail > 0 && ok === 0) setSaveMsg("❌ No se guardaron (ya existen o hubo un error).");
    else if (fail > 0) setSaveMsg(`✅ ${ok} guardadas. ❌ ${fail} ya existían.`);
    else setSaveMsg(`✅ ${ok} nota(s) guardadas correctamente.`);
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
                    <div className="subject-badge">{index === activeLoadIndex ? "EN CURSO" : "PENDIENTE"}</div>
                    <h3>{load.materias?.nombre}</h3>
                    <p>{load.cursos?.nombre}</p>
                    <small>{studentsByLoad[load.id] ? `${studentsByLoad[load.id].length} alumnos` : "—"}</small>
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
                    {activeLoad && <p>{activeLoad.materias?.nombre} — {activeLoad.cursos?.nombre}</p>}
                  </div>
                  <div className="students-header-actions">
                    <button className="excel-btn"><FaFileExcel /><span>Planilla Excel</span></button>
                    <button className="save-btn save-btn--secondary" onClick={() => setOpenActivityModal(true)}>
                      <FaPlus /> Nueva Actividad
                    </button>
                    <button className="save-btn" onClick={handleSaveChanges} disabled={savingAll || !selectedActivity}>
                      {savingAll ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </div>

                {/* TABLA */}
                <div className="students-table">
                  <div className="tm-table-head">
                    <span>ALUMNO</span>
                    <span>NOTA PARCIAL</span>
                    <span>NUEVA NOTA</span>
                  </div>

                  {loadingStudents ? (
                    <div className="table-loading">Cargando alumnos...</div>
                  ) : paginatedStudents.length === 0 ? (
                    <div className="table-loading">{loading ? "Cargando..." : "Sin alumnos matriculados."}</div>
                  ) : paginatedStudents.map((student, idx) => {
                    const colors = getAvatarColor((currentPage - 1) * STUDENTS_PER_PAGE + idx);
                    const pendingVal = activePending[student.id] || "";
                    const nota = student.promedio;
                    return (
                      <div className="tm-table-row" key={student.id}>
                        {/* ALUMNO */}
                        <div className="tm-student-cell">
                          <div className="tm-avatar" style={{ background: colors.bg, color: colors.color }}>
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
                        {/* NOTA PARCIAL */}
                        <div className={`tm-grade-pill ${nota !== null && nota < 3.0 ? "tm-grade-pill--low" : nota !== null ? "tm-grade-pill--ok" : "tm-grade-pill--empty"}`}>
                          {nota !== null ? nota.toFixed(2) : "--"}
                        </div>
                        {/* NUEVA NOTA */}
                        <input
                          className="grade-input"
                          type="number" step="0.1" min="1" max="5"
                          placeholder="—"
                          value={pendingVal}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* FOOTER */}
                <div className="table-footer">
                  <div className="footer-left">
                    <span>{currentStudents.length} alumno{currentStudents.length !== 1 ? "s" : ""}</span>
                    {saveMsg && <span className="save-msg">{saveMsg}</span>}
                  </div>
                  <div className="footer-right">
                    <div className="pagination">
                      <button className="page-btn" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>‹</button>
                      <span>Pág. {currentPage}/{totalPages}</span>
                      <button className="page-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>›</button>
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
        <ActivityModal loads={loads} periods={periods}
          onClose={() => setOpenActivityModal(false)} onSave={loadData} />
      )}
      {openGradePanel && (
        <GradePanelModal loads={loads} activities={activities}
          onClose={() => setOpenGradePanel(false)} onSave={loadData} />
      )}
    </div>
  );
}

export default TeachersMain;