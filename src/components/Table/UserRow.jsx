import { FiTrash2, FiEdit2 } from "react-icons/fi";

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
