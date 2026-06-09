import { useEffect, useState } from "react";
import { getUsers } from "../../services/userService";
import { getSubjects } from "../../services/subjectService";
import { getAcademicLoads } from "../../services/academicLoadService";
import { getPeriods, createPeriod, updatePeriod } from "../../services/periodService";
import api from "../../api/api";

import StatCard from "../../components/Cards/StatCard";
import TeacherProgress from "../../components/Cards/TeacherProgress";
import GoalCard from "../../components/Cards/GoalCard";

import { FaArrowTrendUp } from "react-icons/fa6";
import { BiCloudUpload } from "react-icons/bi";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiPlus, FiX, FiEdit2 } from "react-icons/fi";

import "./MainPage.css";

export default function MainPage() {
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loads, setLoads] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Modal estado
    const [openPeriodModal, setOpenPeriodModal] = useState(false);
    const [promedioGeneral, setPromedioGeneral] = useState(null);
    const [periodForm, setPeriodForm] = useState({ fecha_inicio: "", fecha_fin: "" });
    const [periodError, setPeriodError] = useState("");
    const [periodLoading, setPeriodLoading] = useState(false);

    // Modal editar periodo
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ fecha_inicio: "", fecha_fin: "" });
    const [editError, setEditError] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const fetchPeriods = () =>
        getPeriods().then((res) => {
            setPeriods(res.data);
            if (res.data.length > 0) {
                const hoy = new Date();
                const periodoActivo = res.data.find((p) => {
                    const inicio = new Date(p.fecha_inicio);
                    const fin = new Date(p.fecha_fin);
                    return hoy >= inicio && hoy <= fin;
                });
                setSelectedPeriod((prev) =>
                    prev ? res.data.find((p) => p.id === prev.id) || res.data[0] : periodoActivo || res.data[0]
                );
            }
        });

    useEffect(() => {
        Promise.all([
            getUsers("DOCENTE"),
            getSubjects(),
            getAcademicLoads(),
            getPeriods(),
            api.get("/grades/school-average").catch(() => ({ data: null })),
        ])
            .then(([teachersRes, subjectsRes, loadsRes, periodsRes, schoolAvgRes]) => {
                setTeachers(teachersRes.data);
                setSubjects(subjectsRes.data);
                setLoads(loadsRes.data);
                setPeriods(periodsRes.data);

                if (periodsRes.data.length > 0) {
                    const hoy = new Date();
                    const periodoActivo = periodsRes.data.find((p) => {
                        const inicio = new Date(p.fecha_inicio);
                        const fin = new Date(p.fecha_fin);
                        return hoy >= inicio && hoy <= fin;
                    });
                    setSelectedPeriod(periodoActivo || periodsRes.data[0]);
                }
                if (schoolAvgRes?.data?.promedio_general != null) {
                    setPromedioGeneral(parseFloat(schoolAvgRes.data.promedio_general).toFixed(2));
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al traer datos:", err);
                setError(true);
                setLoading(false);
            });
    }, []);

    const docentesConCarga = teachers.filter((t) =>
        loads.some((l) => l.docente_id === t.id)
    ).length;

    const porcentajeCarga = teachers.length > 0
        ? Math.round((docentesConCarga / teachers.length) * 100)
        : 0;

    const currentIndex = periods.findIndex((p) => p.id === selectedPeriod?.id);

    const handlePrevPeriod = () => {
        if (currentIndex > 0) setSelectedPeriod(periods[currentIndex - 1]);
    };

    const handleNextPeriod = () => {
        if (currentIndex < periods.length - 1) setSelectedPeriod(periods[currentIndex + 1]);
    };

    const handleOpenModal = () => {
        setPeriodForm({ fecha_inicio: "", fecha_fin: "" });
        setPeriodError("");
        setOpenPeriodModal(true);
    };

    const handleCloseModal = () => {
        setOpenPeriodModal(false);
        setPeriodError("");
    };

    const handleOpenEditModal = () => {
        if (!selectedPeriod) return;
        // Convertir fecha ISO a formato YYYY-MM-DD para el input date
        const toInputDate = (isoStr) => isoStr ? isoStr.slice(0, 10) : "";
        setEditForm({
            fecha_inicio: toInputDate(selectedPeriod.fecha_inicio),
            fecha_fin: toInputDate(selectedPeriod.fecha_fin),
        });
        setEditError("");
        setOpenEditModal(true);
    };

    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setEditError("");
    };

    const handleSubmitEdit = async () => {
        if (!editForm.fecha_inicio || !editForm.fecha_fin) {
            setEditError("Debes ingresar ambas fechas.");
            return;
        }
        setEditLoading(true);
        setEditError("");
        try {
            await updatePeriod(selectedPeriod.id, editForm);
            await fetchPeriods();
            setOpenEditModal(false);
        } catch (err) {
            const msg = err?.response?.data?.message || "Error al actualizar el periodo.";
            setEditError(msg);
        } finally {
            setEditLoading(false);
        }
    };

    const handleSubmitPeriod = async () => {
        if (!periodForm.fecha_inicio || !periodForm.fecha_fin) {
            setPeriodError("Debes ingresar ambas fechas.");
            return;
        }
        setPeriodLoading(true);
        setPeriodError("");
        try {
            await createPeriod(periodForm);
            await fetchPeriods();
            setOpenPeriodModal(false);
        } catch (err) {
            const msg = err?.response?.data?.message || "Error al crear el periodo.";
            setPeriodError(msg);
        } finally {
            setPeriodLoading(false);
        }
    };

    return (
        <div className="Main-page">
            <h1 className="Main-page-h1">Monitor Académico</h1>
            <p className="Main-page-p">
                Revisa el progreso de carga de notas del segundo bimestre y el rendimiento
                general de la institución.
            </p>

            {/* SELECTOR DE PERIODO */}
            <div className="period-selector">
                <div className="period-selector-left">
                    <FiCalendar className="period-icon" />
                    <div>
                        <span className="period-label">Periodo Académico</span>
                        <span className="period-name">
                            {periods.length === 0 ? "Sin periodos" : selectedPeriod?.nombre}
                        </span>
                    </div>
                </div>

                <div className="period-controls">
                    {periods.length > 0 && (
                        <>
                            <span className="period-dates">
                                {selectedPeriod && (
                                    <>
                                        {new Date(selectedPeriod.fecha_inicio).toLocaleDateString("es-CO")}
                                        {" → "}
                                        {new Date(selectedPeriod.fecha_fin).toLocaleDateString("es-CO")}
                                    </>
                                )}
                            </span>
                            <div className="period-nav">
                                <button
                                    onClick={handlePrevPeriod}
                                    disabled={currentIndex <= 0}
                                    title="Periodo anterior"
                                >
                                    <FiChevronLeft />
                                </button>
                                <span>{currentIndex + 1} / {periods.length}</span>
                                <button
                                    onClick={handleNextPeriod}
                                    disabled={currentIndex >= periods.length - 1}
                                    title="Periodo siguiente"
                                >
                                    <FiChevronRight />
                                </button>
                            </div>
                        </>
                    )}

                    {/* BOTÓN EDITAR PERIODO */}
                    {selectedPeriod && (
                        <button
                            className="edit-period-btn"
                            onClick={handleOpenEditModal}
                            title="Editar periodo seleccionado"
                        >
                            <FiEdit2 />
                            <span>Editar</span>
                        </button>
                    )}

                    {/* BOTÓN AÑADIR PERIODO */}
                    <button
                        className="add-period-btn"
                        onClick={handleOpenModal}
                        title="Añadir periodo"
                    >
                        <FiPlus />
                        <span>Añadir Periodo</span>
                    </button>
                </div>
            </div>

            {/* MODAL CREAR PERIODO */}
            {openPeriodModal && (
                <div className="period-modal-overlay" onClick={handleCloseModal}>
                    <div className="period-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="period-modal-header">
                            <div className="period-modal-title">
                                <FiCalendar className="period-modal-icon" />
                                <h2>Nuevo Periodo Académico</h2>
                            </div>
                            <button className="period-modal-close" onClick={handleCloseModal}>
                                <FiX />
                            </button>
                        </div>

                        <p className="period-modal-hint">
                            El nombre del periodo se genera automáticamente. Cada periodo debe durar entre 2 y 2,5 meses y no puede solaparse con otro existente. Máximo 4 periodos por año.
                        </p>

                        <div className="period-modal-body">
                            <div className="period-field">
                                <label htmlFor="fecha_inicio">Fecha de inicio</label>
                                <input
                                    id="fecha_inicio"
                                    type="date"
                                    value={periodForm.fecha_inicio}
                                    onChange={(e) =>
                                        setPeriodForm((prev) => ({ ...prev, fecha_inicio: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="period-field">
                                <label htmlFor="fecha_fin">Fecha de fin</label>
                                <input
                                    id="fecha_fin"
                                    type="date"
                                    value={periodForm.fecha_fin}
                                    onChange={(e) =>
                                        setPeriodForm((prev) => ({ ...prev, fecha_fin: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        {periodError && (
                            <p className="period-modal-error">{periodError}</p>
                        )}

                        <div className="period-modal-footer">
                            <button className="period-cancel-btn" onClick={handleCloseModal}>
                                Cancelar
                            </button>
                            <button
                                className="period-submit-btn"
                                onClick={handleSubmitPeriod}
                                disabled={periodLoading}
                            >
                                {periodLoading ? "Creando..." : "Crear Periodo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR PERIODO */}
            {openEditModal && (
                <div className="period-modal-overlay" onClick={handleCloseEditModal}>
                    <div className="period-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="period-modal-header">
                            <div className="period-modal-title">
                                <FiEdit2 className="period-modal-icon" />
                                <h2>Editar {selectedPeriod?.nombre}</h2>
                            </div>
                            <button className="period-modal-close" onClick={handleCloseEditModal}>
                                <FiX />
                            </button>
                        </div>

                        <p className="period-modal-hint">
                            Modifica las fechas del periodo. Las mismas validaciones aplican: mínimo 2 meses, máximo 2,5 meses y sin solapamiento con otros periodos.
                        </p>

                        <div className="period-modal-body">
                            <div className="period-field">
                                <label htmlFor="edit_fecha_inicio">Fecha de inicio</label>
                                <input
                                    id="edit_fecha_inicio"
                                    type="date"
                                    value={editForm.fecha_inicio}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({ ...prev, fecha_inicio: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="period-field">
                                <label htmlFor="edit_fecha_fin">Fecha de fin</label>
                                <input
                                    id="edit_fecha_fin"
                                    type="date"
                                    value={editForm.fecha_fin}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({ ...prev, fecha_fin: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        {editError && (
                            <p className="period-modal-error">{editError}</p>
                        )}

                        <div className="period-modal-footer">
                            <button className="period-cancel-btn" onClick={handleCloseEditModal}>
                                Cancelar
                            </button>
                            <button
                                className="period-submit-btn"
                                onClick={handleSubmitEdit}
                                disabled={editLoading}
                            >
                                {editLoading ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CARDS */}
            <div className="cards">
                <StatCard
                    title="Promedio General"
                    value={promedioGeneral !== null ? promedioGeneral : "—"}
                    subtitle={promedioGeneral !== null ? "Promedio institucional" : "Sin notas registradas"}
                    color={promedioGeneral !== null ? (parseFloat(promedioGeneral) >= 3.0 ? "green" : "default") : "default"}
                    badge={promedioGeneral !== null ? (parseFloat(promedioGeneral) >= 4.0 ? "⭐ Excelente" : parseFloat(promedioGeneral) >= 3.0 ? "✅ Aprobado" : "⚠ En riesgo") : "Sin datos"}
                    icon={FaArrowTrendUp}
                    valueColor={promedioGeneral !== null ? "#406C00" : "#cbd5e1"}
                    titleColor={promedioGeneral !== null ? "#406C00" : "#94a3b8"}
                    subColor="#94a3b8"
                    iconColor={promedioGeneral !== null ? "#406C00" : "#cbd5e1"}
                    iconStyle={{
                        fontSize: "1.3rem",
                        background: promedioGeneral !== null ? "#d4f7a0" : "#f1f5f9",
                        padding: "10px",
                        borderRadius: "50%",
                        width: "44px",
                        height: "44px",
                    }}
                />
                <StatCard
                    title="% Cargas Asignadas"
                    value={`${porcentajeCarga}%`}
                    badge="En tiempo"
                    color="green"
                    icon={BiCloudUpload}
                    valueColor="#406C00"
                    titleColor="#406C00"
                    iconColor="#406C00"
                    iconStyle={{
                        fontSize: "1.3rem",
                        background: "#d4f7a0",
                        padding: "10px",
                        borderRadius: "50%",
                        width: "44px",
                        height: "44px",
                    }}
                />
            </div>

            {/* PROGRESO DOCENTES */}
            <div className="section">
                <h3>Progreso por Docente</h3>
                {loading && <p>Cargando docentes...</p>}
                {error && <p>Error al cargar datos </p>}
                {!loading && !error && teachers.length === 0 && (
                    <p>No hay docentes registrados</p>
                )}

                {!loading && !error && teachers.map((teacher, index) => {
                    const load = loads.find((l) => l.docente_id === teacher.id);
                    const progress = load ? 100 : 0;
                    const subject = load?.materias?.nombre || "Sin asignar";

                    return (
                        <TeacherProgress
                            key={teacher.id || index}
                            name={`${teacher.nombres} ${teacher.apellidos}`}
                            subject={subject}
                            progress={progress}
                        />
                    );
                })}
            </div>

            <GoalCard
                title="Carga académica completada"
                percent={porcentajeCarga}
                subtitle="Docentes con materia asignada"
            />
        </div>
    );
}