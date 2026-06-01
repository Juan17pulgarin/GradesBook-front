import { useState, useEffect } from "react";

import { createUser } from "../../services/userService";
import { getSubjects, createSubject } from "../../services/subjectService";
import { getCourses, createCourse } from "../../services/courseService";
import { createAcademicLoad } from "../../services/academicLoadService";
import { createEnrollment } from "../../services/enrollmentService";

import { MdOutlineMailOutline } from "react-icons/md";
import { FaIdCard } from "react-icons/fa";
import { HiOutlineLockClosed } from "react-icons/hi";
import { MdOutlineCall } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { IoMdEyeOff } from "react-icons/io";


import "./UserModal.css";

export default function UserModal({ tipo, onClose, onSuccess }) {

    const [step, setStep] = useState(1);
    const [createdUser, setCreatedUser] = useState(null);

    /* TIPOS */

    const isCourse = tipo === "CURSO";
    const isSubject = tipo === "MATERIA";

    /* CURSO */

    const [courseForm, setCourseForm] = useState({
        nombre: "",
        anio: "",
        capacidad_maxima: "",
    });

    /* MATERIA */

    const [subjectForm, setSubjectForm] = useState({
        nombre: "",
    });

    /* USUARIO */

    const [form, setForm] = useState({
        nombres: "",
        apellidos: "",
        email: "",
        password: "",
        documento: "",
        telefono: "",
        tipo: tipo,
    });

    /* DOCENTE */

    const [loadForm, setLoadForm] = useState({
        materia_id: "",
        curso_id: "",
    });

    /* ESTUDIANTE */

    const [enrollForm, setEnrollForm] = useState({
        curso_id: "",
    });

    /* LISTAS */

    const [subjects, setSubjects] = useState([]);
    const [courses, setCourses] = useState([]);

    /* GENERALES */

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    /* CARGAR DATOS */

    useEffect(() => {

        Promise.all([
            getSubjects(),
            getCourses(),
        ])
            .then(([subjectsRes, coursesRes]) => {

                setSubjects(subjectsRes.data);
                setCourses(coursesRes.data);

            })
            .catch(err =>
                console.error("Error cargando datos:", err)
            );

    }, []);

    /* HANDLES */

    const handleChange = (e) =>
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    const handleLoadChange = (e) =>
        setLoadForm({
            ...loadForm,
            [e.target.name]: e.target.value
        });

    const handleEnrollChange = (e) =>
        setEnrollForm({
            ...enrollForm,
            [e.target.name]: e.target.value
        });

    const handleCourseChange = (e) =>
        setCourseForm({
            ...courseForm,
            [e.target.name]: e.target.value,
        });

    const handleSubjectChange = (e) =>
        setSubjectForm({
            ...subjectForm,
            [e.target.name]: e.target.value,
        });

    /* CREAR USUARIO */

    const handleCreateUser = async () => {

        setError("");

        if (
            !form.nombres ||
            !form.apellidos ||
            !form.email ||
            !form.password ||
            !form.documento
        ) {

            setError("Por favor completa todos los campos obligatorios.");
            return;

        }

        setLoading(true);

        try {

            const res = await createUser(form)

            setCreatedUser(res.data.user);

            setStep(2);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Error al crear el usuario."
            );

        } finally {

            setLoading(false);

        }

    };

    /* CREAR CURSO */

    const handleCreateCourse = async () => {

        setError("");

        if (
            !courseForm.nombre ||
            !courseForm.anio ||
            !courseForm.capacidad_maxima
        ) {

            setError("Completa todos los campos.");
            return;

        }

        setLoading(true);

        try {

            await createCourse({
                nombre: courseForm.nombre,
                anio: parseInt(courseForm.anio),
                capacidad_maxima: parseInt(courseForm.capacidad_maxima),
            });

            onSuccess();
            onClose();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Error al crear curso."
            );

        } finally {

            setLoading(false);

        }

    };

    /* CREAR MATERIA */

    const handleCreateSubject = async () => {

        setError("");

        if (!subjectForm.nombre) {

            setError("Ingresa el nombre de la materia.");
            return;

        }

        setLoading(true);

        try {

            await createSubject({
                nombre: subjectForm.nombre,
            });

            onSuccess();
            onClose();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Error al crear materia."
            );

        } finally {

            setLoading(false);

        }

    };

    /* ASIGNAR */

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

                await createAcademicLoad({
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

                await createEnrollment( {
                    estudiante_id: createdUser.id,
                    curso_id: parseInt(enrollForm.curso_id),
                });

            }

            onSuccess();
            onClose();

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Error al realizar la asignación."
            );

        } finally {

            setLoading(false);

        }

    };

    const handleSkip = () => {

        onSuccess();
        onClose();

    };

    const label =
        tipo === "DOCENTE"
            ? "Docente"
            : tipo === "ESTUDIANTE"
                ? "Estudiante"
                : tipo === "MATERIA"
                    ? "Materia"
                    : "Curso";

    return (

        <div className="modal" onClick={onClose}>

            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >

                {/* HEADER */}

                <div className="modal-header">

                    <div>

                        <h2>

                            {isCourse
                                ? "Crear Nuevo Curso"
                                : isSubject
                                    ? "Crear Nueva Materia"
                                    : step === 1
                                        ? `Añadir Nuevo ${label}`
                                        : tipo === "DOCENTE"
                                            ? "Asignar Materia y Curso"
                                            : "Asignar Curso"}

                        </h2>

                        <p>

                            {isCourse || isSubject
                                ? "GESTIÓN ACADÉMICA"
                                : step === 1
                                    ? "GESTIÓN DE PERSONAL ACADÉMICO"
                                    : `PASO 2 DE 2 — ${createdUser?.nombres} ${createdUser?.apellidos}`}

                        </p>

                    </div>

                    <button
                        className="close-btn"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                </div>

                {/* STEPS */}

                {!isCourse && !isSubject && (

                    <div className="modal-steps">

                        <div className={`step ${step >= 1 ? "active" : ""}`}>
                            1. Datos
                        </div>

                        <div className="step-divider" />

                        <div className={`step ${step >= 2 ? "active" : ""}`}>
                            2. Asignación
                        </div>

                    </div>

                )}

                {/* BODY */}

                <div className="modal-body">

                    {/* CURSO */}

                    {isCourse && (

                        <div className="form-grid">

                            <div className="form-group">

                                <label>Nombre del Curso *</label>

                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Ej: Sexto B"
                                    value={courseForm.nombre}
                                    onChange={handleCourseChange}
                                />

                            </div>

                            <div className="form-group">

                                <label>Año *</label>

                                <input
                                    type="number"
                                    name="anio"
                                    placeholder="2025"
                                    value={courseForm.anio}
                                    onChange={handleCourseChange}
                                />

                            </div>

                            <div className="form-group">
                                <label>Email Institucional *</label>
                                <div className="input-icon">
                                    <span><MdOutlineMailOutline /></span>
                                    <input name="email" type="email" placeholder="juan@gradesbook.com"
                                        value={form.email} onChange={handleChange} />
                                </div>

                                <label>Capacidad Máxima *</label>

                                <input
                                    type="number"
                                    name="capacidad_maxima"
                                    placeholder="35"
                                    value={courseForm.capacidad_maxima}
                                    onChange={handleCourseChange}
                                />

                            </div>

                        </div>

                    )}

                    {/* MATERIA */}

                    {isSubject && (

                        <div className="form-grid">

                            <div className="form-group">

                                <label>Nombre de la Materia *</label>

                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Ej: Matemáticas"
                                    value={subjectForm.nombre}
                                    onChange={handleSubjectChange}
                                />

                            </div>

                        </div>

                    )}

                    {/* PASO 1 */}

                    {step === 1 && !isCourse && !isSubject && (

                        <div className="form-grid">

                            <div className="form-group">

                                <label>Nombres *</label>

                                <input
                                    name="nombres"
                                    type="text"
                                    placeholder="Ej: Juan"
                                    value={form.nombres}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label>Apellidos *</label>

                                <input
                                    name="apellidos"
                                    type="text"
                                    placeholder="Ej: Pérez"
                                    value={form.apellidos}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label>Email *</label>

                                <input
                                    name="email"
                                    type="email"
                                    placeholder="correo@gradesbook.com"
                                    value={form.email}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="form-group">

                                <label>Password *</label>

                                <div className="input-icon">
                                    <span><HiOutlineLockClosed /></span>
                                    <input name="password" type={showPassword ? "text" : "password"}
                                        placeholder="Mínimo 8 caracteres"
                                        value={form.password} onChange={handleChange} />
                                    <button type="button" className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <IoMdEyeOff /> : <FaEye />}
                                    </button>

                                </div>

                            </div>

                            <div className="form-group">

                                <label>Documento *</label>
                                <div className="input-icon">
                                    <span><FaIdCard /></span>
                                    <input name="documento" type="text" placeholder="Ej: 1102715657"
                                        value={form.documento} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">

                                <label>Teléfono</label>
                                <div className="input-icon">
                                    <span><MdOutlineCall />
</span>
                                    <input name="telefono" type="text" placeholder="Ej: 3132794970"
                                        value={form.telefono} onChange={handleChange} />
                                </div>
                            </div>

                        </div>

                    )}

                    {/* PASO 2 */}

                    {step === 2 && tipo === "DOCENTE" && (

                        <div className="form-grid">

                            <div className="form-group">

                                <label>Materia *</label>

                                <select
                                    name="materia_id"
                                    value={loadForm.materia_id}
                                    onChange={handleLoadChange}
                                >
                                    <option value="">
                                        Selecciona una materia
                                    </option>

                                    {subjects.map((subject) => (
                                        <option
                                            key={subject.id}
                                            value={subject.id}
                                        >
                                            {subject.nombre}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            <div className="form-group">

                                <label>Curso *</label>

                                <select
                                    name="curso_id"
                                    value={loadForm.curso_id}
                                    onChange={handleLoadChange}
                                >
                                    <option value="">
                                        Selecciona un curso
                                    </option>

                                    {courses.map((course) => (
                                        <option
                                            key={course.id}
                                            value={course.id}
                                        >
                                            {course.nombre}
                                        </option>
                                    ))}

                                </select>

                            </div>

                        </div>

                    )}

                    {step === 2 && tipo === "ESTUDIANTE" && (

                        <div className="form-grid">

                            <div className="form-group">

                                <label>Curso *</label>

                                <select
                                    name="curso_id"
                                    value={enrollForm.curso_id}
                                    onChange={handleEnrollChange}
                                >
                                    <option value="">
                                        Selecciona un curso
                                    </option>

                                    {courses.map((course) => (
                                        <option
                                            key={course.id}
                                            value={course.id}
                                        >
                                            {course.nombre}
                                        </option>
                                    ))}

                                </select>

                            </div>

                        </div>

                    )}

                    {error && (
                        <p className="modal-error">
                            {error}
                        </p>
                    )}

                </div>

                {/* FOOTER */}

                <div className="modal-footer">

                    {isCourse && (

                        <>

                            <button
                                className="cancel-btn"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>

                            <button
                                className="submit-btn"
                                onClick={handleCreateCourse}
                                disabled={loading}
                            >
                                {loading
                                    ? "Creando..."
                                    : "Crear Curso →"}
                            </button>

                        </>

                    )}

                    {isSubject && (

                        <>

                            <button
                                className="cancel-btn"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>

                            <button
                                className="submit-btn"
                                onClick={handleCreateSubject}
                                disabled={loading}
                            >
                                {loading
                                    ? "Creando..."
                                    : "Crear Materia →"}
                            </button>

                        </>

                    )}

                    {step === 1 && !isCourse && !isSubject && (

                        <>

                            <button
                                className="cancel-btn"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>

                            <button
                                className="submit-btn"
                                onClick={handleCreateUser}
                                disabled={loading}
                            >
                                {loading
                                    ? "Creando..."
                                    : `Crear ${label} →`}
                            </button>

                        </>

                    )}

                    {step === 2 && !isCourse && !isSubject && (

                        <>

                            <button
                                className="cancel-btn"
                                onClick={handleSkip}
                            >
                                Omitir asignación
                            </button>

                            <button
                                className="submit-btn"
                                onClick={handleAssign}
                                disabled={loading}
                            >
                                {loading
                                    ? "Asignando..."
                                    : "Guardar Asignación →"}
                            </button>

                        </>

                    )}

                </div>

            </div>

        </div>

    );

}