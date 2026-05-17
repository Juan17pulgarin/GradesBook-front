import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/StudentMain.css";

export default function StudentMain() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const primerNombre = user.nombreCompleto?.split(" ")[0] || "Estudiante";

    const [periods, setPeriods] = useState([]);
    const [selectedPeriodId, setSelectedPeriodId] = useState(null);
    const [grades, setGrades] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get("/periods"),
            api.get("/grades/my-grades"),
            api.get("/activities/my-activities"),
        ])
            .then(([periodsRes, gradesRes, activitiesRes]) => {
                setPeriods(periodsRes.data);
                setGrades(gradesRes.data);
                setActivities(activitiesRes.data);
                if (periodsRes.data.length > 0) {
                    setSelectedPeriodId(periodsRes.data[periodsRes.data.length - 1].id);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const periodoActual = periods.find((p) => p.id === selectedPeriodId);
    const periodoIndex = periods.findIndex((p) => p.id === selectedPeriodId);

    // Filtrar notas por periodo seleccionado
    const gradesFiltradas = selectedPeriodId
        ? grades.filter((g) => g.actividades?.periodo_id === selectedPeriodId)
        : grades;

    // Promedio general de todas las notas
    const promedioGeneral = grades.length > 0
        ? (grades.reduce((acc, g) => acc + parseFloat(g.nota), 0) / grades.length).toFixed(1)
        : "—";

    // Agrupar notas por materia
    const materiaMap = {};
    gradesFiltradas.forEach((g) => {
        const nombreMateria = g.actividades?.carga_academica?.materias?.nombre || "Sin materia";
        const ultimaTema = g.actividades?.nombre || "—";
        if (!materiaMap[nombreMateria]) {
            materiaMap[nombreMateria] = { notas: [], ultimoTema: ultimaTema };
        }
        materiaMap[nombreMateria].notas.push(parseFloat(g.nota));
        materiaMap[nombreMateria].ultimoTema = ultimaTema;
    });

    const colores = [
        { badgeColor: "blue", barColor: "#3b82f6" },
        { badgeColor: "green", barColor: "#84cc16" },
        { badgeColor: "yellow", barColor: "#f59e0b" },
    ];

    const materiasCards = Object.entries(materiaMap).map(([nombre, data], i) => {
        const promedio = (data.notas.reduce((a, b) => a + b, 0) / data.notas.length).toFixed(1);
        const progreso = Math.min(Math.round((parseFloat(promedio) / 10) * 100), 100);
        const color = colores[i % colores.length];
        const badge = parseFloat(promedio) >= 9.5 ? "PERFECTO"
            : parseFloat(promedio) >= 8 ? "MUY BIEN"
                : parseFloat(promedio) >= 6 ? "EXCELENTE"
                    : "EN PROCESO";
        return { nombre, promedio, ultimoTema: data.ultimoTema, badge, ...color, progreso };
    });

    // Boletín: una fila por materia con promedio
    const boletin = materiasCards.map((m) => ({
        asignatura: m.nombre,
        nota: m.promedio,
        comentario: m.badge === "PERFECTO" ? "¡Desempeño sobresaliente!"
            : m.badge === "MUY BIEN" ? "Buen rendimiento académico."
                : "Sigue esforzándote.",
    }));

    return (
        <div className="sm-page">

            {/* TOPBAR */}
            <div className="sm-topbar">
                <div className="sm-logo">GradesBook</div>
                <div className="sm-topbar-right">
                    <div className="sm-search">
                        <span className="sm-search-icon">🔍</span>
                        <input placeholder="Buscar mi progreso..." />
                    </div>
                    <span className="sm-icon">🔔</span>
                    <span className="sm-icon">⚙️</span>
                    <div className="sm-avatar">{primerNombre[0]}</div>
                </div>
            </div>

            <div className="sm-content">

                {/* HERO */}
                <div className="sm-hero">
                    <div className="sm-hero-left">
                        <h1>¡Hola, {primerNombre}! 🚀</h1>
                        <p>Estás teniendo un trimestre increíble. ¡Sigue brillando como una estrella!</p>
                        <button className="sm-hero-btn">Ver Boletín Completo</button>
                    </div>
                    <div className="sm-hero-right">
                        <div className="sm-promedio-circle">
                            <svg viewBox="0 0 100 100" className="sm-circle-svg">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#84cc16" strokeWidth="8"
                                    strokeDasharray="263.9"
                                    strokeDashoffset={grades.length > 0 ? 263.9 - (parseFloat(promedioGeneral) / 10) * 263.9 : 200}
                                    strokeLinecap="round" transform="rotate(-90 50 50)" />
                            </svg>
                            <div className="sm-circle-text">
                                <span className="sm-circle-value">{promedioGeneral}</span>
                                <span className="sm-circle-label">PROMEDIO GENERAL</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SELECTOR DE PERIODO */}
                {periods.length > 0 && (
                    <div className="sm-period-selector">
                        <div className="sm-period-left">
                            <span>📅</span>
                            <div>
                                <span className="sm-period-label">Periodo Académico</span>
                                <span className="sm-period-name">{periodoActual?.nombre}</span>
                            </div>
                        </div>
                        <div className="sm-period-right">
                            <span className="sm-period-dates">
                                {periodoActual && (
                                    <>
                                        {new Date(periodoActual.fecha_inicio).toLocaleDateString("es-CO")}
                                        {" → "}
                                        {new Date(periodoActual.fecha_fin).toLocaleDateString("es-CO")}
                                    </>
                                )}
                            </span>
                            <div className="sm-period-nav">
                                <button
                                    onClick={() => setSelectedPeriodId(periods[periodoIndex - 1].id)}
                                    disabled={periodoIndex <= 0}
                                >◀</button>
                                <span>{periodoIndex + 1} / {periods.length}</span>
                                <button
                                    onClick={() => setSelectedPeriodId(periods[periodoIndex + 1].id)}
                                    disabled={periodoIndex >= periods.length - 1}
                                >▶</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* CALIFICACIONES */}
                <div className="sm-section">
                    <div className="sm-section-header">
                        <div>
                            <h2>Mis Calificaciones</h2>
                            <p>Seguimiento de tus metas este trimestre</p>
                        </div>
                        <span className="sm-link">Ver histórico ↗</span>
                    </div>

                    {loading && <p className="sm-msg">Cargando calificaciones...</p>}
                    {!loading && materiasCards.length === 0 && (
                        <p className="sm-msg">No tienes calificaciones registradas aún.</p>
                    )}

                    <div className="sm-materias">
                        {materiasCards.map((m, i) => (
                            <div className="sm-materia-card" key={i}>
                                <div className="sm-materia-top">
                                    <div className="sm-materia-icon">📘</div>
                                    <div className="sm-materia-nota-box">
                                        <span className="sm-materia-nota">{m.promedio}</span>
                                        <span className={`sm-badge sm-badge-${m.badgeColor}`}>{m.badge}</span>
                                    </div>
                                </div>
                                <h3 className="sm-materia-nombre">{m.nombre}</h3>
                                <p className="sm-materia-tema">Último tema: {m.ultimoTema}</p>
                                <div className="sm-progress-label">PROGRESO DE METAS</div>
                                <div className="sm-progress-bar">
                                    <div className="sm-progress-fill"
                                        style={{ width: `${m.progreso}%`, background: m.barColor }} />
                                </div>
                                <span className="sm-progress-pct">{m.progreso}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* BOLETÍN + CONSEJO */}
                <div className="sm-bottom">

                    <div className="sm-boletin">
                        <div className="sm-boletin-header">
                            <div>
                                <h2>Boletín de Calificaciones</h2>
                                <p>{periodoActual?.nombre || "Periodo actual"}</p>
                            </div>
                            <div className="sm-boletin-actions">
                                <button title="Descargar">⬇</button>
                                <button title="Imprimir">🖨</button>
                            </div>
                        </div>
                        <div className="sm-boletin-table">
                            <div className="sm-boletin-thead">
                                <span>ASIGNATURA</span>
                                <span>NOTA FINAL</span>
                                <span>COMENTARIO</span>
                            </div>
                            {boletin.length > 0 ? boletin.map((b, i) => (
                                <div className="sm-boletin-row" key={i}>
                                    <span>{b.asignatura}</span>
                                    <span className="sm-boletin-nota">{b.nota}</span>
                                    <span className="sm-boletin-comentario">{b.comentario}</span>
                                </div>
                            )) : (
                                <div className="sm-boletin-empty">
                                    Sin notas registradas aún.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="sm-consejo">
                        <div className="sm-consejo-header">RESUMEN ACADÉMICO</div>
                        <p className="sm-consejo-text">
                            "{primerNombre}, llevas {grades.length} nota{grades.length !== 1 ? "s" : ""} registrada{grades.length !== 1 ? "s" : ""}
                            {" "}en {materiasCards.length} materia{materiasCards.length !== 1 ? "s" : ""}.
                            {parseFloat(promedioGeneral) >= 8
                                ? " ¡Sigue así, vas muy bien!"
                                : " Sigue esforzándote, puedes mejorar."}"
                        </p>
                        <button className="sm-logout" onClick={handleLogout}>
                            Cerrar sesión
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}