import { FiTrash2, FiEdit2 } from "react-icons/fi";

/**
 * Fila genérica para tablas de usuarios (docentes y estudiantes).
 *
 * Props:
 *  - user: objeto con { id, nombres, apellidos, email }
 *  - badge: texto del badge central (materia, documento, curso, etc.)
 *  - extraCol: columna adicional opcional (ej: curso para estudiantes)
 *  - onDelete: función que recibe el user al hacer clic en eliminar
 *  - onEdit: función opcional que recibe el user al hacer clic en editar
 *  - idPrefix: prefijo para el ID mostrado (ej: "T-" para docentes)
 */
export default function UserRow({ user, badge, extraCol, onDelete, onEdit, idPrefix = "" }) {
    return (
        <div className="table-row">
            <div className="name">
                <img src="https://i.pravatar.cc/40" alt="avatar" />
                <div>
                    <p>{user.nombres} {user.apellidos}</p>
                    <span>ID: {idPrefix}{user.id}</span>
                </div>
            </div>

            <span className="badge">{badge}</span>

            <span>{user.email}</span>

            {extraCol !== undefined && (
                <span className="badge">{extraCol}</span>
            )}

            <div className="actions">
                {onEdit && (
                    <button className="btn-edit" title="Editar" onClick={() => onEdit(user)}>
                        <FiEdit2 />
                    </button>
                )}
                <button className="btn-delete" title="Eliminar" onClick={() => onDelete(user)}>
                    <FiTrash2 />
                </button>
            </div>
        </div>
    );
}
