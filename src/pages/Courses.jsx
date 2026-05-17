import { useEffect, useState } from "react";
import api from "../api/api";

import "../styles/Courses.css";

import StatCard from "../components/dashboard/StatCard";

import { CgMenuBoxed } from "react-icons/cg";
import { FaRegCircleCheck } from "react-icons/fa6";
import { IoMdTime } from "react-icons/io";
import { RiUserAddLine } from "react-icons/ri";

/* ================= NUEVOS ICONOS ================= */

import { HiOutlineViewGrid } from "react-icons/hi";
import { HiOutlineBars3 } from "react-icons/hi2";

export default function Courses() {

    const [courses, setCourses] = useState([]);

    useEffect(() => {

        api.get("/courses")
            .then((res) => {
                console.log("Cursos:", res.data);
                setCourses(res.data);
            })
            .catch((err) => {
                console.error("Error cursos:", err);
            });

    }, []);

    // STATS

    const totalCursos = courses.length;

    const cursosActivos = courses.filter(
        (course) => course.estado === "ACTIVO"
    ).length;

    const porIniciar = courses.filter(
        (course) => course.estado !== "ACTIVO"
    ).length;

    return (

        <div className="courses-page">

            {/* HEADER */}

            <div className="courses-header">

                <div>

                    <h1>
                        Gestión de Cursos
                    </h1>

                    <p>
                        Bienvenido de nuevo. Aquí puedes organizar los grupos y asignaciones del ciclo escolar 2024.
                    </p>

                </div>

                <button className="create-course-btn">

                    <RiUserAddLine className="create-icon" />

                    <span className="btn-text">
                        Crear Nuevo Curso
                    </span>

                </button>

            </div>

            {/* STATS */}

            <div className="cards">

                <StatCard
                    title="Total Cursos"
                    value={totalCursos}
                    color="default"
                    icon={CgMenuBoxed}
                    valueColor="#2A3031"
                    titleColor="#575C5E"
                    subColor="#a6d4fa"
                    iconColor="#FFFFFF"
                    iconStyle={{
                        fontSize: "1.6rem",
                        background: "#0284c7",
                        padding: "12px",
                        borderRadius: "50%",
                        width: "52px",
                        height: "52px",
                    }}
                />

                <StatCard
                    title="Cursos Activos"
                    value={cursosActivos}
                    color="green"
                    icon={FaRegCircleCheck}
                    valueColor="#2A3031"
                    titleColor="#575C5E"
                    subColor="#aef1d2"
                    iconColor="#FFFFFF"
                    iconStyle={{
                        fontSize: "1.6rem",
                        background: "#3C6600",
                        padding: "12px",
                        borderRadius: "50%",
                        width: "52px",
                        height: "52px",
                    }}
                />

                <StatCard
                    title="Por Iniciar"
                    value={porIniciar}
                    color="yellow"
                    icon={IoMdTime}
                    valueColor="#2A3031"
                    titleColor="#575C5E"
                    subColor="#7a6300"
                    iconColor="#463600"
                    iconStyle={{
                        fontSize: "1.6rem",
                        background: "#EEC540",
                        padding: "12px",
                        borderRadius: "50%",
                        width: "52px",
                        height: "52px",
                    }}
                />

            </div>

            {/* LISTADO */}

            <div className="list-header">

                <h3>
                    Listado de Cursos
                </h3>

                <div className="view-buttons">

                    <button>
                        <HiOutlineViewGrid />
                    </button>

                    <button>
                        <HiOutlineBars3 />
                    </button>

                </div>

            </div>

            {/* GRID */}

            <div className="courses-grid">

                {courses.map((course) => (

                    <div
                        className="course-card"
                        key={course.id}
                    >

                        <div
                            className={`left-border ${
                                course.estado === "ACTIVO"
                                    ? "blue"
                                    : "gray"
                            }`}
                        ></div>

                        <div className="course-image">

                            {course.nombre.charAt(0)}

                        </div>

                        <div className="course-content">

                            <div className="course-top">

                                <h4>
                                    {course.nombre}
                                </h4>

                                <span
                                    className={
                                        course.estado === "ACTIVO"
                                            ? "status active"
                                            : "status inactive"
                                    }
                                >
                                    {course.estado}
                                </span>

                            </div>

                            <div className="course-info">

                                <p>
                                    📅 Año: {course.anio}
                                </p>

                                <p>
                                    👥 {course.capacidad_maxima} Alumnos
                                </p>

                            </div>

                        </div>

                        <button className="dots-btn">
                            ⋮
                        </button>

                    </div>

                ))}

            </div>

        </div>

    );
}