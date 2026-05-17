import { useEffect, useState } from "react";
import api from "../api/api";

import StatCard from "../components/dashboard/StatCard";
import UserModal from "../components/UserModal";

import { FaUsers, FaRegCircleCheck } from "react-icons/fa6";
import { HiOutlineEllipsisHorizontalCircle } from "react-icons/hi2";
import { FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";

import "../styles/Students.css";

const PAGE_SIZE = 5;

export default function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [deleteStudent, setDeleteStudent] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [page, setPage] = useState(1);

    const fetchStudents = () => {
        setLoading(true);
        api.get("/users?tipo=ESTUDIANTE")
            .then((res) => { setStudents(res.data); setLoading(false); })
            .catch((err) => { console.error(err); setError(true); setLoading(false); });
    };

    useEffect(() => { fetchStudents(); }, []);

    const total = students.length;
    const activos = students.filter((s) => s.activo).length;
    const inactivos = students.filter((s) => !s.activo).length;

    const totalPages = Math.ceil(students.length / PAGE_SIZE);
    const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleDelete = async () => {
        setDeleting(true);
        setDeleteError("");
        try {
            await api.patch(`/users/${deleteStudent.id}`);
            setDeleteStudent(null);
            fetchStudents();
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Error al eliminar.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="students">
            <div className="students-header">
                <div>
                    <h1>Gestión de <span>Estudiantes</span></h1>
                    <p>Administra el padrón de alumnos del colegio. Matricula nuevos integrantes y <br />
                     mantén actualizada la información de contacto y académica.</p>
                </div>
                <button className="login-btn" onClick={() => setOpenModal(true)}>Añadir Nuevo Estudiante</button>
            </div>

            <div className="cards">
                <StatCard title="Total Alumnos" 
                value={total} 
                color="default" 
                icon={FaUsers}
                    valueColor="#2A3031" 
                    titleColor="#575C5E" 
                    iconColor="#00618F"
                    iconStyle={{ background: "#CCEFFF", 
                    padding: "12px", 
                    borderRadius: "50%", 
                    width: "52px", 
                    height: "52px" }} />

                <StatCard title="Activos" 
                value={activos} 
                color="green" 
                icon={FaRegCircleCheck}
                    valueColor="#2A3031" 
                    titleColor="#575C5E" 
                    iconColor="#396100"
                    iconStyle={{ background: "#C1FD7C", 
                    padding: "12px", 
                    borderRadius: "50%", 
                    width: "52px", 
                    height: "52px" }} />

                <StatCard title="Inactivos" 
                value={inactivos} 
                color="yellow" 
                icon={HiOutlineEllipsisHorizontalCircle}
                    valueColor="#2A3031" 
                    titleColor="#575C5E" 
                    iconColor="#5C4900"
                    iconStyle={{ background: "#FDD34D", 
                    padding: "12px", 
                    borderRadius: "50%", 
                    width: "52px", 
                    height: "52px" }} />
            </div>

            <div className="students-table">
                <div className="table-header">
                    <span>ESTUDIANTE</span>
                    <span>DOCUMENTO</span>
                    <span>CORREO</span>
                    <span>ESTADO</span>
                    <span>ACCIONES</span>
                </div>

                {loading && <p className="table-msg">Cargando estudiantes...</p>}
                {error && <p className="table-msg">Error al cargar datos 😢</p>}
                {!loading && !error && students.length === 0 && <p className="table-msg">No hay estudiantes registrados</p>}

                {!loading && !error && paginated.map((s) => (
                    <div className="table-row" key={s.id}>
                        <div className="student-info">
                            <img src="https://i.pravatar.cc/40" alt="avatar" />
                            <div>
                                <strong>{s.nombres} {s.apellidos}</strong>
                                <p>ID: {s.id}</p>
                            </div>
                        </div>
                        <span className="badge">{s.documento}</span>
                        <span>{s.correo}</span>
                        <span className={`status ${s.activo ? "active" : "inactive"}`}>
                            ● {s.activo ? "ACTIVO" : "INACTIVO"}
                        </span>
                        <div className="actions">

                            <button className="btn-delete" 
                            title="Eliminar" 
                            onClick={() => setDeleteStudent(s)}>
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>
                ))}

                <div className="pagination">
                    <span>Mostrando {paginated.length} de {students.length} estudiantes</span>
                    <div className="pagination-controls">

                        <button className="btn-arrow" 
                        onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                            <FiChevronLeft />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                            <button key={n} className={n === page ? "active-page" : ""} onClick={() => setPage(n)}>{n}</button>
                        ))}

                        <button className="btn-arrow" 
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            {openModal && (
                <UserModal tipo="ESTUDIANTE" onClose={() => setOpenModal(false)} onSuccess={fetchStudents} />
            )}

            {deleteStudent && (
                <div className="modal" onClick={() => setDeleteStudent(null)}>
                    <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
                        <h3>¿Eliminar estudiante?</h3>
                        <p>Esto desactivará a <strong>{deleteStudent.nombres} {deleteStudent.apellidos}</strong>.</p>
                        {deleteError && <p className="modal-error">{deleteError}</p>}

                        <div className="confirm-actions">
                            <button className="cancel-btn" 
                            onClick={() => setDeleteStudent(null)}>Cancelar</button>

                            <button className="btn-confirm-delete" 
                            onClick={handleDelete} disabled={deleting}>
                                {deleting ? "Eliminando..." : "Sí, eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}