import { PiSquaresFourBold } from "react-icons/pi";
import { RiGraduationCapLine } from "react-icons/ri";
import { GrBook } from "react-icons/gr";
import { LuGraduationCap } from "react-icons/lu";
import { LuPaperclip } from "react-icons/lu";
import { TbNumbers } from "react-icons/tb";
import { FaRegQuestionCircle } from "react-icons/fa";

import "../../styles/Dashboard.css";

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div>            {/* LOGO / HEADER */}
                <div className="sidebar-header">
                    <div className="logo-circle">
                        <RiGraduationCapLine className="logo" />
                    </div>

                    <div>
                        <h2 className="logo-title">Virtual Campus</h2>
                        <span className="logo-sub">Gestión académica</span>
                    </div>
                </div>

                {/* MENÚ */}
                <nav className="sidebar-menu">
                    <a className="menu-item active">
                        <PiSquaresFourBold className="item" />
                        <span>Principal</span>
                    </a>

                    <a className="menu-item">
                        <GrBook className="item" />
                        <span>Docentes</span>
                    </a>

                    <a className="menu-item">
                        <LuGraduationCap className="item" />
                        <span>Estudiantes</span>
                    </a>

                    <a className="menu-item">
                        <LuPaperclip className="item" />
                        <span>Materias</span>
                    </a>

                    <a className="menu-item">
                        <TbNumbers className="item"/>
                        <span>Cursos</span>
                    </a>
                </nav>
            </div>


            {/* BOTÓN ABAJO */}
            <div className="sidebar-footer">
                <button className="new-btn">Nuevo Registro</button>

                <div className="extra-links">
                    <span>
                        <FaRegQuestionCircle /> Ayuda
                    </span>
                    <span>Cerrar sesión</span>
                </div>
            </div>
        </aside>
    );
}