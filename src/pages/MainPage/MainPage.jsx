import { useEffect, useState } from "react";
import { getUsers } from "../../services/userService";
import { getSubjects } from "../../services/subjectService";
import { getAcademicLoads } from "../../services/academicLoadService";
import { getPeriods } from "../../services/periodService";

import StatCard from "../../components/Cards/StatCard";
import TeacherProgress from "../../components/Cards/TeacherProgress";
import GoalCard from "../../components/Cards/GoalCard";

import { FaArrowTrendUp } from "react-icons/fa6";
import { BiCloudUpload } from "react-icons/bi";
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi";
import { IoCaretBack } from "react-icons/io5";
import { IoCaretForward } from "react-icons/io5";

import "./MainPage.css";

export default function MainPage() {
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loads, setLoads] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        Promise.all([
            getUsers("DOCENTE"),
            getSubjects(),
            getAcademicLoads(),
            getPeriods(),
        ])
            .then(([teachersRes, subjectsRes, loadsRes, periodsRes]) => {
                setTeachers(teachersRes.data);
                setSubjects(subjectsRes.data);
                setLoads(loadsRes.data);
                setPeriods(periodsRes.data);

                if (periodsRes.data.length > 0) {
                    const hoy = new Date();

                    // Busca el periodo activo (hoy está entre inicio y fin)
                    const periodoActivo = periodsRes.data.find((p) => {
                        const inicio = new Date(p.fecha_inicio);
                        const fin = new Date(p.fecha_fin);
                        return hoy >= inicio && hoy <= fin;
                    });

                    // Si no hay uno activo, toma el primero
                    setSelectedPeriod(
                        periodoActivo || periodsRes.data[0]
                    );
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

    // Navegación entre periodos
    const currentIndex = periods.findIndex((p) => p.id === selectedPeriod?.id);

    const handlePrevPeriod = () => {
        if (currentIndex > 0) setSelectedPeriod(periods[currentIndex - 1]);
    };

    const handleNextPeriod = () => {
        if (currentIndex < periods.length - 1) setSelectedPeriod(periods[currentIndex + 1]);
    };

    return (
        <div className="Main-page">
            <h1 className="Main-page-h1">Monitor Académico</h1>
            <p className="Main-page-p">
                Revisa el progreso de carga de notas del segundo bimestre y el rendimiento
                general de la institución.
            </p>

            {/* SELECTOR DE PERIODO */}
            {periods.length > 0 && (
                <div className="period-selector">
                    <div className="period-selector-left">
                        <FiCalendar className="period-icon" />
                        <div>
                            <span className="period-label">Periodo Académico</span>
                            <span className="period-name">{selectedPeriod?.nombre}</span>
                        </div>
                    </div>
                    <div className="period-controls">
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
                    </div>
                </div>
            )}

            {/* CARDS */}
            <div className="cards">
                <StatCard
                    title="Promedio General"
                    value="—"
                    subtitle="Disponible próximamente"
                    color="default"
                    badge="⏳ Pendiente"
                    icon={FaArrowTrendUp}
                    valueColor="#cbd5e1"
                    titleColor="#94a3b8"
                    subColor="#94a3b8"
                    iconColor="#cbd5e1"
                    iconStyle={{
                        fontSize: "1.3rem",
                        background: "#f1f5f9",
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