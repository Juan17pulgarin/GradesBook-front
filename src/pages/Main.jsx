import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import StatCard from "../components/dashboard/StatCard";
import TeacherProgress from "../components/dashboard/TeacherProgress";
import GoalCard from "../components/dashboard/GoalCard";


import "../styles/Dashboard.css";

export default function Main() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        axios
            .get("http://localhost:3000/api/v1/teachers") 
            .then((res) => {
                setTeachers(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al traer docentes:", err);
                setError(true);
                setLoading(false);
            });
    }, []);

    return (
        <div className="layout">
            <Sidebar />

            <div className="main-content">

                {/* 🔥 TOPBAR FUERA DEL CONTENIDO */}
                <div className="superior">
                    <Topbar />
                </div>


                {/* 🔥 CONTENIDO CON PADDING */}
                <div className="content">

                    <h1 className="Main-page-h1">
                        Monitor Académico
                    </h1>

                    <p className="Main-page-p">
                        Revisa el progreso de carga de notas del segundo bimestre y el rendimiento <br />
                        general de la institución.
                    </p>

                    <div className="cards">


                        <StatCard
                            title="Promedio General"
                            value="0"
                            subtitle="+0 vs mes anterior"
                        />

                        <StatCard
                            title="% de Notas Cargadas"
                            value="0%"
                            color="green"

                            badge="En tiempo"
                        />
                    </div>

                    <div className="section">
                        <h3>Progreso por Docente</h3>

                        {loading && <p>Cargando docentes...</p>}
                        {error && <p>Error al cargar datos 😢</p>}

                        {!loading && !error && teachers.length === 0 && (
                            <p>No hay docentes registrados</p>
                        )}

                        {!loading &&
                            !error &&
                            teachers.map((teacher) => (
                                <TeacherProgress
                                    key={teacher.id}
                                    name={teacher.name}
                                    subject={teacher.subject}
                                    progress={teacher.progress}
                                />
                            ))}
                    </div>

                    <GoalCard
                        title="Carga académica completada"
                        percent={74}
                        subtitle="Progreso general del sistema"
                    />
                </div>
            </div>
        </div>
    );
}