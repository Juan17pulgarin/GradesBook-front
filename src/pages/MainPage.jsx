import { useEffect, useState } from "react";
import api from "../api/api";

import StatCard from "../components/dashboard/StatCard";
import TeacherProgress from "../components/dashboard/TeacherProgress";
import GoalCard from "../components/dashboard/GoalCard";

import { FaArrowTrendUp } from "react-icons/fa6";
import { BiCloudUpload } from "react-icons/bi";

import "../styles/MainPage.css";

export default function MainPage() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        api.get("/users?tipo=DOCENTE")
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
        <div className="Main-page">

            <h1 className="Main-page-h1">Monitor Académico</h1>

            <p className="Main-page-p">
                Revisa el progreso de carga de notas del segundo bimestre y el rendimiento <br />
                general de la institución.
            </p>

            <div className="cards">
                <StatCard
                    title="Promedio General"
                    value="4.5"
                    subtitle="+0.2 vs mes anterior"
                    color="default"
                    icon={FaArrowTrendUp}
                    valueColor="#0284c7"
                    titleColor="#0284c7"
                    subColor="#0284c7"
                    iconColor="#0284c7"
                    iconStyle={{
                        fontSize: "1.6rem",
                        background: "#F0F9FF",
                        padding: "12px",
                        borderRadius: "40%",
                        width: "52px",
                        height: "42px",
                    }}
                />

                <StatCard
                    title="% Notas Cargadas"
                    value="85%"
                    subtitle="En tiempo"
                    color="green"
                    icon={BiCloudUpload}
                    valueColor="#406C00"
                    titleColor="#406C00"
                    subColor="#406C00"
                    iconColor="#406C00"
                    iconStyle={{
                        fontSize: "1.6rem",
                        background: "#DAFEB0",
                        padding: "12px",
                        borderRadius: "40%",
                        width: "52px",
                        height: "42px",
                    }}
                />
            </div>

            <div className="section">
                <h3>Progreso por Docente</h3>

                {loading && <p>Cargando docentes...</p>}
                {error && <p>Error al cargar datos 😢</p>}

                {!loading && !error && teachers.length === 0 && (
                    <p>No hay docentes registrados</p>
                )}

                {!loading && !error && teachers.map((teacher, index) => (
                    <TeacherProgress
                        key={teacher.id || index}
                        name={
                            teacher.nombreCompleto ||
                            `${teacher.nombres} ${teacher.apellidos}`
                        }
                        subject={"Sin asignar"}
                        progress={Math.floor(Math.random() * 100)}
                    />
                ))}
            </div>

            <GoalCard
                title="Carga académica completada"
                percent={74}
                subtitle="Progreso general del sistema"
            />

        </div>
    );
}