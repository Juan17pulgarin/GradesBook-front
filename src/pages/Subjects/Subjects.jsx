import { useEffect, useState } from "react";
import api from "../../api/api";

import "./Subject.css";

import { PiBookOpenTextBold } from "react-icons/pi";
import { FaRegCircleCheck } from "react-icons/fa6";
import { RiUserAddLine } from "react-icons/ri";
import { MdEdit, MdPendingActions } from "react-icons/md";

import UserModal from "../../components/Modal/UserModal";

export default function Subject() {

    const [subjects, setSubjects] = useState([]);

    /* ================= MODAL ================= */

    const [openModal, setOpenModal] = useState(false);

    /* ================= FETCH ================= */

    const fetchData = () => {

        api.get("/subjects")
            .then((res) => {

                console.log("Materias:", res.data);

                setSubjects(res.data);

            })
            .catch((err) => {

                console.error("Error materias:", err);

            });

    };

    useEffect(() => {

        fetchData();

    }, []);

    // ================= STATS =================

    const totalMaterias = subjects.length;

    const materiasActivas = subjects.filter(
        (subject) => subject.estado === "ACTIVA"
    ).length;

    const materiasInactivas = subjects.filter(
        (subject) => subject.estado !== "ACTIVA"
    ).length;

    return (

        <div className="subject-page">

            {/* ================= HEADER ================= */}

            <div className="subject-header">

                <div>

                    <span className="section-label">
                        ADMINISTRACIÓN ACADÉMICA
                    </span>

                    <h1>
                        Gestión de
                        <br />
                        <span>Materias</span>
                    </h1>

                </div>

                {/* ================= BOTON ================= */}

                <button
                    className="create-subject-btn"
                    onClick={() => setOpenModal(true)}
                >

                    <RiUserAddLine className="create-icon" />

                    <span className="btn-text">
                        Añadir Nueva Materia
                    </span>

                </button>

            </div>

            {/* ================= TABLA ================= */}

            <div className="subject-table-container">

                <div className="subject-table-header">

                    <h3>
                        Listado de Materias
                    </h3>

                    <p>
                        Mostrando {subjects.length} materias registradas
                    </p>

                </div>

                <table className="subject-table">

                    <thead>

                        <tr>

                            <th>MATERIA</th>
                            <th>ESTADO</th>
                            <th>ACCIONES</th>

                        </tr>

                    </thead>

                    <tbody>

                        {subjects.map((subject) => (

                            <tr key={subject.id}>

                                <td>

                                    <div className="subject-name">

                                        <div className="subject-icon">
                                            {subject.nombre.charAt(0)}
                                        </div>

                                        <span>
                                            {subject.nombre}
                                        </span>

                                    </div>

                                </td>

                                <td>

                                    <span
                                        className={
                                            subject.estado === "ACTIVA"
                                                ? "status active"
                                                : "status inactive"
                                        }
                                    >
                                        {subject.estado}
                                    </span>

                                </td>

                                <td>

                                    <button className="edit-btn">
                                        <MdEdit />
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

            {/* ================= CARDS ================= */}

            <div className="subject-bottom-cards">

                {/* ===== TOTAL ===== */}

                <div className="bottom-card blue-card">

                    <PiBookOpenTextBold
                        className="bottom-card-icon blue-icon"
                    />

                    <div className="bottom-card-content">

                        <h2>
                            {totalMaterias}
                        </h2>

                        <p>
                            Total Materias
                        </p>

                    </div>

                </div>

                {/* ===== ACTIVAS ===== */}

                <div className="bottom-card green-card">

                    <FaRegCircleCheck
                        className="bottom-card-icon green-icon"
                    />

                    <div className="bottom-card-content">

                        <h2>
                            {materiasActivas}
                        </h2>

                        <p>
                            Materias Activas
                        </p>

                    </div>

                </div>

                {/* ===== INACTIVAS ===== */}

                <div className="bottom-card yellow-card">

                    <MdPendingActions
                        className="bottom-card-icon yellow-icon"
                    />

                    <div className="bottom-card-content">

                        <h2>
                            {materiasInactivas}
                        </h2>

                        <p>
                            Materias Inactivas
                        </p>

                    </div>

                </div>

            </div>

            {openModal && (

                <UserModal
                    tipo="MATERIA"
                    onClose={() => setOpenModal(false)}
                    onSuccess={fetchData}
                />

            )}

        </div>

    );

}