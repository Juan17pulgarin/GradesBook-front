import { FiTrash2 } from "react-icons/fi";

export default function TeacherRow({ teacher, onDelete }) {
    return (
        <div className="table-row">
            <div className="name">
                <img src="https://i.pravatar.cc/40" alt="avatar" />
                <div>
                    <p>{teacher.nombres} {teacher.apellidos}</p>
                    <span>ID: T-{teacher.id}</span>
                </div>
            </div>
            <span className={`badge ${teacher.badgeColor || "blue"}`}>
                {teacher.materia || "Sin asignar"}
            </span>
            <span>{teacher.email}</span>
            <div className="actions">
                <button className="btn-delete" title="Eliminar" onClick={() => onDelete(teacher)}>
                    <FiTrash2 />
                </button>
            </div>
        </div>
    );
}