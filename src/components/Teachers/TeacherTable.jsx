import { useState } from "react";
import TeacherRow from "./TeacherRow";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import api from "../../api/api";

const PAGE_SIZE = 5;

export default function TeacherTable({ teachers, onRefresh }) {
    const [page, setPage] = useState(1);
    const [deleteTeacher, setDeleteTeacher] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const totalPages = Math.ceil(teachers.length / PAGE_SIZE);
    const paginated = teachers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleDelete = async () => {
        setDeleting(true);
        setDeleteError("");
        try {
            await api.patch(`/users/${deleteTeacher.id}`);
            setDeleteTeacher(null);
            onRefresh();
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Error al eliminar.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="table-container">
            <div className="table-header">
                <span>Foto/Nombre</span>
                <span>Materia Asignada</span>
                <span>Correo</span>
                <span>Estado</span>
                <span>Acciones</span>
            </div>

            {paginated.map((t) => (
                <TeacherRow key={t.id} teacher={t} onDelete={setDeleteTeacher} />
            ))}

            <div className="pagination">
                <span>Mostrando {paginated.length} de {teachers.length} docentes</span>
                <div className="pagination-controls">
                    <button className="btn-arrow" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                        <FiChevronLeft />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button key={n} className={n === page ? "active-page" : ""} onClick={() => setPage(n)}>{n}</button>
                    ))}
                    <button className="btn-arrow" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {deleteTeacher && (
                <div className="modal" onClick={() => setDeleteTeacher(null)}>
                    <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
                        <h3>¿Eliminar docente?</h3>
                        <p>Esto desactivará a <strong>{deleteTeacher.nombres} {deleteTeacher.apellidos}</strong>.</p>
                        {deleteError && <p className="modal-error">{deleteError}</p>}
                        <div className="confirm-actions">
                            <button className="cancel-btn" onClick={() => setDeleteTeacher(null)}>Cancelar</button>
                            <button className="btn-confirm-delete" onClick={handleDelete} disabled={deleting}>
                                {deleting ? "Eliminando..." : "Sí, eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}