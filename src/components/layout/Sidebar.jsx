import { Link, useLocation } from "react-router-dom";

import { PiSquaresFourBold } from "react-icons/pi";
import { RiGraduationCapLine } from "react-icons/ri";
import { GrBook } from "react-icons/gr";
import { LuGraduationCap } from "react-icons/lu";
import { LuPaperclip } from "react-icons/lu";
import { TbNumbers } from "react-icons/tb";
import { FaRegQuestionCircle } from "react-icons/fa";

import "../../styles/MainLayout.css";

export default function Sidebar() {

    const location = useLocation();

    return (
        <aside className="sidebar">

            <div>

                {/* 🔷 HEADER */}
                <div className="sidebar-header">
                    <div className="logo-circle">
                        <RiGraduationCapLine className="logo" />
                    </div>

                    <div>
                        <h2 className="logo-title">Virtual Campus</h2>
                        <span className="logo-sub">Gestión académica</span>
                    </div>
                </div>

                {/* 🔷 MENÚ */}
                <nav className="sidebar-menu">

                    <Link
                        to="/MainPage"
                        className={`menu-item ${location.pathname === "/MainPage" ? "active" : ""}`}
                    >
                        <PiSquaresFourBold className="item" />
                        <span>Principal</span>
                    </Link>

                    <Link
                        to="/Teachers"
                        className={`menu-item ${location.pathname === "/Teachers" ? "active" : ""}`}
                    >
                        <GrBook className="item" />
                        <span>Docentes</span>
                    </Link>

                    <Link
                        to="/students"
                        className={`menu-item ${location.pathname === "/students" ? "active" : ""}`}
                    >
                        <LuGraduationCap className="item" />
                        <span>Estudiantes</span>
                    </Link>

                    <Link
                        to="/subjects"
                        className={`menu-item ${location.pathname === "/subjects" ? "active" : ""}`}
                    >
                        <LuPaperclip className="item" />
                        <span>Materias</span>
                    </Link>

                    <Link
                        to="/courses"
                        className={`menu-item ${location.pathname === "/courses" ? "active" : ""}`}
                    >
                        <TbNumbers className="item" />
                        <span>Cursos</span>
                    </Link>

                </nav>
            </div>

            {/* 🔻 FOOTER */}
            <div className="sidebar-footer">

                <button className="new-btn">
                    Nuevo Registro
                </button>

                <div className="extra-links">
                    <span>
                        <FaRegQuestionCircle /> Ayuda
                    </span>

                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/";
                        }}
                    >
                        Cerrar sesión
                    </span>
                </div>

            </div>

        </aside>
    );
}