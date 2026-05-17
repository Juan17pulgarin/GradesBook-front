<<<<<<< HEAD
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
            <span>{teacher.correo}</span>
            <span className={teacher.activo ? "active" : "inactive"}>
                ● {teacher.activo ? "Activo" : "Inactivo"}
            </span>
            <div className="actions">
                <button className="btn-delete" title="Eliminar" onClick={() => onDelete(teacher)}>
                    <FiTrash2 />
                </button>
            </div>
=======
export default function TeacherRow({ teacher }) {

    return (
        <div className="table-row">

            <div className="name">
                <img src="https://i.pravatar.cc/40" alt="avatar" />

                <div>
                    <p>{teacher.nombres} {teacher.apellidos}</p>
                    <span>ID: {teacher.id}</span>
                </div>
            </div>

            <span className="badge blue">
                {teacher.materia || "Sin asignar"}
            </span>

            <span>{teacher.correo}</span>

            <span className={teacher.activo ? "active" : "inactive"}>
                ● {teacher.activo ? "Activo" : "Inactivo"}
            </span>

            <div className="actions">
                ✏️ 🗑️
            </div>

>>>>>>> courses-subject
        </div>
    );
}