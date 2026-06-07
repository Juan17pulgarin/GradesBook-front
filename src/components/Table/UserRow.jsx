import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { MdOutlinePersonAddAlt } from "react-icons/md";

export default function UserRow({ user, badge, extraCol, onDelete, onEdit, idPrefix = "" }) {
    const isActivo = user.activo !== false;

    return (
        <div className={`table-row ${!isActivo ? "table-row--inactive" : ""}`}>
            <div className="name">
                <img src="https://i.pravatar.cc/40" alt="avatar" style={{ opacity: isActivo ? 1 : 0.45 }} />
                <div>
                    <p style={{ color: isActivo ? "" : "#94a3b8" }}>
                        {user.nombres} {user.apellidos}
                    </p>
                    <span>ID: {idPrefix}{user.id}</span>
                </div>
            </div>

            <span className="badge">{badge}</span>

            <span style={{ color: isActivo ? "" : "#94a3b8" }}>{user.email}</span>

            {extraCol !== undefined && (
                <span className="badge">{extraCol}</span>
            )}

            {/* ESTADO */}
            <span className={`status-badge ${isActivo ? "status-active" : "status-inactive"}`}>
                {isActivo ? "Activo" : "Inactivo"}
            </span>

            <div className="actions">
                {onEdit && (
                    <button className="btn-edit" title="Editar" onClick={() => onEdit(user)}>
                        <FiEdit2 />
                    </button>
                )}
                {isActivo ? (
                    <button className="btn-delete" title="Desactivar" onClick={() => onDelete(user)}>
                        <FiTrash2 />
                    </button>
                ) : (
                    <button className="btn-activate" title="Reactivar" onClick={() => onDelete(user)}>
                        <MdOutlinePersonAddAlt />
                    </button>
                )}
            </div>
        </div>
    );
}