import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import api from "../../api/api";
import StudentRow from "./StudentRow";

const PAGE_SIZE = 5;

export default function StudentTable({ students, enrollments, onRefresh }) {
    const [page, setPage] = useState(1);
    const [deleteStudent, setDeleteStudent] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const totalPages = Math.ceil(students.length / PAGE_SIZE);
    const paginated = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const getCurso = (studentId) => {
        const enrollment = enrollments.find((e) => e.estudiante_id === studentId);
        return enrollment?.cursos?.nombre || "Sin curso";
    };

    const handleDelete = async () => {
        setDeleting(true);
        setDeleteError("");
        try {
            await api.patch(`/users/${deleteStudent.id}`);
            setDeleteStudent(null);
            onRefresh();
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Error al eliminar.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="students-table">

            <div className="table-header">
                <span>ESTUDIANTE</span>
                <span>DOCUMENTO</span>
                <span>CORREO</span>
                <span>CURSO</span>
                <span>ACCIONES</span>
            </div>

            {students.length === 0 && (
                <p className="table-msg">No hay estudiantes activos registrados</p>
            )}

            {paginated.map((s) => (
                <StudentRow
                    key={s.id}
                    student={s}
                    onDelete={setDeleteStudent}
                    getCurso={getCurso}
                />
            ))}

            <div className="pagination">
                <span>Mostrando {paginated.length} de {students.length} estudiantes</span>
                <div className="pagination-controls">
                    <button
                        className="btn-arrow"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <FiChevronLeft />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                        <button
                            key={n}
                            className={n === page ? "active-page" : ""}
                            onClick={() => setPage(n)}
                        >
                            {n}
                        </button>
                    ))}

                    <button
                        className="btn-arrow"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || totalPages === 0}
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            {/* CONFIRM ELIMINAR */}
            {deleteStudent && (
                <div className="modal" onClick={() => setDeleteStudent(null)}>
                    <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
                        <h3>¿Eliminar estudiante?</h3>
                        <p>Esto desactivará a <strong>{deleteStudent.nombres} {deleteStudent.apellidos}</strong>.</p>
                        {deleteError && <p className="modal-error">{deleteError}</p>}
                        <div className="confirm-actions">
                            <button className="cancel-btn" onClick={() => setDeleteStudent(null)}>
                                Cancelar
                            </button>
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