import { useState, useEffect } from "react";
import { updateUser, deactivateUser } from "../../services/userService";
import { getCourses } from "../../services/courseService";
import { getSubjects } from "../../services/subjectService";
import { getAcademicLoads, createAcademicLoad } from "../../services/academicLoadService";
import { createEnrollment } from "../../services/enrollmentService";

import { MdOutlineMailOutline } from "react-icons/md";
import { FaIdCard } from "react-icons/fa";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { FiAlertTriangle } from "react-icons/fi";

import "./UserModal.css";

export default function EditUserModal({ user, onClose, onSuccess }) {

    const isActivo = user.activo !== false;

    // ❌ TELEFONO ELIMINADO
    const [form, setForm] = useState({
        nombres: user.nombres || "",
        apellidos: user.apellidos || "",
        email: user.email || "",
        documento: user.documento || "",
    });

    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [academicLoads, setAcademicLoads] = useState([]);

    const [loadForm, setLoadForm] = useState({
        materia_id: "",
        curso_id: "",
    });

    const [enrollForm, setEnrollForm] = useState({
        curso_id: "",
    });

    const [loading, setLoading] = useState(false);
    const [activating, setActivating] = useState(false);
    const [error, setError] = useState("");

    // 🔥 SIEMPRE cargar datos (no solo si está vacío)
    useEffect(() => {
        Promise.all([
            getSubjects(),
            getCourses(),
            getAcademicLoads(),
        ])
            .then(([subjectsRes, coursesRes, loadsRes]) => {
                setSubjects(subjectsRes.data);
                setCourses(coursesRes.data);
                setAcademicLoads(loadsRes.data);
            })
            .catch((err) => console.error("Error cargando datos:", err));
    }, []);

    const availableSubjects = loadForm.curso_id
        ? subjects.filter((subject) => {
            const alreadyAssigned = academicLoads.some(
                (load) =>
                    load.materia_id === subject.id &&
                    load.curso_id === parseInt(loadForm.curso_id)
            );
            return !alreadyAssigned;
        })
        : subjects;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLoadChange = (e) => {
        const updated = { ...loadForm, [e.target.name]: e.target.value };
        if (e.target.name === "curso_id") {
            updated.materia_id = "";
        }
        setLoadForm(updated);
    };

    // 🔥 SUBMIT CORREGIDO
    const handleSubmit = async () => {
        setError("");

        if (!form.nombres || !form.apellidos || !form.email || !form.documento) {
            setError("Completa los campos obligatorios");
            return;
        }

        setLoading(true);

        try {
            const institucion_id = Number(localStorage.getItem("institucion_id"));

            if (!institucion_id || Number.isNaN(institucion_id)) {
                throw new Error("INSTITUCION_ID_INVALID");
            }

            const dataToSend = { ...form, institucion_id };

            await updateUser(user.id, dataToSend);

            // 👨‍🎓 ESTUDIANTE → asignar o cambiar curso
            if (user.tipo === "ESTUDIANTE" && enrollForm.curso_id) {
                await createEnrollment({
                    estudiante_id: user.id,
                    curso_id: parseInt(enrollForm.curso_id),
                });
            }

            // 👨‍🏫 DOCENTE → asignar o cambiar carga académica
            if (user.tipo === "DOCENTE" && loadForm.curso_id && loadForm.materia_id) {
                await createAcademicLoad({
                    docente_id: user.id,
                    materia_id: parseInt(loadForm.materia_id),
                    curso_id: parseInt(loadForm.curso_id),
                });
            }

            onSuccess();

        } catch (err) {
            if (err.message === "INSTITUCION_ID_INVALID") {
                setError("Error interno: institución no definida.");
            } else {
                setError(err.response?.data?.message || "Error al guardar");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async () => {
        setActivating(true);
        setError("");
        try {
            await deactivateUser(user.id, true);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Error al reactivar el usuario.");
        } finally {
            setActivating(false);
        }
    };

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <div>
                        <h2>Editar {user.tipo === "ESTUDIANTE" ? "Estudiante" : "Docente"}</h2>
                        <p>GESTIÓN DE PERSONAL ACADÉMICO</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* USUARIO INACTIVO */}
                {!isActivo && (
                    <div className="modal-inactive-banner">
                        <span><FiAlertTriangle /> Usuario <strong>inactivo</strong></span>
                        <button
                            className="btn-reactivate"
                            onClick={handleActivate}
                            disabled={activating}
                        >
                            <MdOutlinePersonAddAlt />
                            {activating ? "Reactivando..." : "Reactivar"}
                        </button>
                    </div>
                )}

                <div className="modal-body">
                    <div className="form-grid">

                        <div className="form-group">
                            <label>Nombres *</label>
                            <input
                                name="nombres"
                                value={form.nombres}
                                onChange={handleChange}
                                disabled={!isActivo}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <div className="input-icon">
                                <span><MdOutlineMailOutline /></span>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    disabled={!isActivo}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Apellidos *</label>
                            <input
                                name="apellidos"
                                value={form.apellidos}
                                onChange={handleChange}
                                disabled={!isActivo}
                            />
                        </div>

                        <div className="form-group">
                            <label>Documento *</label>
                            <div className="input-icon">
                                <span><FaIdCard /></span>
                                <input
                                    name="documento"
                                    value={form.documento}
                                    onChange={handleChange}
                                    disabled={!isActivo}
                                />
                            </div>
                        </div>

                        {/* 👨‍🎓 ESTUDIANTE */}
                        {user.tipo === "ESTUDIANTE" && (
                            <div className="form-group">
                                <label>Curso (Grado)</label>
                                <select
                                    value={enrollForm.curso_id}
                                    onChange={(e) =>
                                        setEnrollForm({ curso_id: Number(e.target.value) })
                                    }
                                    disabled={!isActivo}
                                >
                                    <option value="">Selecciona un curso</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 👨‍🏫 DOCENTE */}
                        {user.tipo === "DOCENTE" && (
                            <>
                                <div className="form-group">
                                    <label>Curso</label>
                                    <select
                                        name="curso_id"
                                        value={loadForm.curso_id || ""}
                                        onChange={handleLoadChange}
                                        disabled={!isActivo}
                                    >
                                        <option value="">Selecciona un curso</option>

                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Materia</label>
                                    <select
                                        value={loadForm.materia_id}
                                        onChange={(e) =>
                                            setLoadForm({ ...loadForm, materia_id: Number(e.target.value) })
                                        }
                                        disabled={!isActivo || !loadForm.curso_id}
                                    >
                                        <option value="">
                                            {!loadForm.curso_id
                                                ? "Primero selecciona un curso"
                                                : "Selecciona una materia"}
                                        </option>

                                        {availableSubjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                    </div>

                    {error && <p className="modal-error">{error}</p>}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancelar
                    </button>

                    {isActivo && (
                        <button
                            className="submit-btn"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Guardando..." : "Guardar Cambios →"}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}