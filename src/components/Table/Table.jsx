import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ConfirmModal from "../Modal/ConfirmModal";
import api from "../../api/api";

const PAGE_SIZE = 5;

/**
 * Tabla genérica reutilizable con paginación y confirmación de eliminación.
 *
 * Props:
 *  - items: array de objetos a mostrar
 *  - columns: array de strings con los encabezados (ej: ["Nombre", "Email", "Acciones"])
 *  - renderRow: función (item) => JSX — renderiza cada fila
 *  - entityLabel: nombre de la entidad en singular (ej: "docente", "estudiante")
 *  - onDelete: función async (item) => void — llamada al confirmar eliminación
 *  - deleteTarget / setDeleteTarget: estado externo opcional del item a eliminar
 *    (si no se pasan, la tabla maneja su propio estado interno)
 *  - emptyMessage: mensaje cuando no hay items (opcional)
 *  - loading: boolean (opcional)
 *  - error: boolean (opcional)
 */
export default function Table({
    items = [],
    columns = [],
    renderRow,
    entityLabel = "registro",
    onDelete,
    emptyMessage,
    loading = false,
    error = false,
}) {
    const [page, setPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    const paginated = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleDelete = async () => {
        setDeleting(true);
        setDeleteError("");
        try {
            if (onDelete) await onDelete(deleteTarget);
            setDeleteTarget(null);
        } catch (err) {
            setDeleteError(err.response?.data?.message || "Error al eliminar.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="table-container">
            {/* Encabezados */}
            <div className="table-header">
                {columns.map((col) => (
                    <span key={col}>{col}</span>
                ))}
            </div>

            {/* Estados */}
            {loading && <p className="table-msg">Cargando {entityLabel}s...</p>}
            {error && <p className="table-msg">Error al cargar datos</p>}
            {!loading && !error && items.length === 0 && (
                <p className="table-msg">
                    {emptyMessage || `No hay ${entityLabel}s registrados`}
                </p>
            )}

            {/* Filas */}
            {!loading && !error && paginated.map((item) =>
                renderRow(item, setDeleteTarget)
            )}

            {/* Paginación */}
            <div className="pagination">
                <span>
                    Mostrando {paginated.length} de {items.length} {entityLabel}s
                </span>
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

            {/* Modal de confirmación de eliminación */}
            {deleteTarget && (
                <ConfirmModal
                    title={`¿Eliminar ${entityLabel}?`}
                    message={
                        <>
                            Esto desactivará a{" "}
                            <strong>
                                {deleteTarget.nombres} {deleteTarget.apellidos}
                            </strong>
                            .
                        </>
                    }
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                    error={deleteError}
                />
            )}
        </div>
    );
}
