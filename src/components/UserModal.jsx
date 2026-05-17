import { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/UserModal.css";

export default function UserModal({ tipo, onClose, onSuccess }) {
    const [step, setStep] = useState(1); // paso 1: datos usuario, paso 2: asignación
    const [createdUser, setCreatedUser] = useState(null);

    // Datos usuario
    const [form, setForm] = useState({
        nombres: "",
        apellidos: "",
        email: "",
        password: "",
        documento: "",
        telefono: "",
        tipo: tipo,
    });

    // Datos asignación docente
    const [loadForm, setLoadForm] = useState({
        materia_id: "",
        curso_id: "",
    });

    // Datos asignación estudiante
    const [enrollForm, setEnrollForm] = useState({
        curso_id: "",
    });

    // Listas del back
    const [subjects, setSubjects] = useState([]);
    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Cargar materias y cursos para los selects
        Promise.all([
            api.get("/subjects"),
            api.get("/courses"),
        ]).then(([subjectsRes, coursesRes]) => {
            setSubjects(subjectsRes.data);
            setCourses(coursesRes.data);
        }).catch(err => console.error("Error cargando datos:", err));
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleLoadChange = (e) => setLoadForm({ ...loadForm, [e.target.name]: e.target.value });
    const handleEnrollChange = (e) => setEnrollForm({ ...enrollForm, [e.target.name]: e.target.value });

    // Paso 1: crear usuario
    const handleCreateUser = async () => {
        setError("");
        if (!form.nombres || !form.apellidos || !form.email || !form.password || !form.documento) {
            setError("Por favor completa todos los campos obligatorios.");
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("/users", form);
            setCreatedUser(res.data.user);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Error al crear el usuario.");
        } finally {
            setLoading(false);
        }
    };

    // Paso 2: asignar materia/curso (docente) o curso (estudiante)
    const handleAssign = async () => {
        setError("");
        setLoading(true);
        try {
            if (tipo === "DOCENTE") {
                if (!loadForm.materia_id || !loadForm.curso_id) {
                    setError("Selecciona una materia y un curso.");
                    setLoading(false);
                    return;
                }
                await api.post("/academic-loads", {
                    docente_id: createdUser.id,
                    materia_id: parseInt(loadForm.materia_id),
                    curso_id: parseInt(loadForm.curso_id),
                });
            } else {
                if (!enrollForm.curso_id) {
                    setError("Selecciona un curso.");
                    setLoading(false);
                    return;
                }
                await api.post("/enrollments", {
                    estudiante_id: createdUser.id,
                    curso_id: parseInt(enrollForm.curso_id),
                });
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Error al realizar la asignación.");
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = () => {
        onSuccess();
        onClose();
    };

    const label = tipo === "DOCENTE" ? "Docente" : "Estudiante";

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2>
                            {step === 1
                                ? `Añadir Nuevo ${label}`
                                : tipo === "DOCENTE"
                                    ? "Asignar Materia y Curso"
                                    : "Asignar Curso"}
                        </h2>
                        <p>
                            {step === 1
                                ? "GESTIÓN DE PERSONAL ACADÉMICO"
                                : `PASO 2 DE 2 — ${createdUser?.nombres} ${createdUser?.apellidos}`}
                        </p>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Indicador de pasos */}
                <div className="modal-steps">
                    <div className={`step ${step >= 1 ? "active" : ""}`}>1. Datos</div>
                    <div className="step-divider" />
                    <div className={`step ${step >= 2 ? "active" : ""}`}>2. Asignación</div>
                </div>

                <div className="modal-body">

                    {/* ── PASO 1: Datos del usuario ── */}
                    {step === 1 && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nombres *</label>
                                <input name="nombres" type="text" placeholder="Ej: Juan"
                                    value={form.nombres} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Email Institucional *</label>
                                <div className="input-icon">
                                    <span>✉</span>
                                    <input name="email" type="email" placeholder="juan@gradesbook.com"
                                        value={form.email} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Apellidos *</label>
                                <input name="apellidos" type="text" placeholder="Ej: Pérez"
                                    value={form.apellidos} onChange={handleChange} />
                            </div>

                            <div className="form-group">
                                <label>Password *</label>
                                <div className="input-icon">
                                    <span>🔒</span>
                                    <input name="password" type={showPassword ? "text" : "password"}
                                        placeholder="Mínimo 8 caracteres"
                                        value={form.password} onChange={handleChange} />
                                    <button type="button" className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? "🙈" : "👁"}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Documento *</label>
                                <div className="input-icon">
                                    <span>🪪</span>
                                    <input name="documento" type="text" placeholder="Ej: 1102715657"
                                        value={form.documento} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Teléfono</label>
                                <div className="input-icon">
                                    <span>📞</span>
                                    <input name="telefono" type="text" placeholder="Ej: 3132794970"
                                        value={form.telefono} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PASO 2: Asignación docente ── */}
                    {step === 2 && tipo === "DOCENTE" && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Materia *</label>
                                <select name="materia_id" value={loadForm.materia_id} onChange={handleLoadChange}>
                                    <option value="">Selecciona una materia</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Curso *</label>
                                <select name="curso_id" value={loadForm.curso_id} onChange={handleLoadChange}>
                                    <option value="">Selecciona un curso</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ── PASO 2: Asignación estudiante ── */}
                    {step === 2 && tipo === "ESTUDIANTE" && (
                        <div className="form-grid single">
                            <div className="form-group">
                                <label>Curso *</label>
                                <select name="curso_id" value={enrollForm.curso_id} onChange={handleEnrollChange}>
                                    <option value="">Selecciona un curso</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Info box solo en paso 1 */}
                    {step === 1 && (
                        <div className="info-box">
                            <strong>✔ Verificación de Seguridad</strong>
                            <p>
                                Al registrar al {label.toLowerCase()}, se generarán automáticamente sus
                                credenciales de acceso y se le notificará vía correo electrónico institucional.
                            </p>
                        </div>
                    )}

                    {error && <p className="modal-error">{error}</p>}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    {step === 1 && (
                        <>
                            <button className="cancel-btn" onClick={onClose}>Cancelar</button>
                            <button className="submit-btn" onClick={handleCreateUser} disabled={loading}>
                                {loading ? "Creando..." : `Crear ${label} →`}
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <button className="cancel-btn" onClick={handleSkip}>
                                Omitir asignación
                            </button>
                            <button className="submit-btn" onClick={handleAssign} disabled={loading}>
                                {loading ? "Asignando..." : "Guardar Asignación →"}
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}